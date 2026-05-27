import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  Fingerprint,
  Gavel,
  Lightbulb,
  Mail,
  Map,
  RefreshCw,
  ScrollText,
  Star,
  Target,
  Terminal as TerminalIcon,
  Users,
  Wrench,
  X,
  MessageSquare,
  Loader2,
  Sparkles,
  Pause,
  Play,
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
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import { DetectiveShell } from "@/components/cyber/DetectiveLayout";
import { Terminal } from "@/components/cyber/Terminal";
import { EvidenceModal } from "@/components/cyber/EvidenceModal";
import { SuspectModal } from "@/components/cyber/SuspectModal";
import {
  CRTOverlay,
  GridBackdrop,
  ParticleField,
} from "@/components/cyber/Visual";
import { ForensicToolkit } from "@/components/tools";
import { EvidenceGraph } from "@/components/graph";
import { ResourceBar } from "@/components/economy/ResourceBar";
import { InterrogationTab } from "@/components/cyber/InterrogationTab";
import { UpgradeShop } from "@/components/economy/UpgradeShop";
import { DynamicEventPanel } from "@/components/events";
import { generateCase } from "@/game/procedural";
import {
  consumeCPU,
  earnCredits,
  resetCPU,
  DEFAULT_ECONOMY,
} from "@/game/economy";
import { gameStore, useGameProfile, formatDuration } from "@/game/store";
import type {
  InvestigationCase,
  CipherPuzzle,
  NetworkLogChallenge,
  SteganographyChallenge,
  DynamicEvent,
  EconomyState,
  InvestigationBoard,
  Evidence,
  Suspect,
} from "@/game/types";
import { cn } from "@/lib/utils";
import {
  CaseTab,
  MetricBox,
  DifficultyBadge,
  SuspectCard,
  EvidenceCard,
} from "@/components/cyber/CaseUI";

export default function ProceduralCasePage() {
  const profile = useGameProfile();
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [tab, setTab] = useState<string>("briefing");
  const [showShop, setShowShop] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState("");
  const [economy, setEconomy] = useState<EconomyState>(
    profile.economy ?? DEFAULT_ECONOMY
  );
  const [board, setBoard] = useState<InvestigationBoard>({
    nodes: [],
    edges: [],
    notes: [],
  });
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [cipherPuzzles, setCipherPuzzles] = useState<CipherPuzzle[]>([]);
  const [networkChallenges, setNetworkChallenges] = useState<
    NetworkLogChallenge[]
  >([]);
  const [stegoChallenges, setStegoChallenges] = useState<
    SteganographyChallenge[]
  >([]);
  const [dynamicEvents, setDynamicEvents] = useState<DynamicEvent[]>([]);
  const [solved, setSolved] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const [evidenceModal, setEvidenceModal] = useState<Evidence | null>(null);
  const [suspectModal, setSuspectModal] = useState<Suspect | null>(null);
  const [accuseDialog, setAccuseDialog] = useState<Suspect | null>(null);
  const [endGameState, setEndGameState] = useState<"won" | "lost" | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [eventMisses, setEventMisses] = useState(0);

  const PROCEDURAL_SAVE_KEY = "cyber_detective_procedural_save";

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!solved) {
        setIsPaused(document.hidden);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [solved]);

  useEffect(() => {
    if (isPaused || solved) return;
    const t = setInterval(() => setElapsed(prev => prev + 1000), 1000);
    return () => clearInterval(t);
  }, [isPaused, solved]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROCEDURAL_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.caseData) {
          setCaseData(parsed.caseData);
          setUnlockedIds(parsed.unlockedIds || []);
          setCipherPuzzles(parsed.cipherPuzzles || []);
          setNetworkChallenges(parsed.networkChallenges || []);
          setStegoChallenges(parsed.stegoChallenges || []);
          setDynamicEvents(parsed.dynamicEvents || []);
          setSolved(parsed.solved || false);
          setEndGameState(parsed.endGameState || null);
          setStartTime(parsed.startTime || Date.now());
          setBoard(parsed.board || { nodes: [], edges: [], notes: [] });
          setElapsed(Date.now() - (parsed.startTime || Date.now()));
          return;
        }
      }
    } catch {}
    generateNewCase();
  }, []);

  useEffect(() => {
    if (!caseData) return;
    try {
      localStorage.setItem(
        PROCEDURAL_SAVE_KEY,
        JSON.stringify({
          caseData,
          unlockedIds,
          cipherPuzzles,
          networkChallenges,
          stegoChallenges,
          dynamicEvents,
          solved,
          startTime,
          board,
        })
      );
    } catch {}
  }, [
    caseData,
    unlockedIds,
    cipherPuzzles,
    networkChallenges,
    stegoChallenges,
    dynamicEvents,
    solved,
    startTime,
    board,
  ]);

  function generateNewCase() {
    const diffOptions = ["easy", "medium", "hard", "extreme"] as const;
    const difficulty =
      diffOptions[Math.floor(Math.random() * diffOptions.length)];
    const newCase = generateCase(undefined, difficulty as any);
    setCaseData(newCase);
    setUnlockedIds(
      newCase.evidence.filter(e => e.status === "open").map(e => e.id)
    );
    setCipherPuzzles(newCase.cipherPuzzles ?? []);
    setNetworkChallenges(newCase.networkChallenges ?? []);
    setStegoChallenges(newCase.stegoChallenges ?? []);
    setDynamicEvents(newCase.dynamicEvents ?? []);
    setBoard({ nodes: [], edges: [], notes: [] });
    setSolved(false);
    setEndGameState(null);
    setEventMisses(0);
    setTab("briefing");
    setEconomy(prev => resetCPU(prev));
    setStartTime(Date.now());
    setElapsed(0);
    gameStore.incrementGenerated();
  }

  const handleGenerateWithDelay = () => {
    setIsGenerating(true);
    setGenStage("АНАЛІЗ БАЗ ДАНИХ...");

    setTimeout(() => {
      setGenStage("ФОРМУВАННЯ ПІДОЗРЮВАНИХ...");
    }, 1000);

    setTimeout(() => {
      setGenStage("ШИФРУВАННЯ ДОКАЗІВ...");
    }, 2000);

    setTimeout(() => {
      generateNewCase();
      setIsGenerating(false);
    }, 3500);
  };

  const handleUseCPU = useCallback(
    (amount: number): boolean => {
      const result = consumeCPU(economy, amount);
      if (!result) {
        toast.error("Недостатньо CPU Cycles!");
        return false;
      }
      setEconomy(result);
      gameStore.updateEconomy(result);
      return true;
    },
    [economy]
  );

  function handleCipherSolved(puzzleId: string) {
    setCipherPuzzles(prev =>
      prev.map(p => (p.id === puzzleId ? { ...p, solved: true } : p))
    );
    const reward = 50;
    setEconomy(prev => earnCredits(prev, reward));
    gameStore.addCredits(reward);
    toast.success(
      `Шифр розгадано! Отримано пароль для терміналу. +${reward} ₿`
    );
  }

  function handleNetworkSolved(challengeId: string) {
    setNetworkChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, solved: true } : c))
    );
    const reward = 100;
    setEconomy(prev => earnCredits(prev, reward));
    gameStore.addCredits(reward);
    toast.success(
      `Аномалії виявлено! Отримано пароль для терміналу. +${reward} ₿`
    );
  }

  function handleStegoSolved(challengeId: string) {
    setStegoChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, solved: true } : c))
    );
    const challenge = stegoChallenges.find(c => c.id === challengeId);
    if (challenge?.relatedEvidenceId) {
      handleUnlockEvidence(challenge.relatedEvidenceId);
    }
    const reward = 100;
    setEconomy(prev => earnCredits(prev, reward));
    gameStore.addCredits(reward);
    toast.success(`Приховані дані знайдено! +${reward} ₿`);
  }

  function handleUnlockEvidence(evidenceId: string) {
    if (!unlockedIds.includes(evidenceId)) {
      setUnlockedIds(prev => [...prev, evidenceId]);
      const ev = caseData?.evidence.find(e => e.id === evidenceId);
      if (ev) {
        toast.success(`Розблоковано: ${ev.title}`);
      }
    }
  }

  function handleEventResolved(eventId: string, success: boolean) {
    setDynamicEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, resolved: true } : e))
    );
    if (success) {
      const event = dynamicEvents.find(e => e.id === eventId);
      const reward = event?.reward ?? 30;
      setEconomy(prev => earnCredits(prev, reward));
      gameStore.addCredits(reward);
    } else {
      const newMisses = eventMisses + 1;
      setEventMisses(newMisses);
      if (newMisses > 3) {
        const penalty = 20;
        setEconomy(prev => ({
          ...prev,
          credits: Math.max(0, prev.credits - penalty),
        }));
        toast.error(`Штраф за ігнорування! -${penalty} ₿`, {
          description: "Ви занадто часто пропускаєте сигнали.",
        });
      }
    }
  }

  const handleAccuse = (suspect: Suspect) => {
    if (!caseData || solved) return;

    setAccuseDialog(null);
    setSolved(true);

    if (suspect.id === caseData.correctSuspectId) {
      setEndGameState("won");
      const baseReward =
        caseData.difficulty === "hard"
          ? 300
          : caseData.difficulty === "medium"
            ? 200
            : 150;
      setEconomy(prev => earnCredits(prev, baseReward));
      gameStore.addCredits(baseReward);
      gameStore.incrementStreak();
      toast.success(`Справу розкрито! +${baseReward} ₿`, {
        description: "Чудова робота!",
      });
    } else {
      setEndGameState("lost");
      const penalty = 50;
      setEconomy(prev => ({
        ...prev,
        credits: Math.max(0, prev.credits - penalty),
      }));
      gameStore.resetStreak();
      toast.error("Ви помилилися!", { description: `-${penalty} ₿` });
    }
  };

  function handleShopPurchase(newEconomy: EconomyState) {
    setEconomy(newEconomy);
    gameStore.updateEconomy(newEconomy);
  }

  const tryDecrypt = (
    code: string
  ): { evidenceId?: string; message: string } | null => {
    if (!caseData) return null;
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

  const handleViewEvidence = (e: Evidence) => {
    setEvidenceModal(e);
  };

  const handleViewSuspect = (s: Suspect) => {
    setSuspectModal(s);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse text-cyan-400 font-mono">
          Генерація справи...
        </div>
      </div>
    );
  }

  const keyEvidenceUnlocked = caseData.evidence.filter(
    e => e.isKeyEvidence && unlockedIds.includes(e.id)
  ).length;
  const totalKeyEvidence = caseData.evidence.filter(
    e => e.isKeyEvidence
  ).length;
  const allUnlocked = caseData.evidence.every(e => unlockedIds.includes(e.id));

  return (
    <DetectiveShell>
      <SiteHeader />

      {}
      <section className="relative overflow-hidden border-b border-cyan-500/20">
        <div className="absolute inset-0 -z-10 detective-hero-board opacity-55" />
        <GridBackdrop />
        <ParticleField density={18} className="opacity-40" />
        <div className="container relative z-10 py-8">
          {isGenerating && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg border border-cyan-500/30 bg-black/60 shadow-2xl">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
                <h2 className="font-display text-xl text-stone-100 tracking-wider">
                  СИСТЕМА ШІ ПРАЦЮЄ
                </h2>
                <p className="font-mono text-sm uppercase text-cyan-400 animate-pulse">
                  {genStage}
                </p>
              </div>
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link href="/cases">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground -ml-2 gap-1"
              >
                <X className="h-3 w-3" /> Архів
              </Button>
            </Link>
            <Badge
              variant="outline"
              className="border-purple-500/40 text-purple-400 font-mono text-[10px] uppercase"
            >
              GENERATED
            </Badge>
            <DifficultyBadge difficulty={caseData.difficulty} />
            {solved && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> Розкрито
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-amber-500/40 text-amber-400 font-mono text-[10px]"
            >
              СЕРІЯ: {profile.streak}
            </Badge>
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
                label="Кредити"
                value={String(economy.credits)}
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

          {}
          <div className="mt-4">
            <ResourceBar
              economy={economy}
              onOpenShop={() => setShowShop(true)}
            />
          </div>

          {}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono"
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={handleGenerateWithDelay}
              disabled={isGenerating}
              className="bg-cyan-600/80 hover:bg-cyan-500 text-white border border-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.3)] font-mono tracking-widest px-8"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isGenerating
                ? "СИСТЕМА ШІ ПРАЦЮЄ..."
                : "ЗГЕНЕРУВАТИ НОВУ СПРАВУ (ШІ)"}
            </Button>
          </div>
        </div>
      </section>

      {}
      <section className="container py-8 flex-1">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-card/40 border border-cyan-500/15 p-1 h-auto flex-wrap mb-6 w-full justify-start gap-1">
            <CaseTab
              value="briefing"
              icon={<ScrollText className="h-3.5 w-3.5" />}
            >
              Брифінг
            </CaseTab>
            <CaseTab value="suspects" icon={<Users className="h-3.5 w-3.5" />}>
              Підозрювані ({caseData.suspects.length})
            </CaseTab>
            <CaseTab
              value="interrogation"
              icon={<MessageSquare className="h-3.5 w-3.5" />}
            >
              Допит
            </CaseTab>
            <CaseTab value="evidence" icon={<Eye className="h-3.5 w-3.5" />}>
              Докази ({unlockedIds.length}/{caseData.evidence.length})
            </CaseTab>
            <CaseTab value="messages" icon={<Mail className="h-3.5 w-3.5" />}>
              Листування
            </CaseTab>
            <CaseTab
              value="terminal"
              icon={<TerminalIcon className="h-3.5 w-3.5" />}
            >
              Термінал
            </CaseTab>
            <CaseTab value="tools" icon={<Wrench className="h-3.5 w-3.5" />}>
              Прилади
            </CaseTab>
            <CaseTab value="graph" icon={<Map className="h-3.5 w-3.5" />}>
              Граф
            </CaseTab>
            <CaseTab
              value="accusation"
              icon={<Gavel className="h-3.5 w-3.5" />}
            >
              Звинувачення
            </CaseTab>
          </TabsList>

          {}
          <TabsContent value="briefing" className="mt-0 animate-fade-rise">
            <div className="grid gap-6 lg:grid-cols-3">
              <CRTOverlay className="lg:col-span-2 rounded-lg border border-cyan-500/20 bg-card/50 p-6 neon-border">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                  <ScrollText className="h-3 w-3" /> CLASSIFIED BRIEFING
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
                  {caseData.briefing}
                </pre>
              </CRTOverlay>
              <div className="space-y-4">
                <div className="rounded-lg border border-cyan-500/20 bg-card/40 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                    <Target className="h-3 w-3" /> ЦІЛЬ
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    Розблокуйте всі ключові докази, аналізуйте підозрюваних та
                    використовуйте прилади для розкриття злочину.
                  </p>
                </div>
                {solved && (
                  <button
                    onClick={generateNewCase}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 font-mono text-sm hover:bg-green-500/20 transition-all"
                  >
                    <RefreshCw className="h-4 w-4" /> НОВА СПРАВА
                  </button>
                )}
              </div>
            </div>
          </TabsContent>

          {}
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

          {}
          <TabsContent value="interrogation" className="mt-0">
            <InterrogationTab caseData={caseData} />
          </TabsContent>

          {}
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

          {}
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

          {}
          <TabsContent value="terminal" className="mt-0">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Terminal
                caseData={caseData}
                unlockedEvidenceIds={unlockedIds}
                onUnlockEvidence={id => {
                  handleUnlockEvidence(id);
                  return true;
                }}
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
              </div>
            </div>
          </TabsContent>

          {}
          <TabsContent value="tools" className="mt-0">
            <div className="h-[600px]">
              <ForensicToolkit
                cipherPuzzles={cipherPuzzles}
                networkChallenges={networkChallenges}
                stegoChallenges={stegoChallenges}
                economy={economy}
                onCipherSolved={handleCipherSolved}
                onNetworkSolved={handleNetworkSolved}
                onStegoSolved={handleStegoSolved}
                onUseCPU={handleUseCPU}
              />
            </div>
          </TabsContent>

          {}
          <TabsContent value="graph" className="mt-0">
            <div className="h-[600px]">
              <EvidenceGraph
                suspects={caseData.suspects}
                evidence={caseData.evidence}
                unlockedEvidenceIds={unlockedIds}
                board={board}
                onBoardUpdate={setBoard}
              />
            </div>
          </TabsContent>

          {}
          <TabsContent value="accusation" className="mt-0">
            {solved ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center animate-fade-rise flex flex-col items-center justify-center min-h-[400px]">
                <CheckCircle2 className="mb-6 h-20 w-20 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                <h2 className="font-display mb-2 text-4xl font-bold text-emerald-400 uppercase tracking-wider">
                  Справу розкрито
                </h2>
                <p className="mb-8 text-lg text-emerald-500/80 max-w-lg mx-auto">
                  Злочинця успішно затримано. Ви заробили кредити та підвищили
                  свій рейтинг детектива.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={generateNewCase}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Наступна справа
                  </Button>
                  <Link href="/cases">
                    <Button
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 uppercase tracking-widest px-8"
                    >
                      В архів
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400">
                    <Gavel className="h-3 w-3" /> ФІНАЛЬНЕ РІШЕННЯ
                  </div>
                  <h3 className="mb-1.5 font-display text-xl font-bold">
                    Висуньте звинувачення
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Оберіть особу, яку ви вважаєте винною. Помилка коштує
                    кредитів.
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
              </>
            )}
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
              у скоєнні цього злочину. Помилка коштуватиме кредитів. Ви
              впевнені?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => accuseDialog && handleAccuse(accuseDialog)}
              className="bg-rose-500 hover:bg-rose-400 text-background font-mono uppercase tracking-wider"
            >
              Висунути звинувачення
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {}
      <DynamicEventPanel
        events={dynamicEvents}
        economy={economy}
        onEventResolved={handleEventResolved}
        onTriggerEvent={() => {}}
        isPaused={isPaused}
        missCount={eventMisses}
      />

      {}
      <UpgradeShop
        economy={economy}
        onPurchase={handleShopPurchase}
        isOpen={showShop}
        onClose={() => setShowShop(false)}
      />

      {}
      {isPaused && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Pause className="h-20 w-20 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-4xl font-mono text-cyan-400 font-bold mb-8">
              ГРА НА ПАУЗІ
            </h2>
            <Button
              onClick={() => setIsPaused(false)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xl px-12 py-8 shadow-[0_0_30px_rgba(8,145,178,0.5)]"
            >
              <Play className="mr-2 h-6 w-6" /> ПРОДОВЖИТИ
            </Button>
          </div>
        </div>
      )}

      {}
      {endGameState && caseData && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-500">
          <div
            className={`max-w-2xl w-full border-2 rounded-lg p-8 bg-gray-950 ${
              endGameState === "won"
                ? "border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                : "border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            }`}
          >
            <h2
              className={`text-4xl font-mono font-bold text-center mb-6 ${endGameState === "won" ? "text-green-400" : "text-red-500"}`}
            >
              {endGameState === "won"
                ? "СПРАВУ РОЗКРИТО!"
                : "СПРАВУ ПРОВАЛЕНО!"}
            </h2>

            <div className="space-y-6 text-gray-300 font-mono text-sm">
              <div className="p-4 bg-gray-900 rounded border border-gray-800 shadow-inner">
                <h3 className="text-xl text-cyan-400 mb-4 font-bold tracking-widest">
                  СПРАВЖНІЙ ЗЛОЧИНЕЦЬ:
                </h3>
                {(() => {
                  const realCulprit = caseData.suspects.find(
                    s => s.id === caseData.correctSuspectId
                  );
                  return realCulprit ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={realCulprit.avatar}
                          alt={realCulprit.name}
                          className="w-16 h-16 rounded border border-cyan-500/30 object-cover"
                        />
                        <div>
                          <p className="text-lg text-white font-bold">
                            {realCulprit.name}{" "}
                            <span className="text-cyan-500 font-normal">
                              (@{realCulprit.nickname})
                            </span>
                          </p>
                          <p className="text-gray-400">{realCulprit.role}</p>
                        </div>
                      </div>
                      <div className="bg-black/50 p-3 rounded border border-gray-800">
                        <p>
                          <span className="text-cyan-400 font-bold">
                            МОТИВ:
                          </span>{" "}
                          {realCulprit.motive}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {endGameState === "lost" && (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded text-red-200">
                  <p>
                    Ви звинуватили невинну людину. Справжній злочинець встиг
                    знищити сліди і втекти.
                  </p>
                </div>
              )}

              {}
              <div className="p-4 bg-gray-900 rounded border border-gray-800 space-y-4">
                <h3 className="text-xl text-cyan-400 mb-2 font-bold tracking-widest">
                  АНАЛІЗ РОБОТИ:
                </h3>

                {(() => {
                  const unsolvedCiphers = cipherPuzzles.filter(p => !p.solved);
                  const unsolvedNetworks = networkChallenges.filter(
                    p => !p.solved
                  );
                  const unsolvedStegos = stegoChallenges.filter(p => !p.solved);
                  const missedLockedEvidence = caseData.evidence.filter(
                    e => e.status === "locked" && e.isKeyEvidence
                  );

                  if (
                    unsolvedCiphers.length === 0 &&
                    unsolvedNetworks.length === 0 &&
                    unsolvedStegos.length === 0 &&
                    missedLockedEvidence.length === 0
                  ) {
                    return (
                      <p className="text-green-400 font-bold">
                        Ідеальна робота! Ви зібрали всі можливі докази і
                        розв'язали всі головоломки.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <p
                        className={
                          endGameState === "won"
                            ? "text-amber-400"
                            : "text-gray-400"
                        }
                      >
                        {endGameState === "won"
                          ? "Ви змогли знайти злочинця, але пропустили деякі ключові докази:"
                          : "Докази, які ви пропустили і які могли б допомогти:"}
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                        {unsolvedCiphers.length > 0 && (
                          <li>
                            <span className="text-red-400 font-bold">
                              Нерозгадані шифри ({unsolvedCiphers.length}):
                            </span>{" "}
                            Слід було уважніше читати чати та використовувати
                            дешифратор.
                          </li>
                        )}
                        {unsolvedNetworks.length > 0 && (
                          <li>
                            <span className="text-red-400 font-bold">
                              Пропущений мережевий трафік:
                            </span>{" "}
                            Слід було використати аналізатор пакетів.
                          </li>
                        )}
                        {unsolvedStegos.length > 0 && (
                          <li>
                            <span className="text-red-400 font-bold">
                              Не проаналізовані зображення:
                            </span>{" "}
                            Стеганографія могла б дати більше доказів.
                          </li>
                        )}
                        {missedLockedEvidence.length > 0 &&
                          missedLockedEvidence.map(e => (
                            <li key={e.id}>
                              <span className="text-red-400 font-bold">
                                Заблокований доказ "{e.title}":
                              </span>{" "}
                              Щоб його отримати, треба було{" "}
                              {e.unlockCommand
                                ? `ввести команду \`${e.unlockCommand}\` у терміналі`
                                : "скористатися відповідним приладом"}
                              .
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-center mt-8 pt-4">
                <Button
                  onClick={() => {
                    setEndGameState(null);
                    handleGenerateWithDelay();
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono px-8 py-6 text-lg w-full border border-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.5)]"
                >
                  РОЗПОЧАТИ НОВУ СПРАВУ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DetectiveShell>
  );
}
