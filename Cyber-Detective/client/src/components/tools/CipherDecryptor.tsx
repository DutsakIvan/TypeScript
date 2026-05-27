import { useState, useMemo } from "react";
import type { CipherPuzzle, CipherType } from "../../game/types";
import {
  cipherDecrypt,
  frequencyAnalysis,
  UA_FREQUENCY,
} from "../../game/procedural";

interface CipherDecryptorProps {
  puzzles: CipherPuzzle[];
  onSolved: (puzzleId: string) => void;
  hasFrequencyModule: boolean;
  cpuCycles: number;
  onUseCPU: (amount: number) => boolean;
}

export function CipherDecryptor({
  puzzles,
  onSolved,
  hasFrequencyModule,
  cpuCycles,
  onUseCPU,
}: CipherDecryptorProps) {
  const [caesarShift, setCaesarShift] = useState(0);
  const [vigenereKey, setVigenereKey] = useState("");
  const [xorKey, setXorKey] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<CipherType>("caesar");
  const [attemptCache, setAttemptCache] = useState<Set<string>>(new Set());

  const cipherTabs: { type: CipherType; label: string }[] = [
    { type: "caesar", label: "Цезар" },
    { type: "vigenere", label: "Віженер" },
    { type: "base64", label: "Base64" },
    { type: "hex", label: "Hex" },
    { type: "binary", label: "Binary" },
    { type: "morse", label: "Morse" },
    { type: "xor", label: "XOR" },
    { type: "atbash", label: "Atbash" },
  ];

  const inputText = customInput;

  const caesarPreview = useMemo(() => {
    if (activeTab !== "caesar" || !inputText) return "";
    return cipherDecrypt(inputText, "caesar", caesarShift);
  }, [inputText, caesarShift, activeTab]);

  const freqData = useMemo(() => {
    if (!hasFrequencyModule || !inputText) return null;
    return frequencyAnalysis(inputText);
  }, [inputText, hasFrequencyModule]);

  function handleDecrypt() {
    const currentKey =
      activeTab === "caesar"
        ? caesarShift
        : activeTab === "vigenere"
          ? vigenereKey
          : activeTab === "xor"
            ? xorKey
            : "none";
    const attemptHash = `${activeTab}|${inputText.trim()}|${currentKey}`;

    if (!attemptCache.has(attemptHash)) {
      if (!onUseCPU(15)) return;
      setAttemptCache(prev => {
        const newSet = new Set(prev);
        newSet.add(attemptHash);
        return newSet;
      });
    }

    let result = "";
    switch (activeTab) {
      case "caesar":
        result = cipherDecrypt(inputText, "caesar", caesarShift);
        break;
      case "vigenere":
        result = cipherDecrypt(inputText, "vigenere", vigenereKey);
        break;
      case "base64":
        result = cipherDecrypt(inputText, "base64", "");
        break;
      case "hex":
        result = cipherDecrypt(inputText, "hex", "");
        break;
      case "binary":
        result = cipherDecrypt(inputText, "binary", "");
        break;
      case "morse":
        result = cipherDecrypt(inputText, "morse", "");
        break;
      case "xor":
        result = cipherDecrypt(inputText, "xor", xorKey);
        break;
      case "atbash":
        result = cipherDecrypt(inputText, "atbash", "");
        break;
    }

    setDecryptedResult(result);

    const normalizedResult = result.toUpperCase().trim();
    const solvedPuzzle = puzzles.find(
      p =>
        !p.solved &&
        (normalizedResult === p.plainText.toUpperCase().trim() ||
          normalizedResult.includes(p.plainText.toUpperCase().trim()))
    );

    if (solvedPuzzle) {
      setShowSuccess(true);
      onSolved(solvedPuzzle.id);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }

  return (
    <div className="h-full flex flex-col bg-black/90 border border-green-500/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-green-900/20 border-b border-green-500/30">
        <img
          src="/tools/decryptor.png"
          alt="Decryptor"
          className="w-8 h-8 rounded"
        />
        <h3 className="text-green-400 font-mono font-bold text-sm">
          MULTI-CIPHER DECRYPTOR v2.0
        </h3>
        <span className="ml-auto text-xs text-green-600 font-mono">
          CPU: {cpuCycles}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 px-3 py-2 bg-black/50 border-b border-green-500/20">
        {cipherTabs.map(tab => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`px-2 py-1 text-xs font-mono rounded transition-all ${
              activeTab === tab.type
                ? "bg-green-500/30 text-green-300 border border-green-500/50"
                : "text-green-600 hover:text-green-400 hover:bg-green-500/10 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-green-600 font-mono">
            ЗАШИФРОВАНИЙ ТЕКСТ:
          </label>
          <textarea
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            className="w-full h-24 bg-black/80 border border-green-500/30 rounded p-2 text-green-300 font-mono text-xs resize-none focus:border-green-400 focus:outline-none"
            placeholder="Вставте перехоплений зашифрований текст..."
          />
        </div>

        <div className="space-y-3 p-3 bg-green-900/10 border border-green-500/20 rounded">
          {activeTab === "caesar" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-green-600 font-mono">
                  ЗСУВ (SHIFT): {caesarShift}
                </label>
                <span className="text-xs text-green-700 font-mono">0-33</span>
              </div>
              <input
                type="range"
                min="0"
                max="33"
                value={caesarShift}
                onChange={e => setCaesarShift(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
              {caesarPreview && (
                <div className="mt-2 p-2 bg-black/60 border border-green-500/20 rounded">
                  <span className="text-xs text-green-700 font-mono">
                    PREVIEW:{" "}
                  </span>
                  <span className="text-xs text-green-400 font-mono break-all">
                    {caesarPreview.substring(0, 100)}...
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "vigenere" && (
            <div className="space-y-2">
              <label className="text-xs text-green-600 font-mono">
                КЛЮЧОВЕ СЛОВО:
              </label>
              <input
                type="text"
                value={vigenereKey}
                onChange={e => setVigenereKey(e.target.value.toUpperCase())}
                className="w-full bg-black/80 border border-green-500/30 rounded px-3 py-2 text-green-300 font-mono text-sm focus:border-green-400 focus:outline-none"
                placeholder="Введіть ключ..."
              />
            </div>
          )}

          {activeTab === "xor" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-green-600 font-mono">
                  XOR KEY: {xorKey} (0x{xorKey.toString(16)})
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={xorKey}
                onChange={e => setXorKey(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
          )}

          {(activeTab === "base64" ||
            activeTab === "hex" ||
            activeTab === "binary" ||
            activeTab === "morse" ||
            activeTab === "atbash") && (
            <p className="text-xs text-green-600 font-mono">
              Натисніть DECRYPT для автоматичного декодування (
              {activeTab.toUpperCase()})
            </p>
          )}
        </div>

        <button
          onClick={handleDecrypt}
          disabled={cpuCycles < 15}
          className="w-full py-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 font-mono font-bold text-sm hover:bg-green-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ▶ DECRYPT [15 CPU] {cpuCycles < 15 && "(НЕДОСТАТНЬО CPU)"}
        </button>

        {decryptedResult && (
          <div
            className={`p-3 rounded border ${showSuccess ? "bg-green-900/30 border-green-400" : "bg-black/60 border-green-500/20"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-green-600 font-mono">
                РЕЗУЛЬТАТ:
              </span>
              {showSuccess && (
                <span className="text-xs text-green-400 font-mono animate-pulse">
                  ✓ ГОЛОВОЛОМКУ РОЗВ'ЯЗАНО!
                </span>
              )}
            </div>
            <p className="text-sm text-green-300 font-mono break-all whitespace-pre-wrap">
              {decryptedResult}
            </p>
          </div>
        )}

        {hasFrequencyModule && freqData && Object.keys(freqData).length > 0 && (
          <div className="p-3 bg-black/60 border border-amber-500/20 rounded">
            <h4 className="text-xs text-amber-500 font-mono mb-2">
              📊 ЧАСТОТНИЙ АНАЛІЗ:
            </h4>
            <div className="grid grid-cols-6 gap-1">
              {Object.entries(freqData)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 12)
                .map(([char, freq]) => (
                  <div key={char} className="text-center">
                    <div className="text-xs text-green-400 font-mono">
                      {char}
                    </div>
                    <div className="h-12 bg-black/50 rounded relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-amber-500/50 rounded-t"
                        style={{ height: `${Math.min(100, freq * 5)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-green-700 font-mono">
                      {freq.toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-2 text-[10px] text-green-700 font-mono">
              Порівняйте з українською: О=9.4% А=7.7% Н=7.0% І=6.4%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
