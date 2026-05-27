import React from "react";
import {
  Terminal as TerminalIcon,
  Mail,
  ScrollText,
  Eye,
  Lock,
  Star,
} from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Suspect, Evidence } from "@/game/types";
import { cn } from "@/lib/utils";

export function CaseTab({
  value,
  icon,
  children,
  id,
}: {
  value: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <TabsTrigger
      id={id}
      value={value}
      className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/40 border border-transparent font-mono text-xs uppercase tracking-wider gap-2"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </TabsTrigger>
  );
}

export function MetricBox({
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
  const colors: Record<string, string> = {
    cyan: "border-cyan-500/25 bg-cyan-500/5 text-cyan-400",
    amber: "border-amber-500/25 bg-amber-500/5 text-amber-400",
    rose: "border-rose-500/25 bg-rose-500/5 text-rose-400",
  };
  return (
    <div className={cn("rounded border px-3 py-2", colors[accent])}>
      <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest opacity-80">
        {icon}
        {label}
      </div>
      <div className="font-mono text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

export function DifficultyBadge({
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
    easy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    medium: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    hard: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    extreme: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  };
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[10px]", styles[difficulty])}
    >
      {labels[difficulty]}
    </Badge>
  );
}

const ACCESS_LABELS: Record<string, string> = {
  admin: "Повний адмін-доступ",
  editor: "Редактор",
  limited: "Обмежений",
  none: "Немає (формально)",
  guest: "Гостьовий",
};

export function SuspectCard({
  suspect,
  onClick,
  delay,
}: {
  suspect: Suspect;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-lg border border-cyan-500/20 bg-card/40 p-4 transition-all hover:border-cyan-500/50 hover:bg-card/60 hover:-translate-y-0.5 animate-fade-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative mb-3 overflow-hidden rounded border border-cyan-500/20">
        <img
          src={suspect.avatar}
          alt={suspect.name}
          className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>
      <p className="font-display text-sm font-semibold leading-tight">
        {suspect.name}
      </p>
      <p className="font-mono text-xs text-cyan-400">@{suspect.nickname}</p>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
        {suspect.role}
      </p>
      <div className="mt-3 flex flex-col gap-1 border-t border-cyan-500/20 pt-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          Рівень доступу:
        </span>
        <span className="font-mono text-[10px] text-cyan-400 truncate">
          {ACCESS_LABELS[suspect.accessLevel] ??
            suspect.accessLevel.toUpperCase()}
        </span>
      </div>
    </button>
  );
}

export function EvidenceCard({
  evidence,
  unlocked,
  onClick,
  delay,
}: {
  evidence: Evidence;
  unlocked: boolean;
  onClick: () => void;
  delay: number;
}) {
  const CategoryIcon =
    evidence.category === "log"
      ? TerminalIcon
      : evidence.category === "message"
        ? Mail
        : evidence.category === "report"
          ? ScrollText
          : Eye;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative text-left overflow-hidden rounded-lg border p-4 transition-all hover:-translate-y-0.5 animate-fade-rise",
        unlocked
          ? "border-cyan-500/25 bg-card/50 hover:border-cyan-500/55 hover:bg-card/70"
          : "border-rose-500/20 bg-card/30 hover:border-rose-500/40"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded border",
            unlocked
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
              : "border-rose-500/40 bg-rose-500/10 text-rose-400"
          )}
        >
          {unlocked ? (
            <CategoryIcon className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {evidence.isKeyEvidence && (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-[9px]"
            >
              <Star className="mr-1 h-2.5 w-2.5" /> KEY
            </Badge>
          )}
          {!unlocked && (
            <Badge
              variant="outline"
              className="border-rose-500/40 bg-rose-500/10 text-rose-400 font-mono text-[9px]"
            >
              {evidence.status === "encrypted" ? "ENC" : "LOCKED"}
            </Badge>
          )}
        </div>
      </div>
      <h3
        className={cn(
          "mb-1 font-display text-sm font-semibold leading-tight",
          !unlocked && "blur-[2px]"
        )}
      >
        {evidence.title}
      </h3>
      <p
        className={cn(
          "text-xs text-muted-foreground line-clamp-2",
          !unlocked && "blur-[2px]"
        )}
      >
        {evidence.shortDescription}
      </p>

      {!unlocked && evidence.unlockHint && (
        <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[10px] font-mono text-amber-300/80 line-clamp-2">
          🔑 {evidence.unlockHint}
        </div>
      )}
    </button>
  );
}
