import { Link } from "wouter";
import {
  Award,
  CheckCircle2,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Target,
  Terminal as TerminalIcon,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import { DetectiveShell } from "@/components/cyber/DetectiveLayout";
import { GridBackdrop, ParticleField } from "@/components/cyber/Visual";
import {
  ACHIEVEMENTS,
  ALL_CASES,
  RANKS,
  getNextRank,
  getRankForPoints,
} from "@/game/data";
import { gameStore, useGameProfile, formatDuration } from "@/game/store";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
  Shield,
  Terminal: TerminalIcon,
};

const BADGE_EMBLEM =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/badge-emblem-WKxYHosPMpvqZtvJ9iPxuF.webp";

export default function ProfilePage() {
  const profile = useGameProfile();
  const currentRank = getRankForPoints(profile.totalPoints);
  const next = getNextRank(profile.totalPoints);
  const currentRankIdx = RANKS.findIndex(r => r.name === currentRank);
  const currentRankObj = RANKS[currentRankIdx >= 0 ? currentRankIdx : 0];
  const progressToNext = next
    ? ((profile.totalPoints - currentRankObj.minPoints) /
        (next.minPoints - currentRankObj.minPoints)) *
      100
    : 100;

  return (
    <DetectiveShell>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-cyan-500/15">
        <div className="absolute inset-0 -z-10 detective-hero-board opacity-55" />
        <GridBackdrop />
        <ParticleField density={20} className="opacity-40" />

        <div className="container relative z-10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
            <div className="text-center md:text-left animate-fade-rise">
              <div className="inline-block relative mb-4">
                <img
                  src={BADGE_EMBLEM}
                  alt="Cyber Unit Badge"
                  className="w-44 mx-auto md:mx-0 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                />
                <div className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-2xl -z-10" />
              </div>
            </div>

            <div className="animate-fade-rise stagger-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400 mb-2"></p>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-1">
                Agent 07
              </h1>
              <p className="font-mono text-cyan-400 text-sm mb-5">
                @cyber-unit · Digital Forensics Division
              </p>

              <div className="rounded-lg border border-cyan-500/20 bg-card/40 p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400">
                      Поточний ранг
                    </p>
                    <p className="font-display text-2xl font-bold amber-text">
                      {currentRank}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currentRankObj.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                      Загалом XP
                    </p>
                    <p className="font-display text-3xl font-bold text-cyan-400 tabular-nums">
                      {profile.totalPoints.toLocaleString()}
                    </p>
                  </div>
                </div>

                {next ? (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                      <span>Прогрес до: {next.name}</span>
                      <span>
                        {profile.totalPoints} / {next.minPoints} XP
                      </span>
                    </div>
                    <Progress
                      value={progressToNext}
                      className="h-1.5 [&>*]:bg-gradient-to-r [&>*]:from-cyan-400 [&>*]:to-amber-400"
                    />
                  </>
                ) : (
                  <p className="text-center text-sm font-mono text-amber-300">
                    🏆 Максимальний ранг досягнуто!
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/cases">
                  <Button
                    size="lg"
                    className="bg-cyan-500 text-background hover:bg-cyan-400 font-mono uppercase tracking-wider"
                  >
                    Розпочати справу
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-mono uppercase tracking-wider gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Скинути прогрес
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Скинути весь прогрес?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Усі рішення, очки, звання та досягнення будуть видалені.
                        Дію неможливо скасувати.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => gameStore.resetAll()}
                        className="bg-rose-500 hover:bg-rose-400"
                      >
                        Скинути все
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="container py-12">
        <h2 className="font-display text-2xl font-bold mb-1">Журнал справ</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Розкрито {profile.casesSolved.length} з {ALL_CASES.length} справ
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {ALL_CASES.map((c, i) => {
            const cp = profile.caseProgress[c.id];
            const solved = profile.casesSolved.includes(c.id);
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded border p-4 animate-fade-rise",
                  solved
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : cp
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-cyan-500/15 bg-card/30"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {c.codename}
                  </span>
                  {solved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : cp ? (
                    <Star className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display text-sm font-semibold mb-1 leading-tight">
                  {c.title}
                </h3>
                {cp && (
                  <div className="space-y-0.5 mt-2 text-[11px] font-mono">
                    <Row label="Очки" value={`${cp.points}`} />
                    {cp.endTime && (
                      <Row
                        label="Час"
                        value={formatDuration(cp.endTime - cp.startTime)}
                      />
                    )}
                    <Row
                      label="Доказів"
                      value={`${cp.unlockedEvidenceIds.length}/${c.evidence.length}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {}
      <section className="container py-12 border-t border-cyan-500/15">
        <h2 className="font-display text-2xl font-bold mb-1">Досягнення</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {profile.unlockedAchievements.length} / {ACHIEVEMENTS.length} відкрито
        </p>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a, i) => {
            const Icon = ICON_MAP[a.icon] ?? Award;
            const unlocked = profile.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={cn(
                  "flex gap-3 rounded border p-3 animate-fade-rise transition-all",
                  unlocked
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-muted/20 bg-card/20 opacity-50"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded border",
                    unlocked
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-muted/30 bg-card/40 text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-display text-sm font-semibold leading-tight",
                      !unlocked && "text-muted-foreground"
                    )}
                  >
                    {a.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {}
      <section className="container py-12 border-t border-cyan-500/15">
        <h2 className="font-display text-2xl font-bold mb-1">Система рангів</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Підіймайтеся по ієрархії Cyber Unit
        </p>

        <div className="space-y-2">
          {RANKS.map((r, i) => {
            const reached = profile.totalPoints >= r.minPoints;
            const isCurrent = r.name === currentRank;
            return (
              <div
                key={r.name}
                className={cn(
                  "flex items-center gap-4 rounded border px-4 py-3 transition-all",
                  isCurrent
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : reached
                      ? "border-emerald-500/25 bg-emerald-500/5"
                      : "border-muted/20 bg-card/20"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-bold",
                    isCurrent
                      ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-400"
                      : reached
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-muted/30 text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-display font-semibold",
                      !reached && "text-muted-foreground"
                    )}
                  >
                    {r.name}{" "}
                    {isCurrent && (
                      <span className="ml-2 inline-block rounded border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-cyan-400">
                        ВИ ТУТ
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.description}
                  </p>
                </div>
                <div className="font-mono text-sm font-bold tabular-nums">
                  {r.minPoints.toLocaleString()} XP
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DetectiveShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}
