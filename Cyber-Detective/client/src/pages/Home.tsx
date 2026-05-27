import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Eye,
  Fingerprint,
  Lock,
  MapPinned,
  ScrollText,
  Search,
  Terminal,
} from "lucide-react";
import { SiteHeader } from "@/components/cyber/SiteHeader";
import {
  BoardTeaserCard,
  DetectiveHero,
  DetectiveSectionHeader,
  DetectiveShell,
} from "@/components/cyber/DetectiveLayout";
import { DataTicker } from "@/components/cyber/Visual";
import { ALL_CASES, isCaseUnlocked } from "@/game/data";
import { useGameProfile } from "@/game/store";
import { cn } from "@/lib/utils";

export default function Home() {
  const profile = useGameProfile();
  const hasProgress = profile.casesSolved.length > 0 || profile.totalPoints > 0;

  return (
    <DetectiveShell>
      <SiteHeader />

      <DetectiveHero
        eyebrow="Digital Forensics Division / Noir Investigation Desk"
        title="CYBER DETECTIVE"
        subtitle="Твій кабінет цифрового детектива: докази на корковій дошці, червоні нитки між підозрюваними, термінал для зламу шифрів і власна дедукція замість простого кліку по правильній відповіді."
        primaryHref={
          profile.hasCompletedTutorial ? "/cases" : "/case/tutorial-01"
        }
        primaryLabel={
          profile.hasCompletedTutorial
            ? hasProgress
              ? "Продовжити розслідування"
              : "Відкрити архів справ"
            : "Пройти навчання"
        }
        secondaryHref="/profile"
        secondaryLabel="Профіль детектива"
        stats={[
          { label: "Справ у архіві", value: String(ALL_CASES.length) },
          {
            label: "Розкрито",
            value: `${profile.casesSolved.length}/${ALL_CASES.length}`,
          },
          { label: "Репутація", value: String(profile.totalPoints) },
        ]}
      />

      <DataTicker />

      <section className="container py-14 md:py-20">
        <DetectiveSectionHeader
          eyebrow="Investigation wall"
          title="Нова атмосфера: не просто кіберпанк, а справжня кімната детектива"
          description="Проєкт тепер більше схожий на сцену з фільму: темний кабінет, фото підозрюваних, нотатки, стрічки, файли та інтерактивна дошка, де гравець сам будує логіку розслідування."
        />
        <BoardTeaserCard />
      </section>

      <section className="border-y border-amber-500/15 bg-black/25">
        <div className="container py-14 md:py-20">
          <DetectiveSectionHeader
            eyebrow="Case workflow"
            title="Як тепер відчувається розслідування"
            description="Я залишив існуючу ігрову механіку, але додав візуальний шар, який робить її більш предметною: справа виглядає як досьє, а докази — як матеріали на столі слідчого."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="dossier-card group relative overflow-hidden rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-amber-400/45"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded border border-amber-500/30 bg-amber-500/10 transition-colors group-hover:border-amber-300/60">
                  <s.icon className="h-5 w-5 text-amber-300" />
                </div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-stone-100">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <DetectiveSectionHeader
            eyebrow="Case archive"
            title="Досьє активних справ"
            description="Кожна справа тепер подається як окрема папка з кодовою назвою, рівнем небезпеки, кількістю підозрюваних і винагородою."
          />
          <Link
            href={profile.hasCompletedTutorial ? "/cases" : "/case/tutorial-01"}
          >
            <Button
              variant="outline"
              className="border-amber-500/40 bg-black/30 font-mono uppercase tracking-wider text-amber-100 hover:bg-amber-500/10"
            >
              Усі справи <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ALL_CASES.map((c, i) => {
            const unlocked = isCaseUnlocked(c.id, profile);
            return (
              <Link
                key={c.id}
                href={unlocked ? `/case/${c.id}` : "#"}
                onClick={e => !unlocked && e.preventDefault()}
                className={cn(
                  "dossier-card group relative block rotate-[-1deg] overflow-hidden rounded-lg p-5 transition-all",
                  unlocked
                    ? "hover:z-10 hover:rotate-0 hover:scale-[1.025]"
                    : "opacity-60 grayscale-[0.45] cursor-not-allowed"
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
                <div className="text-stone-100 relative z-10">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-200/80">
                      {c.codename}
                    </span>
                    <DifficultyBadge difficulty={c.difficulty} />
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold leading-tight">
                    {c.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-stone-400">
                    {c.subtitle}
                  </p>
                  <div className="red-string-line mb-4" />
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-400">
                    <span>{c.suspects.length} підозрюваних</span>
                    <span className="text-amber-300">+{c.basePoints} XP</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-red-500/15 bg-black/35">
        <div className="container grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
              New MVP feature
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-stone-50 md:text-3xl">
              У кожній справі з’явилась вкладка “Дошка”
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
              Вона дає змогу перетягувати вузли, з’єднувати підозрюваних із
              доказами, додавати нотатки та зберігати власні гіпотези локально.
            </p>
          </div>
          <Link
            href={profile.hasCompletedTutorial ? "/cases" : "/case/tutorial-01"}
          >
            <Button className="noir-button gap-2 font-mono uppercase tracking-wider">
              {profile.hasCompletedTutorial
                ? "Перейти до справ"
                : "Пройти навчання"}{" "}
              <MapPinned className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-amber-500/15 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs font-mono text-stone-500">КІБЕР-ВІДДІЛ</p>
        </div>
      </footer>
    </DetectiveShell>
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
      className={`rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}

const steps = [
  {
    icon: ScrollText,
    title: "Досьє справи",
    desc: "Гравець починає не з сухого тексту, а з матеріалів справи: брифінг, підозрювані, мотиви та перші зачіпки.",
  },
  {
    icon: Search,
    title: "Пошук слідів",
    desc: "Докази виглядають як документи, логи, фото й повідомлення, які поступово розкривають приховану структуру злочину.",
  },
  {
    icon: MapPinned,
    title: "Дошка розслідування",
    desc: "Підозрювані та докази можна розкласти на дошці, з’єднати нитками й підписати власні гіпотези.",
  },
  {
    icon: Terminal,
    title: "Термінал-консоль",
    desc: "Команди scan, trace, decrypt і crawl залишаються ядром кібердетективної механіки.",
  },
  {
    icon: Lock,
    title: "Розшифровка",
    desc: "Зашифровані матеріали відкриваються через паролі, підказки, метадані та уважне читання контексту.",
  },
  {
    icon: Brain,
    title: "Дедукція",
    desc: "Фінальне звинувачення має спиратися на мотив, доступ, технічний слід і суперечності в алібі.",
  },
  {
    icon: Eye,
    title: "Перевірка деталей",
    desc: "Підказки і листування тепер краще працюють як деталі великої схеми, а не як окремі картки.",
  },
  {
    icon: Fingerprint,
    title: "Відбиток винного",
    desc: "Гравець збирає достатньо доказів, щоб відрізнити справжній слід від red herring.",
  },
];
