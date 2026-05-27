import { useState } from "react";
import type { EconomyState, WorkstationUpgrade } from "../../game/types";
import { purchaseUpgrade, getUpgradeCost } from "../../game/economy";

interface UpgradeShopProps {
  economy: EconomyState;
  onPurchase: (newEconomy: EconomyState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeShop({
  economy,
  onPurchase,
  isOpen,
  onClose,
}: UpgradeShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(
    null
  );

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "Все", icon: "🔧" },
    { id: "cpu", label: "CPU", icon: "⚡" },
    { id: "ram", label: "RAM", icon: "💾" },
    { id: "security", label: "Захист", icon: "🛡️" },
    { id: "forensic", label: "Forensic", icon: "🔍" },
    { id: "network", label: "Мережа", icon: "🌐" },
  ];

  const filteredUpgrades =
    selectedCategory === "all"
      ? economy.upgrades
      : economy.upgrades.filter(u => u.category === selectedCategory);

  function handlePurchase(upgrade: WorkstationUpgrade) {
    const newEconomy = purchaseUpgrade(economy, upgrade.id);
    if (newEconomy) {
      setPurchaseAnimation(upgrade.id);
      onPurchase(newEconomy);
      setTimeout(() => setPurchaseAnimation(null), 1000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[85vh] bg-gray-900 border border-cyan-500/30 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10">
        {}
        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-cyan-900/30 to-gray-900 border-b border-cyan-500/20">
          <img
            src="/tools/upgrade-shop.png"
            alt="Shop"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h2 className="text-cyan-300 font-mono font-bold text-lg">
              HARDWARE UPGRADES
            </h2>
            <p className="text-xs text-cyan-600 font-mono">
              Покращуйте свою робочу станцію
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 font-mono">БАЛАНС</div>
              <div className="text-lg text-amber-400 font-mono font-bold">
                {economy.credits} ₿
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700 rounded hover:border-red-500/50 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {}
        <div className="flex gap-2 px-6 py-3 bg-black/30 border-b border-gray-700/50 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUpgrades.map(upgrade => {
              const cost = getUpgradeCost(upgrade);
              const canAfford = economy.credits >= cost;
              const isMaxed = upgrade.level >= upgrade.maxLevel;
              const isPurchasing = purchaseAnimation === upgrade.id;

              return (
                <div
                  key={upgrade.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isPurchasing
                      ? "border-green-400 bg-green-900/20 scale-[1.02]"
                      : isMaxed
                        ? "border-gray-700/50 bg-gray-800/30 opacity-60"
                        : "border-cyan-500/20 bg-black/40 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center text-lg">
                      {upgrade.category === "cpu"
                        ? "⚡"
                        : upgrade.category === "ram"
                          ? "💾"
                          : upgrade.category === "security"
                            ? "🛡️"
                            : upgrade.category === "forensic"
                              ? "🔍"
                              : "🌐"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-cyan-300 font-mono font-bold">
                        {upgrade.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {upgrade.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-cyan-600 font-mono">
                          {upgrade.effect}
                        </span>
                        <div className="flex gap-0.5 ml-auto">
                          {Array.from({ length: upgrade.maxLevel }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < upgrade.level
                                    ? "bg-cyan-400"
                                    : "bg-gray-700"
                                }`}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                    <span className="text-xs font-mono text-gray-500">
                      Рівень {upgrade.level}/{upgrade.maxLevel}
                    </span>
                    {isMaxed ? (
                      <span className="text-xs font-mono text-green-500">
                        MAX
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchase(upgrade)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition-all ${
                          canAfford
                            ? "border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                            : "border-gray-700 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {cost} ₿
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="px-6 py-3 bg-black/50 border-t border-gray-700/50 flex items-center gap-6">
          <div className="text-xs font-mono">
            <span className="text-gray-600">CPU: </span>
            <span className="text-green-400">{economy.maxCpuCycles}</span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-gray-600">RAM: </span>
            <span className="text-blue-400">{economy.ramSlots} slots</span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-gray-600">Security: </span>
            <span className="text-purple-400">Lv.{economy.securityLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
