import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Camera,
  FileSearch,
  MapPinned,
  Pin,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DetectiveShellProps = {
  children: ReactNode;
  className?: string;
};

export function DetectiveShell({ children, className }: DetectiveShellProps) {
  return (
    <div
      className={cn(
        "detective-shell min-h-screen flex flex-col text-stone-100",
        className
      )}
    >
      {children}
    </div>
  );
}

type DetectiveHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  stats?: Array<{ label: string; value: string }>;
};

export function DetectiveHero({
  eyebrow = "Private cyber investigation room",
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  stats = [],
}: DetectiveHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20">
      <div className="absolute inset-0 -z-10 detective-hero-board opacity-95" />
      <div className="container relative z-10 grid gap-8 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-black/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.9)]" />
            {eyebrow}
          </div>

          <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-stone-50 md:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
            {subtitle}
          </p>

          {(primaryHref || secondaryHref) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryHref && primaryLabel && (
                <Link href={primaryHref}>
                  <Button
                    size="lg"
                    className="noir-button gap-2 font-mono uppercase tracking-wider"
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {secondaryHref && secondaryLabel && (
                <Link href={secondaryHref}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-stone-400/25 bg-black/25 font-mono uppercase tracking-wider text-stone-200 hover:border-amber-400/45 hover:bg-amber-500/10"
                  >
                    {secondaryLabel}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className="dossier-card rounded-lg px-4 py-3"
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-stone-400">
                    {stat.label}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-amber-200">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative hidden min-h-[390px] md:block">
          <div className="absolute left-8 top-2 w-64 rotate-[-5deg] case-photo rounded-sm p-3 animate-noir-sway">
            <div className="aspect-[4/3] rounded bg-[url('/redesign/investigation-board-ui-concept.png')] bg-cover bg-center grayscale-[0.2]" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-700">
              Evidence board prototype
            </p>
          </div>
          <div className="absolute bottom-5 right-2 w-72 rotate-[4deg] rounded-xl border border-red-500/25 bg-black/65 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center gap-3 text-red-300">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-[0.25em]">
                Active clues
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Pin className="h-3.5 w-3.5 text-red-400" /> підозрювані +
                докази на дошці
              </div>
              <div className="flex items-center gap-2">
                <MapPinned className="h-3.5 w-3.5 text-amber-400" /> зв’язки
                через червоні нитки
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-cyan-300" /> фото/картки як
                в детективному кабінеті
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type DetectiveSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function DetectiveSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: DetectiveSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 max-w-3xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold text-stone-50 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-stone-400 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function BoardTeaserCard() {
  return (
    <div className="cork-panel relative overflow-hidden rounded-2xl p-5">
      <div className="absolute inset-x-6 top-1/2 red-string-line rotate-[-8deg]" />
      <div className="absolute left-1/4 top-12 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.8)]" />
      <div className="absolute right-1/4 bottom-16 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.8)]" />
      <div className="relative z-10 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FileSearch,
            title: "Докази",
            text: "Перетягуй відкриті файли й ключові сліди на дошці.",
          },
          {
            icon: Pin,
            title: "Зв’язки",
            text: "З’єднуй підозрюваних із доказами та додавай власні підписи.",
          },
          {
            icon: MapPinned,
            title: "Гіпотези",
            text: "Створюй нотатки, перевіряй алібі та будуєш власну дедукцію.",
          },
        ].map(item => (
          <div
            key={item.title}
            className="evidence-pin rounded-xl border border-amber-500/20 bg-black/45 p-5 pt-9 backdrop-blur"
          >
            <item.icon className="mb-3 h-6 w-6 text-amber-300" />
            <h3 className="font-display text-lg font-semibold text-stone-100">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
