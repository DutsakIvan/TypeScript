import { Link, useLocation } from "wouter";
import { Shield, Home as HomeIcon, FolderSearch, User, Menu } from "lucide-react";
import { useGameProfile } from "@/game/store";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [location, setLocation] = useLocation();
  const profile = useGameProfile();

  const items = [
    { href: "/", label: "Головна", icon: HomeIcon },
    { href: "/cases", label: "Справи", icon: FolderSearch },
    { href: "/profile", label: "Профіль", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative grid h-8 w-8 place-items-center rounded border border-cyan-500/40 bg-cyan-500/10 shrink-0">
            <Shield className="h-4 w-4 text-cyan-400" strokeWidth={2.5} />
            <span className="absolute -inset-px rounded animate-pulse-ring" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-sm font-bold tracking-wide text-foreground">
              CYBER<span className="text-cyan-400">.</span>UNIT
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline-block">
              Digital Forensics Division
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map(it => {
            const Icon = it.icon;
            const active = location === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "group flex items-center gap-2 rounded px-3 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors",
                  active
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {profile.rank}
            </span>
            <span className="amber-text font-mono text-xs font-bold">
              {profile.totalPoints.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              ONLINE
            </span>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8 px-0 border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-l-cyan-500/20 bg-background/95 backdrop-blur-xl pt-10">
              <SheetHeader className="mb-6 border-b border-cyan-500/20 pb-4">
                <SheetTitle className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    <span className="font-display font-bold tracking-wide text-foreground">
                      CYBER.UNIT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Digital Forensics Division
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-2">
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Ранг
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {profile.rank}
                    </span>
                  </div>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Репутація
                    </span>
                    <span className="amber-text font-mono text-xs font-bold">
                      {profile.totalPoints.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {items.map(it => {
                  const Icon = it.icon;
                  const active = location === it.href;
                  return (
                    <button
                      key={it.href}
                      onClick={() => setLocation(it.href)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors w-full text-left",
                        active
                          ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {it.label}
                    </button>
                  );
                })}
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-center font-mono text-[10px] text-muted-foreground/60">
                  SECURE CONNECTION ESTABLISHED
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
