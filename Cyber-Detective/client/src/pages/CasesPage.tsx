import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  RotateCw,
} from "lucide-react";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import {
  DetectiveSectionHeader,
  DetectiveShell,
} from "@/components/cyber/DetectiveLayout";
import { ALL_CASES, isCaseUnlocked } from "@/game/data";
import { gameStore, useGameProfile, formatDuration } from "@/game/store";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  const profile = useGameProfile();
  const [, setLocation] = useLocation();

  const handleStart = (caseId: string) => {
    gameStore.startCase(caseId);
    setLocation(`/case/${caseId}`);
  };

  useEffect(() => {
    if (!profile.hasCompletedTutorial) {
      setLocation("/case/tutorial-01");
    }
  }, [profile.hasCompletedTutorial, setLocation]);

  if (!profile.hasCompletedTutorial) return null;

  return (
    <DetectiveShell>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-amber-500/15">
        <div className="absolute inset-0 -z-10 detective-hero-board opacity-60" />
        <div className="container relative z-10 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300 animate-fade-rise"></p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-stone-50 animate-fade-rise stagger-1 md:text-5xl">
              Активні розслідування
            </h1>
            <p className="mt-3 text-stone-400 animate-fade-rise stagger-2">
              Кожна справа подана як окрема детективна папка: кодова назва,
              складність, докази, прогрес і швидкий доступ до дошки
              розслідування всередині справи.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 animate-fade-rise stagger-3">
              <Link href="/play">
                <Button className="noir-button gap-2 px-6 py-3 font-mono text-sm uppercase tracking-wider">
                  <Play className="h-4 w-4" /> Автономна гра
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-stone-500/30 bg-black/30 font-mono uppercase tracking-wider text-stone-200 hover:border-amber-400/40 hover:bg-amber-500/10"
                >
                  Профіль детектива
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <DetectiveSectionHeader
          eyebrow="Evidence folders"
          title="Обери досьє для роботи"
          description="Незаблоковані справи виглядають як відкриті матеріали на столі. Заблоковані папки залишаються під печаткою, доки попередню справу не буде закрито."
        />

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {ALL_CASES.filter(c => c.id !== "tutorial-01").map((c, i) => {
            const unlocked = isCaseUnlocked(c.id, profile);
            const progress = profile.caseProgress[c.id];
            const solved = profile.casesSolved.includes(c.id);
            const inProgress = progress && !progress.caseSolved;

            return (
              <article
                key={c.id}
                className={cn(
                  "dossier-card group relative flex min-h-[440px] flex-col overflow-hidden rounded-xl transition-all animate-fade-rise",
                  unlocked
                    ? "hover:-translate-y-1 hover:border-amber-400/45"
                    : "opacity-60 grayscale-[0.45]"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {!unlocked && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center px-6 text-center">
                      <Lock className="mb-3 h-8 w-8 text-stone-500" />
                      <p className="font-mono text-sm uppercase tracking-widest text-stone-400">
                        Заблоковано
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Розкрийте попередню справу для розблокування
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "h-1.5 w-full",
                    c.difficulty === "easy" && "bg-emerald-500/70",
                    c.difficulty === "medium" && "bg-amber-500/70",
                    c.difficulty === "hard" && "bg-rose-500/70",
                    c.difficulty === "extreme" && "bg-purple-500/70"
                  )}
                />

                <div className="relative flex-1 p-6">
                  <div className="absolute right-5 top-5 rounded border border-red-500/35 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-red-300 rotate-[8deg]">
                    {solved ? "closed" : inProgress ? "open" : "new"}
                  </div>

                  <div className="mb-5 pr-20">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      {c.codename}
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-stone-50">
                      {c.title}
                    </h2>
                    <p className="mt-2 text-sm font-mono text-amber-200/75">
                      {c.subtitle}
                    </p>
                  </div>

                  <div className="mb-5 red-string-line" />

                  <p className="mb-5 line-clamp-4 text-sm leading-relaxed text-stone-400">
                    {c.description}
                  </p>

                  <div className="mb-5 grid grid-cols-3 gap-2">
                    <Stat label="Підозр." value={String(c.suspects.length)} />
                    <Stat label="Доказів" value={String(c.evidence.length)} />
                    <Stat label="XP" value={`+${c.basePoints}`} accent />
                  </div>

                  <div className="mb-5 flex items-center justify-between gap-3">
                    <DifficultyBadge difficulty={c.difficulty} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      board ready
                    </span>
                  </div>

                  {progress && unlocked && (
                    <div className="rounded-lg border border-amber-500/20 bg-black/30 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-amber-300">Статус</span>
                        {solved ? (
                          <span className="flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Розкрито
                          </span>
                        ) : (
                          <span className="text-red-300">У роботі</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-500">Доказів відкрито</span>
                        <span className="text-stone-200">
                          {progress.unlockedEvidenceIds.length}/
                          {c.evidence.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-500">Очок</span>
                        <span className="font-bold text-amber-300">
                          {progress.points}
                        </span>
                      </div>
                      {progress.endTime && (
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="flex items-center gap-1 text-stone-500">
                            <Clock className="h-3 w-3" /> Час
                          </span>
                          <span className="text-stone-200">
                            {formatDuration(
                              progress.endTime - progress.startTime
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-amber-500/15 bg-black/35 p-4">
                  {solved ? (
                    <div className="flex gap-2">
                      <Link href={`/case/${c.id}/verdict`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-emerald-500/40 bg-emerald-500/10 font-mono text-xs uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20"
                        >
                          Звіт справи
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Перепройти справу"
                        onClick={() => {
                          gameStore.resetCase(c.id);
                          gameStore.startCase(c.id);
                          setLocation(`/case/${c.id}`);
                        }}
                        className="border-amber-500/40 hover:bg-amber-500/10"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleStart(c.id)}
                      disabled={!unlocked}
                      className="noir-button w-full gap-2 font-mono text-xs uppercase tracking-wider"
                    >
                      {inProgress ? (
                        <>
                          Продовжити <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" /> Почати справу
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {ALL_CASES.length === 0 && (
          <div className="py-20 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-stone-600" />
            <p className="text-stone-500">Поки що немає активних справ.</p>
          </div>
        )}
      </section>
    </DetectiveShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-amber-500/15 bg-black/25 px-2.5 py-2">
      <div className="font-mono text-[9px] uppercase tracking-widest text-stone-500">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-sm font-bold",
          accent ? "text-amber-300" : "text-stone-200"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: "easy" | "medium" | "hard" | "extreme";
}) {
  const labels: Record<string, string> = {
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    extreme: "EXTREME",
  };
  const styles: Record<string, string> = {
    easy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    hard: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    extreme: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  };
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest",
        styles[difficulty]
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
