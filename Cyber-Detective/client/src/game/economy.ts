import type { EconomyState, WorkstationUpgrade } from "./types";

export const DEFAULT_UPGRADES: WorkstationUpgrade[] = [
  {
    id: "cpu_overclock",
    name: "CPU Overclock",
    description: "Збільшує максимальну кількість CPU Cycles на 20% за рівень",
    icon: "Cpu",
    category: "cpu",
    level: 0,
    maxLevel: 5,
    cost: 300,
    effect: "+20% CPU Cycles",
    purchased: false,
  },
  {
    id: "quantum_decryptor",
    name: "Квантовий Дешифратор",
    description: "Зменшує вартість дешифрування на 15% за рівень",
    icon: "Key",
    category: "cpu",
    level: 0,
    maxLevel: 5,
    cost: 500,
    effect: "-15% вартість дешифрування",
    purchased: false,
  },
  {
    id: "ram_expansion",
    name: "RAM Розширення",
    description: "Дозволяє тримати більше відкритих головоломок одночасно",
    icon: "MemoryStick",
    category: "ram",
    level: 0,
    maxLevel: 4,
    cost: 400,
    effect: "+1 слот головоломки",
    purchased: false,
  },
  {
    id: "firewall_pro",
    name: "Firewall Pro",
    description: "Захищає від контр-атак. Зменшує штрафи від динамічних подій",
    icon: "Shield",
    category: "security",
    level: 0,
    maxLevel: 3,
    cost: 600,
    effect: "-30% штрафи від атак",
    purchased: false,
  },
  {
    id: "neural_analyzer",
    name: "Нейронний Аналізатор",
    description:
      "Автоматично підсвічує підозрілі пакети в мережевому аналізаторі",
    icon: "Brain",
    category: "forensic",
    level: 0,
    maxLevel: 3,
    cost: 800,
    effect: "Авто-підсвітка аномалій",
    purchased: false,
  },
  {
    id: "deep_scanner",
    name: "Deep Scanner",
    description: "Покращує стеганографічний сканер — показує підказки",
    icon: "ScanSearch",
    category: "forensic",
    level: 0,
    maxLevel: 3,
    cost: 700,
    effect: "Додаткові підказки стего",
    purchased: false,
  },
  {
    id: "vpn_shield",
    name: "VPN Shield",
    description:
      "Приховує вашу активність від контр-хакерів. Більше часу на реакцію",
    icon: "Globe",
    category: "network",
    level: 0,
    maxLevel: 3,
    cost: 450,
    effect: "+10с на реакцію подій",
    purchased: false,
  },
  {
    id: "frequency_module",
    name: "Частотний Модуль",
    description: "Додає частотний аналіз до дешифратора для підказок",
    icon: "BarChart3",
    category: "forensic",
    level: 0,
    maxLevel: 2,
    cost: 350,
    effect: "Частотний аналіз",
    purchased: false,
  },
];

export const DEFAULT_ECONOMY: EconomyState = {
  credits: 0,
  cpuCycles: 100,
  maxCpuCycles: 100,
  ramSlots: 2,
  securityLevel: 0,
  upgrades: DEFAULT_UPGRADES,
};

export function purchaseUpgrade(
  economy: EconomyState,
  upgradeId: string
): EconomyState | null {
  const upgrade = economy.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return null;
  if (upgrade.level >= upgrade.maxLevel) return null;

  const cost = upgrade.cost * (upgrade.level + 1);
  if (economy.credits < cost) return null;

  const updatedUpgrades = economy.upgrades.map(u => {
    if (u.id === upgradeId) {
      return { ...u, level: u.level + 1, purchased: true };
    }
    return u;
  });

  let newEconomy: EconomyState = {
    ...economy,
    credits: economy.credits - cost,
    upgrades: updatedUpgrades,
  };

  switch (upgradeId) {
    case "cpu_overclock":
      newEconomy.maxCpuCycles = Math.floor(
        100 * (1 + 0.2 * (upgrade.level + 1))
      );
      newEconomy.cpuCycles = Math.min(
        newEconomy.cpuCycles,
        newEconomy.maxCpuCycles
      );
      break;
    case "ram_expansion":
      newEconomy.ramSlots = 2 + (upgrade.level + 1);
      break;
    case "firewall_pro":
      newEconomy.securityLevel = upgrade.level + 1;
      break;
  }

  return newEconomy;
}

export function getUpgradeCost(upgrade: WorkstationUpgrade): number {
  return upgrade.cost * (upgrade.level + 1);
}

export function consumeCPU(
  economy: EconomyState,
  amount: number
): EconomyState | null {
  const decryptor = economy.upgrades.find(u => u.id === "quantum_decryptor");
  const discount = decryptor ? 1 - 0.15 * decryptor.level : 1;
  const actualCost = Math.max(1, Math.floor(amount * discount));

  if (economy.cpuCycles < actualCost) return null;

  return {
    ...economy,
    cpuCycles: economy.cpuCycles - actualCost,
  };
}

export function earnCredits(
  economy: EconomyState,
  amount: number
): EconomyState {
  return {
    ...economy,
    credits: economy.credits + amount,
  };
}

export function resetCPU(economy: EconomyState): EconomyState {
  return {
    ...economy,
    cpuCycles: economy.maxCpuCycles,
  };
}

export function getEventTimeBonus(economy: EconomyState): number {
  const vpn = economy.upgrades.find(u => u.id === "vpn_shield");
  return vpn ? vpn.level * 10 : 0;
}

export function getEventPenaltyReduction(economy: EconomyState): number {
  const firewall = economy.upgrades.find(u => u.id === "firewall_pro");
  return firewall ? firewall.level * 0.3 : 0;
}

export function hasNeuralAnalyzer(economy: EconomyState): boolean {
  const analyzer = economy.upgrades.find(u => u.id === "neural_analyzer");
  return (analyzer?.level ?? 0) > 0;
}

export function hasFrequencyModule(economy: EconomyState): boolean {
  const module = economy.upgrades.find(u => u.id === "frequency_module");
  return (module?.level ?? 0) > 0;
}

export function hasDeepScanner(economy: EconomyState): boolean {
  const scanner = economy.upgrades.find(u => u.id === "deep_scanner");
  return (scanner?.level ?? 0) > 0;
}
