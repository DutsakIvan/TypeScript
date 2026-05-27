import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Fingerprint,
  Gavel,
  Lightbulb,
  Lock,
  Mail,
  MapPinned,
  ScrollText,
  Star,
  Target,
  Terminal as TerminalIcon,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import { DetectiveShell } from "@/components/cyber/DetectiveLayout";
import { Terminal } from "@/components/cyber/Terminal";
import { EvidenceGraph } from "@/components/graph/EvidenceGraph";
import { EvidenceModal } from "@/components/cyber/EvidenceModal";
import { SuspectModal } from "@/components/cyber/SuspectModal";
import { TutorialGuide } from "@/components/cyber/TutorialGuide";
import {
  CRTOverlay,
  GridBackdrop,
  ParticleField,
} from "@/components/cyber/Visual";
import { getCaseById } from "@/game/data";
import {
  gameStore,
  useCaseTimer,
  useGameProfile,
  formatDuration,
} from "@/game/store";
import type { Evidence, InvestigationBoard, Suspect } from "@/game/types";
import { cn } from "@/lib/utils";
import { submitVerdictToServer } from "@/lib/api";
import {
  CaseTab,
  MetricBox,
  DifficultyBadge,
  SuspectCard,
  EvidenceCard,
} from "@/components/cyber/CaseUI";

export default function CasePage() {
  const [, params] = useRoute("/case/:id");
  const [, setLocation] = useLocation();
  const profile = useGameProfile();
  const caseId = params?.id ?? "";
  const caseData = getCaseById(caseId);

  useEffect(() => {
    if (!caseData) return;
    const progress = profile.caseProgress[caseId];
    if (!progress) {
      gameStore.startCase(caseId);
    }
  }, [caseId, caseData, profile.caseProgress]);

  const elapsed = useCaseTimer(caseId);

  const [tab, setTab] = useState<string>("briefing");
  const [board, setBoard] = useState<InvestigationBoard>(() =>
    loadSavedBoard(caseId)
  );
  const [evidenceModal, setEvidenceModal] = useState<Evidence | null>(null);
  const [suspectModal, setSuspectModal] = useState<Suspect | null>(null);
  const [accuseDialog, setAccuseDialog] = useState<Suspect | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  useEffect(() => {
    setBoard(loadSavedBoard(caseId));
  }, [caseId]);

  useEffect(() => {
    if (!caseData || !caseId) return;
    try {
      localStorage.setItem(
        staticBoardStorageKey(caseId),
        JSON.stringify(board)
      );
    } catch {}
  }, [board, caseData, caseId]);

  const progress = profile.caseProgress[caseId];

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">
            Справу не знайдено
          </h1>
          <Link href="/cases">
            <Button>Повернутися до архіву</Button>
          </Link>
        </div>
      </div>
    );
  }

  const unlockedIds = progress?.unlockedEvidenceIds ?? [];
  const allUnlocked = caseData.evidence.every(e => unlockedIds.includes(e.id));
  const keyEvidenceUnlocked = caseData.evidence.filter(
    e => e.isKeyEvidence && unlockedIds.includes(e.id)
  ).length;
  const totalKeyEvidence = caseData.evidence.filter(
    e => e.isKeyEvidence
  ).length;
  const points = progress?.points ?? caseData.basePoints;
  const solved = progress?.caseSolved ?? false;

  const handleUnlockEvidence = (evidenceId: string): boolean => {
    const ok = gameStore.unlockEvidence(caseId, evidenceId);
    if (ok) {
      const ev = caseData.evidence.find(e => e.id === evidenceId);
      if (ev) {
        toast.success(`Розблоковано: ${ev.title}`, {
          description: ev.shortDescription,
        });
      }
    }
    return ok;
  };

  const handleViewEvidence = (e: Evidence) => {
    setEvidenceModal(e);
    if (unlockedIds.includes(e.id)) {
      gameStore.reviewEvidence(caseId, e.id);
    }
  };

  const handleViewSuspect = (s: Suspect) => {
    setSuspectModal(s);
  };

  const handleHint = (hintId: string, cost: number) => {
    if (revealedHints.includes(hintId)) return;
    setRevealedHints(prev => [...prev, hintId]);
    gameStore.useHint(caseId, hintId, cost);
    toast(`Підказка використана. -${cost} XP`, { icon: "💡" });
  };

  const handleConfirmAccusation = async () => {
    if (!accuseDialog) return;

    const suspectId = accuseDialog.id;
    setAccuseDialog(null);

    let result: { correct: boolean; pointsEarned: number };

    try {
      const serverResult = await submitVerdictToServer({
        caseId,
        suspectId,
        attempts: progress?.attempts ?? 0,
        currentPoints: progress?.points ?? caseData.basePoints,
      });
      result = gameStore.applyServerVerdict(caseId, serverResult);
    } catch {
      result = gameStore.submitAccusation(caseId, suspectId);
    }

    if (result.correct) {
      toast.success("Звинувачення підтверджено!", {
        description: `Справу розкрито. +${result.pointsEarned} XP`,
      });
      setTimeout(() => setLocation(`/case/${caseId}/verdict`), 600);
    } else {
      toast.error("Помилкове звинувачення!", {
        description: `${result.pointsEarned} XP. Переглянь докази уважніше.`,
      });
    }
  };

  const tryDecrypt = (
    code: string
  ): { evidenceId?: string; message: string } | null => {
    const codeUpper = code.trim().toUpperCase();
    for (const e of caseData.evidence) {
      if (!e.unlockCommand) continue;
      const m = e.unlockCommand.match(/(?:unlock|decrypt)\s+(.+)/i);
      if (m && m[1].trim().toUpperCase().endsWith(codeUpper)) {
        return { evidenceId: e.id, message: `Розшифровано: ${e.title}` };
      }
    }
    return null;
  };

  return (
    <DetectiveShell>
      <SiteHeader />

      {}
      <section className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 -z-10 detective-hero-board opacity-55" />
        <GridBackdrop />
        <ParticleField density={18} className="opacity-25" />
        <div className="container relative z-10 py-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link href="/cases">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground -ml-2 gap-1"
              >
                <X className="h-3 w-3" />
                Архів
              </Button>
            </Link>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-black/35 text-amber-300 font-mono text-[10px] uppercase"
            >
              {caseData.codename}
            </Badge>
            <DifficultyBadge difficulty={caseData.difficulty} />
            {solved && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Розкрито
              </Badge>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight animate-fade-rise">
                {caseData.title}
              </h1>
              <p className="mt-2 font-mono text-sm text-muted-foreground animate-fade-rise stagger-1">
                {caseData.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 animate-fade-rise stagger-2">
              <MetricBox
                icon={<Clock className="h-3 w-3" />}
                label="Час"
                value={formatDuration(elapsed)}
                accent="cyan"
              />
              <MetricBox
                icon={<Star className="h-3 w-3" />}
                label="Очки"
                value={String(points)}
                accent="amber"
              />
              <MetricBox
                icon={<Fingerprint className="h-3 w-3" />}
                label="Ключові"
                value={`${keyEvidenceUnlocked}/${totalKeyEvidence}`}
                accent="rose"
              />
            </div>
          </div>

          {}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
              <span>Прогрес розслідування</span>
              <span>
                {unlockedIds.length}/{caseData.evidence.length} доказів
              </span>
            </div>
            <Progress
              value={(unlockedIds.length / caseData.evidence.length) * 100}
              className="h-1 [&>*]:bg-cyan-400"
            />
          </div>
        </div>
      </section>

      {}
      <section className="container py-8 flex-1">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-card/40 border border-cyan-500/15 p-1 h-auto flex overflow-x-auto whitespace-nowrap mb-6 w-full justify-start gap-1 [&::-webkit-scrollbar]:hidden">
            <CaseTab
              value="briefing"
              icon={<ScrollText className="h-3.5 w-3.5" />}
            >
              Брифінг
            </CaseTab>
            <CaseTab
              id="tab-suspects"
              value="suspects"
              icon={<Users className="h-3.5 w-3.5" />}
            >
              Підозрювані ({caseData.suspects.length})
            </CaseTab>
            <CaseTab
              id="tab-evidence"
              value="evidence"
              icon={<Eye className="h-3.5 w-3.5" />}
            >
              Докази ({unlockedIds.length}/{caseData.evidence.length})
            </CaseTab>
            <CaseTab value="messages" icon={<Mail className="h-3.5 w-3.5" />}>
              Листування
            </CaseTab>
            <CaseTab
              id="tab-graph"
              value="board"
              icon={<MapPinned className="h-3.5 w-3.5" />}
            >
              Дошка
            </CaseTab>
            <CaseTab
              id="tab-terminal"
              value="terminal"
              icon={<TerminalIcon className="h-3.5 w-3.5" />}
            >
              Термінал
            </CaseTab>
            <CaseTab
              id="tab-accusation"
              value="accusation"
              icon={<Gavel className="h-3.5 w-3.5" />}
            >
              Звинувачення
            </CaseTab>
          </TabsList>

          <TabsContent value="briefing" className="mt-0 animate-fade-rise">
            <div className="grid gap-6 lg:grid-cols-3">
              <CRTOverlay className="lg:col-span-2 rounded-lg border border-cyan-500/20 bg-card/50 p-6 neon-border">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                  <ScrollText className="h-3 w-3" />
                  CLASSIFIED BRIEFING
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
                  {caseData.briefing}
                </pre>
              </CRTOverlay>

              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400">
                    <Lightbulb className="h-3 w-3" /> ПІДКАЗКИ
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Кожна підказка коштує очок репутації.
                  </p>
                  <div className="space-y-2">
                    {caseData.hints.map(h => {
                      const used = revealedHints.includes(h.id);
                      return (
                        <button
                          key={h.id}
                          onClick={() => handleHint(h.id, h.cost)}
                          disabled={used}
                          className={cn(
                            "block w-full text-left rounded border px-3 py-2 transition-all",
                            used
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                              : "border-amber-500/20 bg-card/40 hover:border-amber-500/50 hover:bg-card/70"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                              {used ? "Використано" : `Розкрити (-${h.cost})`}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-foreground/85">
                            {used ? h.text : "••••••••••••••••••••••••••••••••"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-500/20 bg-card/40 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                    <Target className="h-3 w-3" /> ЦІЛЬ
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    Розблокуйте всі ключові докази, проаналізуйте підозрюваних
                    та висуньте обґрунтоване звинувачення проти однієї особи.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suspects" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {caseData.suspects.map((s, i) => (
                <SuspectCard
                  key={s.id}
                  suspect={s}
                  delay={i * 60}
                  onClick={() => handleViewSuspect(s)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="mt-0">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {caseData.evidence.map((e, i) => (
                <EvidenceCard
                  key={e.id}
                  evidence={e}
                  delay={i * 50}
                  unlocked={unlockedIds.includes(e.id)}
                  onClick={() => handleViewEvidence(e)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <div className="rounded-lg border border-cyan-500/20 bg-card/40 overflow-hidden">
              <div className="border-b border-cyan-500/15 bg-cyan-500/5 px-5 py-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400"></div>
              </div>
              <ScrollArea className="max-h-[600px]">
                <div className="p-5 space-y-3">
                  {caseData.messages.map((m, i) => (
                    <div
                      key={m.id}
                      className={cn(
                        "rounded border p-3.5 animate-fade-rise",
                        m.suspicious
                          ? "border-rose-500/30 bg-rose-500/5"
                          : "border-cyan-500/15 bg-card/50"
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400">{m.sender}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-foreground">{m.receiver}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        "{m.content}"
                      </p>
                      {m.suspicious && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> SUSPICIOUS
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="board" className="mt-0">
            <div className="mb-5 rounded-xl border border-amber-500/25 bg-black/45 p-5 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300">
                <MapPinned className="h-3.5 w-3.5" />
                Особиста дошка дедукції
              </div>
              <h3 className="font-display text-2xl font-bold text-stone-50">
                З’єднуйте підозрюваних, докази та власні гіпотези
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-400">
                Це MVP детективної дошки прямо всередині статичної справи.
                Відкриті докази автоматично з’являються на полотні. Перемикайте
                режими Move, Connect і Note, додавайте підписи до зв’язків та
                зберігайте власну логіку розслідування. Стан дошки зберігається
                локально для кожної справи окремо.
              </p>
            </div>
            <div className="h-[450px] md:h-[680px] rounded-2xl border border-red-500/25 bg-black/60 p-2 shadow-2xl shadow-red-950/30">
              <EvidenceGraph
                suspects={caseData.suspects}
                evidence={caseData.evidence}
                unlockedEvidenceIds={unlockedIds}
                board={board}
                onBoardUpdate={setBoard}
              />
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="mt-0">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Terminal
                caseData={caseData}
                unlockedEvidenceIds={unlockedIds}
                onUnlockEvidence={handleUnlockEvidence}
                onTryDecrypt={tryDecrypt}
              />
              <div className="space-y-4">
                <div className="rounded-lg border border-cyan-500/20 bg-card/40 p-4">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                    КОМАНДИ ЦІЄЇ СПРАВИ
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono">
                    {caseData.terminalCommands
                      .filter(
                        c => c.command !== "help" && c.command !== "clear"
                      )
                      .map(c => (
                        <li key={c.command} className="flex items-start gap-2">
                          <span className="text-cyan-400 shrink-0">$</span>
                          <span className="text-foreground/80">
                            {c.command}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400">
                    ПОРАДА
                  </div>
                  <p className="text-xs text-foreground/85 leading-relaxed">
                    Використовуйте клавіші{" "}
                    <kbd className="rounded border border-cyan-500/30 bg-card px-1 font-mono">
                      ↑
                    </kbd>{" "}
                    /{" "}
                    <kbd className="rounded border border-cyan-500/30 bg-card px-1 font-mono">
                      ↓
                    </kbd>{" "}
                    для історії команд та{" "}
                    <kbd className="rounded border border-cyan-500/30 bg-card px-1 font-mono">
                      Tab
                    </kbd>{" "}
                    для автодоповнення.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accusation" className="mt-0">
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400">
                <Gavel className="h-3 w-3" /> ФІНАЛЬНЕ РІШЕННЯ
              </div>
              <h3 className="mb-1.5 font-display text-xl font-bold">
                Висуньте звинувачення
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Оберіть особу, яку ви вважаєте винною. Помилка коштує очок.
              </p>
              {!allUnlocked && (
                <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 font-mono">
                  ⚠ Розблоковано {unlockedIds.length} з{" "}
                  {caseData.evidence.length} доказів. Рекомендуємо спочатку
                  відкрити всі.
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {caseData.suspects.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setAccuseDialog(s)}
                  disabled={solved}
                  className="group relative rounded-lg border border-cyan-500/20 bg-card/40 p-4 transition-all hover:border-rose-500/50 hover:bg-card/60 text-left animate-fade-rise disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="aspect-square w-full rounded border border-cyan-500/20 object-cover mb-3 grayscale group-hover:grayscale-0 transition-all"
                  />
                  <p className="font-display font-semibold text-sm leading-tight">
                    {s.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    @{s.nickname}
                  </p>
                  <div className="mt-3 rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-rose-400 group-hover:bg-rose-500/15 transition-colors">
                    Звинуватити
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <EvidenceModal
        open={evidenceModal !== null}
        onOpenChange={o => !o && setEvidenceModal(null)}
        evidence={
          evidenceModal
            ? {
                ...evidenceModal,
                status: unlockedIds.includes(evidenceModal.id)
                  ? "open"
                  : evidenceModal.status,
              }
            : null
        }
        suspect={
          evidenceModal?.pointsToSuspectId
            ? caseData.suspects.find(
                s => s.id === evidenceModal.pointsToSuspectId
              )
            : undefined
        }
      />

      <SuspectModal
        open={suspectModal !== null}
        onOpenChange={o => !o && setSuspectModal(null)}
        suspect={suspectModal}
        relatedEvidence={
          suspectModal
            ? caseData.evidence.filter(e =>
                suspectModal.relatedEvidenceIds.includes(e.id)
              )
            : []
        }
        onOpenEvidence={e => {
          setSuspectModal(null);
          setTimeout(() => handleViewEvidence(e), 200);
        }}
      />

      <AlertDialog
        open={accuseDialog !== null}
        onOpenChange={o => !o && setAccuseDialog(null)}
      >
        <AlertDialogContent className="border-rose-500/40 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              <Gavel className="h-5 w-5 text-rose-400" /> Висунути звинувачення?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ви звинувачуєте{" "}
              <span className="font-bold text-foreground">
                {accuseDialog?.name}
              </span>{" "}
              <span className="font-mono text-cyan-400">
                (@{accuseDialog?.nickname})
              </span>{" "}
              у скоєнні цього злочину. Помилка коштуватиме очок репутації. Ви
              впевнені?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAccusation}
              className="bg-rose-500 hover:bg-rose-400 text-background font-mono uppercase tracking-wider"
            >
              Висунути звинувачення
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TutorialGuide caseId={caseId} activeSection={tab} />
    </DetectiveShell>
  );
}

function staticBoardStorageKey(caseId: string) {
  return `cyber_detective_static_board_${caseId}`;
}

function loadSavedBoard(caseId: string): InvestigationBoard {
  if (!caseId || typeof localStorage === "undefined") {
    return { nodes: [], edges: [], notes: [] };
  }

  try {
    const saved = localStorage.getItem(staticBoardStorageKey(caseId));
    if (!saved) return { nodes: [], edges: [], notes: [] };
    const parsed = JSON.parse(saved) as Partial<InvestigationBoard>;
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { nodes: [], edges: [], notes: [] };
  }
}
