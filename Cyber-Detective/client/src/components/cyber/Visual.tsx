import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GlitchText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("glitch", className)} data-text={children}>
      {children}
    </span>
  );
}

export function CRTOverlay({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("scanlines crt-flicker relative", className)}>
      {children}
    </div>
  );
}

export function ParticleField({
  density = 28,
  className,
  color = "rgba(34, 211, 238, 0.45)",
}: {
  density?: number;
  className?: string;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    }> = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.4 - 0.1,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.5 + 0.2,
      }));
    };

    const tick = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 5;
        if (p.x > w + 10) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.a})`);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    init();
    tick();

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density, color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
    />
  );
}

export function TypeText({
  text,
  speed = 20,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useTypeState(text, speed, onDone);
  return (
    <span className={cn("font-mono", className)}>
      {displayed}
      <span
        className="inline-block ml-0.5 w-[0.5em] h-[1em] bg-current align-middle"
        style={{ animation: "type-cursor 1s infinite" }}
      />
    </span>
  );
}

function useTypeState(
  text: string,
  speed: number,
  onDone?: () => void
): [string, (s: string) => void] {
  const [s, setS] = useStateLazy("");
  useEffect(() => {
    setS("");
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i++;
      setS(text.slice(0, i));
      if (i < text.length) {
        setTimeout(tick, speed);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [text, speed, onDone, setS]);
  return [s, setS];
}

import { useState as useStateLazy } from "react";

export function DataTicker() {
  const stream =
    "0xA3F2B1C8 :: AUTH_OK :: TRACE_IP=172.16.4.22 :: TOKEN_LEAK :: SHA256=A3F2B1C8D4E9F7A2 :: NODE_07 :: PACKET_LOSS=0% :: ";
  const repeated = stream.repeat(8);
  return (
    <div className="data-stream w-full border-y border-cyan-500/20 bg-card/40 backdrop-blur py-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">
      <div className="data-stream-track">
        {repeated} {repeated}
      </div>
    </div>
  );
}

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
      }}
    />
  );
}
