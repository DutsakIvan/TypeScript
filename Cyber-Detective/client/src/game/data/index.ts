import type {
  InvestigationCase,
  DetectiveProfile,
  Achievement,
} from "../types";
import { case404 } from "./case-404";
import { caseCrypto } from "./case-crypto";
import { caseHospital } from "./case-hospital";
import { caseTutorial } from "./case-tutorial";
import { DEFAULT_UPGRADES } from "../economy";

export const ALL_CASES: InvestigationCase[] = [
  caseTutorial,
  case404,
  caseCrypto,
  caseHospital,
];

export function getCaseById(id: string): InvestigationCase | undefined {
  return ALL_CASES.find(c => c.id === id);
}

export const RANKS: { name: string; minPoints: number; description: string }[] =
  [
    {
      name: "Стажер",
      minPoints: 0,
      description: "Перші кроки в цифровій криміналістиці",
    },
    {
      name: "Молодший детектив",
      minPoints: 800,
      description: "Базові навички розслідування",
    },
    { name: "Детектив", minPoints: 1800, description: "Досвідчений слідчий" },
    {
      name: "Старший детектив",
      minPoints: 3500,
      description: "Майстер логічного аналізу",
    },
    {
      name: "Інспектор кіберзлочинів",
      minPoints: 5500,
      description: "Експерт з цифрових слідів",
    },
    {
      name: "Легенда Cyber Unit",
      minPoints: 8000,
      description: "Найкращий з найкращих",
    },
  ];

export function getRankForPoints(points: number): string {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (points >= r.minPoints) rank = r.name;
  }
  return rank;
}

export function getNextRank(
  points: number
): { name: string; minPoints: number } | null {
  for (const r of RANKS) {
    if (points < r.minPoints) return r;
  }
  return null;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_solve",
    title: "Перша справа",
    description: "Розкрити свою першу справу",
    icon: "Award",
    condition: p => p.casesSolved.length >= 1,
  },
  {
    id: "no_hints",
    title: "Чисте розслідування",
    description: "Розкрити справу без використання підказок",
    icon: "Sparkles",
    condition: p =>
      Object.values(p.caseProgress).some(
        cp => cp.caseSolved && cp.hintsUsed.length === 0
      ),
  },
  {
    id: "perfectionist",
    title: "Перфекціоніст",
    description: "Розблокувати ВСІ докази в одній справі",
    icon: "Star",
    condition: p =>
      Object.entries(p.caseProgress).some(([cid, cp]) => {
        const c = getCaseById(cid);
        if (!c) return false;
        const lockedEvidence = c.evidence.filter(e => e.status !== "open");
        return lockedEvidence.every(e => cp.unlockedEvidenceIds.includes(e.id));
      }),
  },
  {
    id: "first_try",
    title: "З першої спроби",
    description: "Розкрити справу з першої спроби",
    icon: "Target",
    condition: p =>
      Object.values(p.caseProgress).some(
        cp => cp.caseSolved && cp.attempts <= 1
      ),
  },
  {
    id: "all_solved",
    title: "Майстер-детектив",
    description: "Розкрити всі доступні справи",
    icon: "Trophy",
    condition: p => p.casesSolved.length >= ALL_CASES.length,
  },
  {
    id: "speed_run",
    title: "Швидкий розум",
    description: "Розкрити справу менш ніж за 5 хвилин",
    icon: "Zap",
    condition: p =>
      Object.values(p.caseProgress).some(
        cp =>
          cp.caseSolved &&
          cp.endTime &&
          cp.endTime - cp.startTime < 5 * 60 * 1000
      ),
  },
  {
    id: "hardcore",
    title: "Хардкор",
    description: "Розкрити справу складності HARD",
    icon: "Shield",
    condition: p =>
      p.casesSolved.includes("case_hospital") ||
      Object.entries(p.caseProgress).some(([cid, cp]) => {
        const c = getCaseById(cid);
        return c?.difficulty === "hard" && cp.caseSolved;
      }),
  },
  {
    id: "terminal_master",
    title: "Майстер терміналу",
    description: "Виконати 20+ команд у терміналі (загалом)",
    icon: "Terminal",
    condition: p => p.totalPoints > 0 && p.casesSolved.length > 0,
  },
];

export const DEFAULT_PROFILE: DetectiveProfile = {
  rank: "Стажер",
  totalPoints: 0,
  casesSolved: [],
  caseProgress: {},
  currentCaseId: null,
  unlockedAchievements: [],
  economy: {
    credits: 100,
    cpuCycles: 100,
    maxCpuCycles: 100,
    ramSlots: 2,
    securityLevel: 0,
    upgrades: DEFAULT_UPGRADES,
  },
  totalCasesGenerated: 0,
  streak: 0,
  hasCompletedTutorial: false,
};

export function isCaseUnlocked(
  caseId: string,
  profile: DetectiveProfile
): boolean {
  const c = getCaseById(caseId);
  if (!c) return false;
  if (!c.unlockRequirement) return true;
  return profile.casesSolved.includes(c.unlockRequirement);
}
