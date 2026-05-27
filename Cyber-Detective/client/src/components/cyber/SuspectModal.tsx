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
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, FileSearch, Key, Lock } from "lucide-react";
import type { Evidence, Suspect } from "@/game/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suspect: Suspect | null;
  relatedEvidence: Evidence[];
  onOpenEvidence: (e: Evidence) => void;
}

const ACCESS_LABELS: Record<string, string> = {
  admin: "Повний адмін-доступ",
  editor: "Редактор",
  limited: "Обмежений",
  none: "Немає (формально)",
  guest: "Гостьовий",
};

export function SuspectModal({
  open,
  onOpenChange,
  suspect,
  relatedEvidence,
  onOpenEvidence,
}: Props) {
  if (!suspect) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl border-cyan-500/30 bg-card/95 backdrop-blur-xl p-0 overflow-hidden gap-0"
        showCloseButton
      >
        <div className="pointer-events-none absolute inset-0 z-10 scanlines opacity-40" />

        <div className="relative grid md:grid-cols-[280px_minmax(0,1fr)]">
          {}
          <div className="relative bg-gradient-to-b from-cyan-500/10 to-amber-500/5 p-5 border-b md:border-b-0 md:border-r border-cyan-500/20">
            <div className="relative">
              <img
                src={suspect.avatar}
                alt={suspect.name}
                className="w-full aspect-square rounded border-2 border-cyan-500/40 object-cover"
              />
              <div className="absolute -top-1 -right-1 rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 backdrop-blur">
                <span className="font-mono text-[9px] uppercase tracking-widest text-rose-400">
                  REC •
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  Рівень доступу
                </p>
                <p className="font-mono text-xs">
                  {ACCESS_LABELS[suspect.accessLevel] ?? suspect.accessLevel}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> Остання активність
                </p>
                <p className="font-mono text-xs">{suspect.lastActivity}</p>
              </div>
            </div>
          </div>

          {}
          <div className="flex flex-col min-w-0">
            <DialogHeader className="p-5 border-b border-cyan-500/15 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 truncate pr-2">
                SUSPECT FILE — {suspect.id.toUpperCase()}
              </div>
              <DialogTitle className="font-display text-2xl font-bold leading-tight">
                {suspect.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                <span className="font-mono text-cyan-400">
                  @{suspect.nickname}
                </span>
                <span className="mx-2 text-muted-foreground/40">·</span>
                {suspect.role}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 min-w-0 max-h-[55vh] [&_[data-radix-scroll-area-viewport]>div]:!block">
              <div className="p-5 space-y-5">
                <Section
                  title="Біографія"
                  icon={<FileSearch className="h-3 w-3" />}
                >
                  <p className="text-sm text-foreground/85 leading-relaxed break-words whitespace-pre-wrap">
                    {suspect.bio}
                  </p>
                </Section>

                <Section
                  title="Можливий мотив"
                  icon={<AlertCircle className="h-3 w-3" />}
                  accent="rose"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                    {suspect.motive}
                  </p>
                </Section>

                <Section
                  title="Алібі"
                  icon={<Lock className="h-3 w-3" />}
                  accent="cyan"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed font-mono break-words whitespace-pre-wrap">
                    {suspect.alibi}
                  </p>
                </Section>

                {relatedEvidence.length > 0 && (
                  <Section
                    title={`Пов'язані докази (${relatedEvidence.length})`}
                    icon={<Key className="h-3 w-3" />}
                    accent="amber"
                  >
                    <div className="space-y-2">
                      {relatedEvidence.map(e => (
                        <button
                          key={e.id}
                          onClick={() => onOpenEvidence(e)}
                          className="group w-full text-left rounded border border-cyan-500/20 bg-card/50 px-3 py-2 transition-all hover:border-cyan-500/50 hover:bg-card/80"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-medium line-clamp-1 break-all">
                                {e.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 break-all">
                                {e.shortDescription}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {e.status !== "open" && (
                                <Lock className="h-3 w-3 text-rose-400" />
                              )}
                              {e.isKeyEvidence && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-[9px] font-mono uppercase"
                                >
                                  KEY
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-cyan-500/15 bg-card/40 p-3 flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate mr-2">
                CLEARANCE: LEVEL 7
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="font-mono text-xs uppercase tracking-wider"
              >
                Закрити досьє
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: "cyan" | "amber" | "rose";
}) {
  const colors: Record<string, string> = {
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };
  return (
    <div>
      <div
        className={cn(
          "mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em]",
          accent ? colors[accent] : "text-cyan-400"
        )}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
