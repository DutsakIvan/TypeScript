import { useState } from "react";
import type {
  CipherPuzzle,
  NetworkLogChallenge,
  SteganographyChallenge,
  EconomyState,
} from "../../game/types";
import { CipherDecryptor } from "./CipherDecryptor";
import { PacketAnalyzer } from "./PacketAnalyzer";
import { StegoScanner } from "./StegoScanner";
import {
  hasFrequencyModule,
  hasNeuralAnalyzer,
  hasDeepScanner,
} from "../../game/economy";

interface ForensicToolkitProps {
  cipherPuzzles: CipherPuzzle[];
  networkChallenges: NetworkLogChallenge[];
  stegoChallenges: SteganographyChallenge[];
  economy: EconomyState;
  onCipherSolved: (puzzleId: string) => void;
  onNetworkSolved: (challengeId: string) => void;
  onStegoSolved: (challengeId: string) => void;
  onUseCPU: (amount: number) => boolean;
}

type ToolTab = "decryptor" | "packets" | "stego";

export function ForensicToolkit({
  cipherPuzzles,
  networkChallenges,
  stegoChallenges,
  economy,
  onCipherSolved,
  onNetworkSolved,
  onStegoSolved,
  onUseCPU,
}: ForensicToolkitProps) {
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>("decryptor");

  const tools: {
    id: ToolTab;
    label: string;
    icon: string;
    color: string;
    count: number;
  }[] = [
    {
      id: "decryptor",
      label: "Дешифратор",
      icon: "/tools/decryptor.png",
      color: "green",
      count: cipherPuzzles.filter(p => !p.solved).length,
    },
    {
      id: "packets",
      label: "Аналізатор пакетів",
      icon: "/tools/packet-analyzer.png",
      color: "blue",
      count: networkChallenges.filter(c => !c.solved).length,
    },
    {
      id: "stego",
      label: "Стего-сканер",
      icon: "/tools/stego-scanner.png",
      color: "purple",
      count: stegoChallenges.filter(c => !c.solved).length,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {}
      <div className="flex gap-2 mb-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveToolTab(tool.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              activeToolTab === tool.id
                ? `border-${tool.color}-400/50 bg-${tool.color}-500/10 text-${tool.color}-300`
                : `border-gray-700 text-gray-500 hover:border-${tool.color}-500/30 hover:text-${tool.color}-400`
            }`}
            style={{
              borderColor:
                activeToolTab === tool.id
                  ? tool.color === "green"
                    ? "rgba(74,222,128,0.5)"
                    : tool.color === "blue"
                      ? "rgba(96,165,250,0.5)"
                      : "rgba(192,132,252,0.5)"
                  : undefined,
              backgroundColor:
                activeToolTab === tool.id
                  ? tool.color === "green"
                    ? "rgba(34,197,94,0.1)"
                    : tool.color === "blue"
                      ? "rgba(59,130,246,0.1)"
                      : "rgba(168,85,247,0.1)"
                  : undefined,
            }}
          >
            <img src={tool.icon} alt={tool.label} className="w-6 h-6 rounded" />
            <span className="text-xs font-mono font-bold">{tool.label}</span>
            {tool.count > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-red-500/30 text-red-300 rounded-full">
                {tool.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-black/40 border border-gray-700/50 rounded">
        <span className="text-xs text-gray-500 font-mono">CPU CYCLES:</span>
        <div className="flex-1 h-2 bg-gray-800 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded ${
              economy.cpuCycles > economy.maxCpuCycles * 0.5
                ? "bg-green-500"
                : economy.cpuCycles > economy.maxCpuCycles * 0.25
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{
              width: `${(economy.cpuCycles / economy.maxCpuCycles) * 100}%`,
            }}
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {economy.cpuCycles}/{economy.maxCpuCycles}
        </span>
      </div>

      {}
      <div className="flex-1 min-h-0">
        {activeToolTab === "decryptor" && (
          <CipherDecryptor
            puzzles={cipherPuzzles}
            onSolved={onCipherSolved}
            hasFrequencyModule={hasFrequencyModule(economy)}
            cpuCycles={economy.cpuCycles}
            onUseCPU={onUseCPU}
          />
        )}
        {activeToolTab === "packets" && (
          <PacketAnalyzer
            challenges={networkChallenges}
            onSolved={onNetworkSolved}
            hasNeuralAnalyzer={hasNeuralAnalyzer(economy)}
            cpuCycles={economy.cpuCycles}
            onUseCPU={onUseCPU}
          />
        )}
        {activeToolTab === "stego" && (
          <StegoScanner
            challenges={stegoChallenges}
            onSolved={onStegoSolved}
            hasDeepScanner={hasDeepScanner(economy)}
            cpuCycles={economy.cpuCycles}
            onUseCPU={onUseCPU}
          />
        )}
      </div>
    </div>
  );
}
