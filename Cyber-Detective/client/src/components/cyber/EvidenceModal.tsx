import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Crosshair,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Evidence, Suspect } from "@/game/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: Evidence | null;
  suspect?: Suspect;
}

const CATEGORY_LABELS: Record<string, string> = {
  log: "Системний лог",
  message: "Повідомлення",
  file: "Файл",
  report: "Офіційний звіт",
  audio: "Аудіозапис",
  image: "Зображення",
  transaction: "Транзакція",
};

export function EvidenceModal({
  open,
  onOpenChange,
  evidence,
  suspect,
}: Props) {
  if (!evidence) return null;

  const isLocked = evidence.status !== "open";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl border-cyan-500/30 bg-card/95 backdrop-blur-xl p-0 gap-0 overflow-hidden"
        showCloseButton={true}
      >
        {}
        <div className="pointer-events-none absolute inset-0 z-10 scanlines opacity-50" />

        {}
        <div className="relative border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-transparent to-amber-500/10 p-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em]">
                  <Crosshair className="h-3 w-3 text-cyan-400" />
                  <span className="text-cyan-400">EVIDENCE FILE</span>
                  <span className="text-muted-foreground">::</span>
                  <span className="text-muted-foreground">
                    ID — {evidence.id.toUpperCase().slice(0, 12)}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl font-bold leading-tight pr-6">
                  {evidence.title}
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
                  {evidence.shortDescription}
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge
                variant="outline"
                className="border-cyan-500/40 text-cyan-400 font-mono text-[10px] uppercase"
              >
                <FileText className="mr-1 h-3 w-3" />
                {CATEGORY_LABELS[evidence.category] ?? evidence.category}
              </Badge>
              {evidence.isKeyEvidence && (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase animate-pulse"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Ключовий доказ
                </Badge>
              )}
              {evidence.redHerring && (
                <Badge
                  variant="outline"
                  className="border-rose-500/30 bg-rose-500/5 text-rose-400/90 font-mono text-[10px] uppercase"
                  title="Цей доказ може вводити в оману"
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Можливо вводить в оману
                </Badge>
              )}
              {isLocked && (
                <Badge
                  variant="outline"
                  className="border-rose-500/40 bg-rose-500/10 text-rose-400 font-mono text-[10px] uppercase"
                >
                  <Lock className="mr-1 h-3 w-3" />{" "}
                  {evidence.status === "encrypted"
                    ? "Зашифровано"
                    : "Заблоковано"}
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>

        {}
        <ScrollArea className="max-h-[55vh] relative">
          <div className="p-5 space-y-4">
            {isLocked ? (
              <div className="rounded border border-rose-500/30 bg-rose-500/5 p-6 text-center">
                <Lock className="mx-auto mb-3 h-10 w-10 text-rose-400" />
                <h4 className="mb-1.5 font-display text-lg font-semibold text-rose-300">
                  Доказ заблоковано
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Цей доказ потрібно розблокувати через термінал.
                </p>
                {evidence.unlockHint && (
                  <div className="mx-auto max-w-md rounded border border-amber-500/30 bg-amber-500/5 p-3 text-left">
                    <p className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400"></p>
                    <p className="font-mono text-sm text-amber-100">
                      {evidence.unlockHint}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <pre
                className={cn(
                  "font-mono text-sm leading-relaxed whitespace-pre-wrap break-words",
                  evidence.category === "log" || evidence.category === "file"
                    ? "text-foreground/90"
                    : "text-foreground/85",
                  "rounded border border-cyan-500/15 bg-background/60 p-4"
                )}
              >
                {evidence.fullContent}
              </pre>
            )}

            {evidence.pointsToSuspectId && suspect && !isLocked && (
              <div className="rounded border border-amber-500/25 bg-amber-500/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  <Crosshair className="h-3 w-3" />
                  ЗВ'ЯЗОК З ПІДОЗРЮВАНИМ
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={suspect.avatar}
                    alt={suspect.name}
                    className="h-12 w-12 rounded border border-amber-500/30 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold truncate">
                      {suspect.name}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        ({suspect.nickname})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {suspect.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {}
        <div className="border-t border-cyan-500/20 bg-card/40 p-3 flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            CLASSIFIED
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs uppercase tracking-wider"
          >
            Закрити
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
