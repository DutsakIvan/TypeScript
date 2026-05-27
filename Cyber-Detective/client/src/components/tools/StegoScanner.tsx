import { useState } from "react";
import type { SteganographyChallenge } from "../../game/types";

interface StegoScannerProps {
  challenges: SteganographyChallenge[];
  onSolved: (challengeId: string) => void;
  hasDeepScanner: boolean;
  cpuCycles: number;
  onUseCPU: (amount: number) => boolean;
}

type ScanPhase = "idle" | "scanning" | "analyzing" | "complete";

export function StegoScanner({
  challenges,
  onSolved,
  hasDeepScanner,
  cpuCycles,
  onUseCPU,
}: StegoScannerProps) {
  const [selectedChallenge, setSelectedChallenge] =
    useState<SteganographyChallenge | null>(challenges[0] ?? null);
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [revealedLayers, setRevealedLayers] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("metadata");

  const methods = [
    {
      id: "metadata",
      label: "EXIF Metadata",
      desc: "Витяг метаданих зображення",
    },
    { id: "lsb", label: "LSB Analysis", desc: "Аналіз найменш значущих бітів" },
    {
      id: "exif_gps",
      label: "GPS Extraction",
      desc: "Витяг GPS-координат з EXIF",
    },
    {
      id: "header_injection",
      label: "Header Scan",
      desc: "Пошук ін'єкцій у заголовках",
    },
    {
      id: "color_channel",
      label: "Color Channel",
      desc: "Аналіз окремих кольорових каналів",
    },
  ];

  async function startScan() {
    if (!selectedChallenge || !onUseCPU(25)) return;

    setScanPhase("scanning");
    setScanProgress(0);
    setRevealedLayers([]);
    setExtractedData("");

    const layers: string[] = [];

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setScanProgress(i);

      if (i === 20) {
        layers.push("Layer 1: RGB channels separated");
        setRevealedLayers([...layers]);
      }
      if (i === 40) {
        layers.push("Layer 2: LSB extraction in progress...");
        setRevealedLayers([...layers]);
      }
      if (i === 60) {
        layers.push("Layer 3: Metadata headers parsed");
        setRevealedLayers([...layers]);
      }
      if (i === 80) {
        layers.push("Layer 4: Hidden data pattern detected!");
        setRevealedLayers([...layers]);
      }
    }

    setScanPhase("analyzing");
    await new Promise(r => setTimeout(r, 500));

    const isCorrectMethod =
      selectedMethod === selectedChallenge.extractionMethod;

    if (isCorrectMethod) {
      layers.push(`✓ ДАНІ ЗНАЙДЕНО методом ${selectedMethod.toUpperCase()}`);
      setRevealedLayers([...layers]);
      setExtractedData(selectedChallenge.hiddenData);
      setShowSuccess(true);
      onSolved(selectedChallenge.id);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      layers.push(`✗ Метод ${selectedMethod} не виявив прихованих даних.`);
      if (hasDeepScanner) {
        layers.push(
          `💡 Deep Scanner підказка: спробуйте метод "${selectedChallenge.extractionMethod}"`
        );
      }
      setRevealedLayers([...layers]);
    }

    setScanPhase("complete");
  }

  function resetScan() {
    setScanPhase("idle");
    setScanProgress(0);
    setRevealedLayers([]);
    setExtractedData("");
  }

  return (
    <div className="h-full flex flex-col bg-black/90 border border-purple-500/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-purple-900/20 border-b border-purple-500/30">
        <img
          src="/tools/stego-scanner.png"
          alt="Stego Scanner"
          className="w-8 h-8 rounded"
        />
        <h3 className="text-purple-400 font-mono font-bold text-sm">
          STEGANOGRAPHY SCANNER v1.5
        </h3>
        <span className="ml-auto text-xs text-purple-600 font-mono">
          CPU: {cpuCycles}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative aspect-video bg-black/60 border border-purple-500/20 rounded overflow-hidden">
          <img
            src={selectedChallenge?.imageUrl || "/tools/stego-sample.png"}
            alt="Target"
            className="w-full h-full object-cover opacity-80"
          />
          {scanPhase === "scanning" && (
            <div
              className="absolute top-0 left-0 h-full bg-purple-500/10 border-r-2 border-purple-400 transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-500/20 animate-pulse" />
            </div>
          )}
          {scanPhase !== "idle" && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/80 rounded px-2 py-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-purple-900/50 rounded overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-purple-400 font-mono">
                  {scanProgress}%
                </span>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="space-y-2">
          <label className="text-xs text-purple-600 font-mono">
            МЕТОД СКАНУВАННЯ:
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded border text-left transition-all ${
                  selectedMethod === m.id
                    ? "border-purple-400 bg-purple-500/20 text-purple-300"
                    : "border-purple-500/20 text-purple-500 hover:border-purple-500/40 hover:bg-purple-500/5"
                }`}
              >
                <span className="text-xs font-mono font-bold">{m.label}</span>
                <span className="text-[10px] text-purple-600 font-mono ml-auto">
                  {m.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {}
        {revealedLayers.length > 0 && (
          <div className="space-y-1 p-3 bg-black/60 border border-purple-500/20 rounded">
            <h4 className="text-xs text-purple-500 font-mono mb-2">
              SCAN OUTPUT:
            </h4>
            {revealedLayers.map((layer, i) => (
              <div
                key={i}
                className={`text-xs font-mono ${
                  layer.includes("✓")
                    ? "text-green-400"
                    : layer.includes("✗")
                      ? "text-red-400"
                      : layer.includes("💡")
                        ? "text-amber-400"
                        : "text-purple-400/80"
                }`}
              >
                {">"} {layer}
              </div>
            ))}
          </div>
        )}

        {}
        {extractedData && (
          <div
            className={`p-3 rounded border ${showSuccess ? "bg-green-900/20 border-green-400" : "bg-purple-900/10 border-purple-500/30"}`}
          >
            <h4 className="text-xs text-green-400 font-mono mb-2">
              EXTRACTED HIDDEN DATA:
            </h4>
            <p className="text-sm text-green-300 font-mono break-all">
              {extractedData}
            </p>
          </div>
        )}

        {}
        {selectedChallenge &&
          !selectedChallenge.solved &&
          hasDeepScanner &&
          scanPhase === "idle" && (
            <div className="p-2 bg-amber-900/10 border border-amber-500/20 rounded">
              <p className="text-xs text-amber-500/70 font-mono">
                🔍 Deep Scanner: {selectedChallenge.hint}
              </p>
            </div>
          )}

        {}
        <div className="flex gap-2">
          <button
            onClick={startScan}
            disabled={
              scanPhase === "scanning" ||
              scanPhase === "analyzing" ||
              cpuCycles < 25
            }
            className="flex-1 py-3 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 font-mono font-bold text-sm hover:bg-purple-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {scanPhase === "scanning"
              ? "⏳ СКАНУВАННЯ..."
              : scanPhase === "analyzing"
                ? "⏳ АНАЛІЗ..."
                : "▶ SCAN [25 CPU]"}
          </button>
          {scanPhase === "complete" && (
            <button
              onClick={resetScan}
              className="px-4 py-3 bg-black/50 border border-purple-500/30 rounded text-purple-400 font-mono text-sm hover:bg-purple-500/10"
            >
              ↺ RESET
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
