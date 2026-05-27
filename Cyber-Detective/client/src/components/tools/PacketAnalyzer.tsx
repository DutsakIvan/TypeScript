import { useState, useMemo } from "react";
import type { NetworkLogChallenge, NetworkPacket } from "../../game/types";

interface PacketAnalyzerProps {
  challenges: NetworkLogChallenge[];
  onSolved: (challengeId: string) => void;
  hasNeuralAnalyzer: boolean;
  cpuCycles: number;
  onUseCPU: (amount: number) => boolean;
}

export function PacketAnalyzer({
  challenges,
  onSolved,
  hasNeuralAnalyzer,
  cpuCycles,
  onUseCPU,
}: PacketAnalyzerProps) {
  const [selectedChallenge, setSelectedChallenge] =
    useState<NetworkLogChallenge | null>(challenges[0] ?? null);
  const [filter, setFilter] = useState("");
  const [selectedPackets, setSelectedPackets] = useState<Set<string>>(
    new Set()
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<"timestamp" | "size" | "srcIP">(
    "timestamp"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const packets = selectedChallenge?.packets ?? [];

  const filteredPackets = useMemo(() => {
    if (!filter.trim()) return packets;

    const f = filter.toLowerCase().trim();
    return packets.filter(p => {
      if (f.includes("==") || f.includes(">") || f.includes("<")) {
        const parts = f.split(/\s*(==|>=|<=|>|<|!=)\s*/);
        if (parts.length >= 3) {
          const [field, op, value] = parts;
          const v = value.trim();

          const getField = (
            pkt: NetworkPacket,
            fieldName: string
          ): string | number => {
            switch (fieldName.trim()) {
              case "ip.src":
              case "src":
              case "srcip":
                return pkt.srcIP;
              case "ip.dst":
              case "dst":
              case "dstip":
                return pkt.dstIP;
              case "port":
              case "dstport":
                return pkt.dstPort;
              case "srcport":
                return pkt.srcPort;
              case "protocol":
              case "proto":
                return pkt.protocol.toLowerCase();
              case "size":
              case "bytes":
                return pkt.size;
              case "flags":
                return pkt.flags?.toLowerCase() ?? "";
              default:
                return "";
            }
          };

          const fieldVal = getField(p, field);
          switch (op) {
            case "==":
              return String(fieldVal) === v || String(fieldVal).includes(v);
            case "!=":
              return String(fieldVal) !== v;
            case ">":
              return Number(fieldVal) > Number(v);
            case "<":
              return Number(fieldVal) < Number(v);
            case ">=":
              return Number(fieldVal) >= Number(v);
            case "<=":
              return Number(fieldVal) <= Number(v);
          }
        }
      }

      return (
        p.srcIP.includes(f) ||
        p.dstIP.includes(f) ||
        p.protocol.toLowerCase().includes(f) ||
        p.timestamp.includes(f) ||
        (p.payload?.toLowerCase().includes(f) ?? false) ||
        (p.description?.toLowerCase().includes(f) ?? false)
      );
    });
  }, [packets, filter]);

  const sortedPackets = useMemo(() => {
    return [...filteredPackets].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "timestamp":
          cmp = a.timestamp.localeCompare(b.timestamp);
          break;
        case "size":
          cmp = a.size - b.size;
          break;
        case "srcIP":
          cmp = a.srcIP.localeCompare(b.srcIP);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredPackets, sortBy, sortDir]);

  function togglePacketSelection(pktId: string) {
    const newSet = new Set(selectedPackets);
    if (newSet.has(pktId)) {
      newSet.delete(pktId);
    } else {
      newSet.add(pktId);
    }
    setSelectedPackets(newSet);
  }

  function handleSubmitAnalysis() {
    if (!selectedChallenge || !onUseCPU(20)) return;

    const anomalySet = new Set(selectedChallenge.anomalyPacketIds);
    const correctSelections = Array.from(selectedPackets).filter(id =>
      anomalySet.has(id)
    );
    const allCorrect =
      correctSelections.length === anomalySet.size &&
      selectedPackets.size === anomalySet.size;

    if (allCorrect || correctSelections.length >= anomalySet.size * 0.7) {
      setShowSuccess(true);
      onSolved(selectedChallenge.id);
      setTimeout(() => setShowSuccess(false), 10000);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes > 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    if (bytes > 1000) return `${(bytes / 1000).toFixed(1)} KB`;
    return `${bytes} B`;
  }

  return (
    <div className="h-full flex flex-col bg-black/90 border border-blue-500/30 rounded-lg overflow-hidden">
      {}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-900/20 border-b border-blue-500/30">
        <img
          src="/tools/packet-analyzer.png"
          alt="Packet Analyzer"
          className="w-8 h-8 rounded"
        />
        <h3 className="text-blue-400 font-mono font-bold text-sm">
          PACKET ANALYZER v3.1
        </h3>
        <span className="ml-auto text-xs text-blue-600 font-mono">
          {filteredPackets.length}/{packets.length} packets
        </span>
      </div>

      {}
      <div className="px-3 py-2 bg-black/50 border-b border-blue-500/20 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 bg-black/80 border border-blue-500/30 rounded px-3 py-1.5 text-blue-300 font-mono text-xs focus:border-blue-400 focus:outline-none"
            placeholder="Filter: ip.src == 10.0.1.x | size > 50000 | protocol == HTTPS"
          />
          <button
            onClick={() => setFilter("")}
            className="px-2 py-1 text-xs font-mono text-blue-500 border border-blue-500/30 rounded hover:bg-blue-500/10"
          >
            Clear
          </button>
        </div>
        {selectedChallenge && (
          <p className="text-[10px] text-blue-600/70 font-mono">
            💡 {selectedChallenge.filterHint}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-blue-900/30 text-blue-400">
            <tr>
              <th className="px-2 py-1.5 text-left w-8">
                <input type="checkbox" className="accent-blue-500" disabled />
              </th>
              <th
                className="px-2 py-1.5 text-left cursor-pointer hover:text-blue-300"
                onClick={() => {
                  setSortBy("timestamp");
                  setSortDir(d => (d === "asc" ? "desc" : "asc"));
                }}
              >
                Time {sortBy === "timestamp" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-2 py-1.5 text-left cursor-pointer hover:text-blue-300"
                onClick={() => {
                  setSortBy("srcIP");
                  setSortDir(d => (d === "asc" ? "desc" : "asc"));
                }}
              >
                Source {sortBy === "srcIP" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-2 py-1.5 text-left">Destination</th>
              <th className="px-2 py-1.5 text-left">Proto</th>
              <th
                className="px-2 py-1.5 text-left cursor-pointer hover:text-blue-300"
                onClick={() => {
                  setSortBy("size");
                  setSortDir(d => (d === "asc" ? "desc" : "asc"));
                }}
              >
                Size {sortBy === "size" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-2 py-1.5 text-left">Flags</th>
            </tr>
          </thead>
          <tbody>
            {sortedPackets.map(pkt => {
              const isSelected = selectedPackets.has(pkt.id);
              const isSuspicious = hasNeuralAnalyzer && pkt.suspicious;
              return (
                <tr
                  key={pkt.id}
                  onClick={() => togglePacketSelection(pkt.id)}
                  className={`cursor-pointer border-b border-blue-500/10 transition-all ${
                    isSelected
                      ? "bg-blue-500/20 text-blue-200"
                      : isSuspicious
                        ? "bg-red-900/10 text-red-300 hover:bg-red-900/20"
                        : "text-blue-400/80 hover:bg-blue-500/5"
                  }`}
                >
                  <td className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-blue-500"
                    />
                  </td>
                  <td className="px-2 py-1">{pkt.timestamp}</td>
                  <td className="px-2 py-1">
                    {pkt.srcIP}:{pkt.srcPort}
                  </td>
                  <td className="px-2 py-1">
                    {pkt.dstIP}:{pkt.dstPort}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`px-1 rounded ${
                        pkt.protocol === "HTTPS"
                          ? "bg-green-900/30 text-green-400"
                          : pkt.protocol === "SSH"
                            ? "bg-purple-900/30 text-purple-400"
                            : pkt.protocol === "DNS"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-blue-900/30"
                      }`}
                    >
                      {pkt.protocol}
                    </span>
                  </td>
                  <td
                    className={`px-2 py-1 ${pkt.size > 50000 ? "text-red-400 font-bold" : ""}`}
                  >
                    {formatSize(pkt.size)}
                  </td>
                  <td className="px-2 py-1 text-blue-600">{pkt.flags}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {}
      <div className="px-4 py-3 bg-black/50 border-t border-blue-500/20 flex items-center gap-3">
        <span className="text-xs text-blue-600 font-mono">
          Обрано: {selectedPackets.size} пакетів
        </span>
        <button
          onClick={handleSubmitAnalysis}
          disabled={selectedPackets.size === 0 || cpuCycles < 20}
          className={`ml-auto px-4 py-2 text-xs font-mono font-bold rounded border transition-all ${
            showSuccess
              ? "bg-green-500/30 border-green-400 text-green-300"
              : "bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 disabled:opacity-30"
          }`}
        >
          {showSuccess
            ? selectedChallenge?.unlockCode
              ? `✓ ПАРОЛЬ: ${selectedChallenge.unlockCode}`
              : "✓ АНОМАЛІЇ ВИЯВЛЕНО!"
            : "▶ АНАЛІЗ АНОМАЛІЙ [20 CPU]"}
        </button>
      </div>
    </div>
  );
}
