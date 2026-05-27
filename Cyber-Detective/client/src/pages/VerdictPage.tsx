import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Award,
  Clock,
  FolderSearch,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import { DetectiveShell } from "@/components/cyber/DetectiveLayout";
import {
  CRTOverlay,
  GlitchText,
  GridBackdrop,
  ParticleField,
} from "@/components/cyber/Visual";
import { ALL_CASES, getCaseById, isCaseUnlocked } from "@/game/data";
import { useGameProfile, formatDuration } from "@/game/store";

export default function VerdictPage() {
  const [, params] = useRoute("/case/:id/verdict");
  const [, setLocation] = useLocation();
  const profile = useGameProfile();
  const caseId = params?.id ?? "";
  const caseData = getCaseById(caseId);
  const progress = profile.caseProgress[caseId];
  const culprit = caseData?.suspects.find(
    s => s.id === caseData.correctSuspectId
  );

  if (!caseData || !progress || !progress.caseSolved || !culprit) {
    return (
      <DetectiveShell>
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">
            Звіт ще не доступний
          </h1>
          <p className="text-muted-foreground mb-6">
            Цю справу ще не розкрито. Поверніться, щоб продовжити розслідування.
          </p>
          <Link href={`/case/${caseId}`}>
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" /> До справи
            </Button>
          </Link>
        </div>
      </DetectiveShell>
    );
  }

  const elapsed = (progress.endTime ?? Date.now()) - progress.startTime;
  const fastSolve = elapsed < 5 * 60 * 1000;
  const noHints = progress.hintsUsed.length === 0;
  const firstTry = progress.attempts <= 1;

  const allEvidenceUnlocked = caseData.evidence.every(e =>
    progress.unlockedEvidenceIds.includes(e.id)
  );

  const currentIdx = ALL_CASES.findIndex(c => c.id === caseId);
  const nextCase =
    currentIdx >= 0 && currentIdx < ALL_CASES.length - 1
      ? ALL_CASES[currentIdx + 1]
      : null;
  const nextUnlocked = nextCase ? isCaseUnlocked(nextCase.id, profile) : false;

  return (
    <DetectiveShell>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-emerald-500/15 py-12 md:py-16">
        <div className="absolute inset-0 -z-10 detective-hero-board opacity-55" />
        <GridBackdrop />
        <ParticleField density={30} className="opacity-40" />

        <div className="container relative z-10 py-12 md:py-16 max-w-4xl">
          <div className="text-center mb-10 animate-fade-rise">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                СПРАВУ РОЗКРИТО
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-2">
              <GlitchText className="amber-text">VERDICT</GlitchText>
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {caseData.codename} :: {caseData.title}
            </p>
          </div>

          <CRTOverlay className="rounded-lg border border-emerald-500/30 bg-card/60 p-6 md:p-8 mb-8 neon-border animate-scale-in">
            <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
              <div className="relative">
                <img
                  src={culprit.avatar}
                  alt={culprit.name}
                  className="aspect-square w-full rounded-lg border-2 border-emerald-500/40 object-cover"
                />
                <div className="absolute -top-2 -right-2 rounded border border-rose-500/60 bg-rose-500/20 px-2 py-1 backdrop-blur">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-rose-300">
                    GUILTY
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400 mb-2">
                  ВИНУВАТЦЯ ВСТАНОВЛЕНО
                </p>
                <h2 className="font-display text-3xl font-bold mb-1">
                  {culprit.name}
                </h2>
                <p className="font-mono text-sm text-cyan-400 mb-4">
                  @{culprit.nickname} · {culprit.role}
                </p>

                <div className="space-y-3">
                  <Section title="Мотив" content={culprit.motive} />
                  <Section title="Метод" content={culprit.alibi} />
                </div>
              </div>
            </div>
          </CRTOverlay>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-rise stagger-2">
            <StatBox
              icon={<Star className="h-4 w-4" />}
              label="Очки за справу"
              value={`+${progress.points}`}
              accent="amber"
            />
            <StatBox
              icon={<Clock className="h-4 w-4" />}
              label="Час розкриття"
              value={formatDuration(elapsed)}
              accent="cyan"
            />
            <StatBox
              icon={<Target className="h-4 w-4" />}
              label="Спроби"
              value={String(progress.attempts)}
              accent="rose"
            />
            <StatBox
              icon={<Trophy className="h-4 w-4" />}
              label="Загалом XP"
              value={String(profile.totalPoints)}
              accent="amber"
            />
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-card/40 p-5 mb-8 animate-fade-rise stagger-3">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400"></div>
            <div className="flex flex-wrap gap-2">
              <BonusBadge
                active={firstTry}
                icon={<Target className="h-3 w-3" />}
                label="З першої спроби"
              />
              <BonusBadge
                active={noHints}
                icon={<Sparkles className="h-3 w-3" />}
                label="Без підказок"
              />
              <BonusBadge
                active={fastSolve}
                icon={<Clock className="h-3 w-3" />}
                label="Швидко (< 5 хв)"
              />
              <BonusBadge
                active={allEvidenceUnlocked}
                icon={<Award className="h-3 w-3" />}
                label="Всі докази"
              />
              <BonusBadge
                active
                icon={<Trophy className="h-3 w-3" />}
                label={`Ранг: ${profile.rank}`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5 mb-8 animate-fade-rise stagger-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400"></div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {caseData.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-rise stagger-5">
            <Link href="/cases">
              <Button
                variant="outline"
                size="lg"
                className="border-cyan-500/40 hover:bg-cyan-500/10 font-mono uppercase tracking-wider gap-2"
              >
                <FolderSearch className="h-4 w-4" />
                Усі справи
              </Button>
            </Link>
            {nextCase && nextUnlocked && (
              <Button
                onClick={() => setLocation(`/case/${nextCase.id}`)}
                size="lg"
                className="bg-cyan-500 text-background hover:bg-cyan-400 font-mono uppercase tracking-wider gap-2 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
              >
                Наступна справа: {nextCase.title}
              </Button>
            )}
          </div>
        </div>
      </section>
    </DetectiveShell>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 mb-1">
        {title}
      </p>
      <p className="text-sm text-foreground/85 leading-relaxed">{content}</p>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "cyan" | "amber" | "rose";
}) {
  const colors = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-400",
  } as const;
  return (
    <div className={`rounded-lg border ${colors[accent]} p-4`}>
      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest opacity-80 mb-1.5">
        <span>{label}</span>
        {icon}
      </div>
      <div className="font-display text-2xl font-bold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function BonusBadge({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-[10px] gap-1"
          : "border-muted/30 bg-muted/10 text-muted-foreground/50 line-through font-mono text-[10px] gap-1"
      }
    >
      {icon}
      {label}
    </Badge>
  );
}
