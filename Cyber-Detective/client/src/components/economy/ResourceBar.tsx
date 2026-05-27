import type { EconomyState } from "../../game/types";

interface ResourceBarProps {
  economy: EconomyState;
  onOpenShop: () => void;
}

export function ResourceBar({ economy, onOpenShop }: ResourceBarProps) {
  const cpuPercent = (economy.cpuCycles / economy.maxCpuCycles) * 100;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-black/60 border border-gray-700/50 rounded-lg">
      {}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-amber-500 text-sm">₿</span>
        <span className="text-sm text-amber-300 font-mono font-bold">
          {economy.credits}
        </span>
      </div>

      {}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs text-gray-500 font-mono">CPU:</span>
        <div className="flex-1 h-2 bg-gray-800 rounded overflow-hidden max-w-32">
          <div
            className={`h-full transition-all duration-500 rounded ${
              cpuPercent > 50
                ? "bg-green-500"
                : cpuPercent > 25
                  ? "bg-amber-500"
                  : "bg-red-500 animate-pulse"
            }`}
            style={{ width: `${cpuPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {economy.cpuCycles}/{economy.maxCpuCycles}
        </span>
      </div>

      {}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-500 font-mono">RAM:</span>
        <span className="text-xs text-blue-400 font-mono">
          {economy.ramSlots}
        </span>
      </div>

      {}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-500 font-mono">SEC:</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`shrink-0 w-2 h-3.5 rounded-sm ${
                i < economy.securityLevel ? "bg-purple-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {}
      <button
        onClick={onOpenShop}
        className="shrink-0 px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-all"
      >
        ⬆ UPGRADES
      </button>
    </div>
  );
}
