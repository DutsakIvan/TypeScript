import { useEffect, useState, useSyncExternalStore } from "react";
import { syncProfileToServer, type VerdictResponse } from "@/lib/api";
import type { CaseProgress, DetectiveProfile } from "./types";
import {
  ACHIEVEMENTS,
  DEFAULT_PROFILE,
  getCaseById,
  getRankForPoints,
} from "./data";

const STORAGE_KEY = "cyber-detective-profile-v2";

type Listener = () => void;

class GameStore {
  private profile: DetectiveProfile = DEFAULT_PROFILE;
  private listeners: Set<Listener> = new Set();
  private serverSyncTimer: number | undefined;

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.profile = {
          ...DEFAULT_PROFILE,
          ...data,
          economy: {
            ...DEFAULT_PROFILE.economy,
            ...(data.economy || {}),
          },
          caseProgress: data.caseProgress || {},
          casesSolved: data.casesSolved || [],
          unlockedAchievements: data.unlockedAchievements || [],
        };
      }
    } catch {
      this.profile = DEFAULT_PROFILE;
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {}
  }

  private scheduleServerSync() {
    if (typeof window === "undefined") return;
    window.clearTimeout(this.serverSyncTimer);
    this.serverSyncTimer = window.setTimeout(() => {
      void syncProfileToServer(this.profile);
    }, 400);
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.profile;

  private notify() {
    this.profile.rank = getRankForPoints(this.profile.totalPoints);
    this.checkAchievements();
    this.persist();
    this.listeners.forEach(l => l());
    this.scheduleServerSync();
  }

  private checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
      if (
        !this.profile.unlockedAchievements.includes(ach.id) &&
        ach.condition(this.profile)
      ) {
        this.profile.unlockedAchievements = [
          ...this.profile.unlockedAchievements,
          ach.id,
        ];
      }
    }
  }

  startCase(caseId: string) {
    const c = getCaseById(caseId);
    if (!c) return;

    const existing = this.profile.caseProgress[caseId];
    if (existing && !existing.caseSolved) {
      this.profile = { ...this.profile, currentCaseId: caseId };
    } else {
      const fresh: CaseProgress = {
        caseId,
        caseStarted: true,
        caseSolved: false,
        unlockedEvidenceIds: c.evidence
          .filter(e => e.status === "open")
          .map(e => e.id),
        reviewedEvidenceIds: [],
        hintsUsed: [],
        attempts: 0,
        startTime: Date.now(),
        points: c.basePoints,
        solvedCipherIds: [],
        solvedNetworkIds: [],
        solvedStegoIds: [],
        resolvedEventIds: [],
        cpuUsed: 0,
      };
      this.profile = {
        ...this.profile,
        currentCaseId: caseId,
        caseProgress: { ...this.profile.caseProgress, [caseId]: fresh },
      };
    }
    this.notify();
  }

  unlockEvidence(caseId: string, evidenceId: string): boolean {
    const cp = this.profile.caseProgress[caseId];
    if (!cp) return false;
    if (cp.unlockedEvidenceIds.includes(evidenceId)) return false;
    const updated: CaseProgress = {
      ...cp,
      unlockedEvidenceIds: [...cp.unlockedEvidenceIds, evidenceId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
    return true;
  }

  reviewEvidence(caseId: string, evidenceId: string) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp) return;
    if (cp.reviewedEvidenceIds.includes(evidenceId)) return;
    const updated: CaseProgress = {
      ...cp,
      reviewedEvidenceIds: [...cp.reviewedEvidenceIds, evidenceId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  useHint(caseId: string, hintId: string, cost: number) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp) return;
    if (cp.hintsUsed.includes(hintId)) return;
    const updated: CaseProgress = {
      ...cp,
      hintsUsed: [...cp.hintsUsed, hintId],
      points: Math.max(0, cp.points - cost),
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  submitAccusation(
    caseId: string,
    suspectId: string
  ): { correct: boolean; pointsEarned: number } {
    const c = getCaseById(caseId);
    const cp = this.profile.caseProgress[caseId];
    if (!c || !cp) return { correct: false, pointsEarned: 0 };

    const isCorrect = c.correctSuspectId === suspectId;
    const newAttempts = cp.attempts + 1;

    if (isCorrect) {
      const finalPoints = Math.max(
        50,
        cp.points - newAttempts > 1 ? cp.points * 0.7 : cp.points
      );
      const updated: CaseProgress = {
        ...cp,
        attempts: newAttempts,
        caseSolved: true,
        endTime: Date.now(),
        points: Math.floor(finalPoints),
      };
      const newSolved = this.profile.casesSolved.includes(caseId)
        ? this.profile.casesSolved
        : [...this.profile.casesSolved, caseId];
      this.profile = {
        ...this.profile,
        caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
        casesSolved: newSolved,
        totalPoints: this.profile.totalPoints + Math.floor(finalPoints),
      };
      this.notify();
      return { correct: true, pointsEarned: Math.floor(finalPoints) };
    } else {
      const penalty =
        c.difficulty === "hard" ? 500 : c.difficulty === "medium" ? 300 : 200;
      const updated: CaseProgress = {
        ...cp,
        attempts: newAttempts,
        points: Math.max(0, cp.points - penalty),
      };
      this.profile = {
        ...this.profile,
        caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
      };
      this.notify();
      return { correct: false, pointsEarned: -penalty };
    }
  }

  applyServerVerdict(
    caseId: string,
    result: VerdictResponse
  ): { correct: boolean; pointsEarned: number } {
    const cp = this.profile.caseProgress[caseId];
    if (!cp) return { correct: result.correct, pointsEarned: result.pointsEarned };

    const updated: CaseProgress = result.correct
      ? {
          ...cp,
          attempts: result.attempts,
          caseSolved: true,
          endTime: Date.now(),
          points: Math.max(0, result.pointsEarned),
        }
      : {
          ...cp,
          attempts: result.attempts,
          points: Math.max(0, cp.points + result.pointsEarned),
        };

    const newSolved = result.correct && !this.profile.casesSolved.includes(caseId)
      ? [...this.profile.casesSolved, caseId]
      : this.profile.casesSolved;

    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
      casesSolved: newSolved,
      totalPoints: result.correct
        ? this.profile.totalPoints + Math.max(0, result.pointsEarned)
        : this.profile.totalPoints,
    };
    this.notify();
    return { correct: result.correct, pointsEarned: result.pointsEarned };
  }

  exitCase() {
    this.profile = { ...this.profile, currentCaseId: null };
    this.notify();
  }

  resetCase(caseId: string) {
    const { [caseId]: _, ...rest } = this.profile.caseProgress;
    void _;
    const newSolved = this.profile.casesSolved.filter(id => id !== caseId);
    this.profile = {
      ...this.profile,
      caseProgress: rest,
      casesSolved: newSolved,
      currentCaseId: null,
    };
    this.notify();
  }

  resetAll() {
    this.profile = DEFAULT_PROFILE;
    this.notify();
  }

  getEconomy(): import("./types").EconomyState {
    return this.profile.economy;
  }

  updateEconomy(economy: import("./types").EconomyState) {
    this.profile = { ...this.profile, economy };
    this.notify();
  }

  solveCipher(caseId: string, cipherId: string) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp || cp.solvedCipherIds.includes(cipherId)) return;
    const updated = {
      ...cp,
      solvedCipherIds: [...cp.solvedCipherIds, cipherId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  solveNetwork(caseId: string, challengeId: string) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp || cp.solvedNetworkIds.includes(challengeId)) return;
    const updated = {
      ...cp,
      solvedNetworkIds: [...cp.solvedNetworkIds, challengeId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  solveStego(caseId: string, challengeId: string) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp || cp.solvedStegoIds.includes(challengeId)) return;
    const updated = {
      ...cp,
      solvedStegoIds: [...cp.solvedStegoIds, challengeId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  resolveEvent(caseId: string, eventId: string) {
    const cp = this.profile.caseProgress[caseId];
    if (!cp || cp.resolvedEventIds.includes(eventId)) return;
    const updated = {
      ...cp,
      resolvedEventIds: [...cp.resolvedEventIds, eventId],
    };
    this.profile = {
      ...this.profile,
      caseProgress: { ...this.profile.caseProgress, [caseId]: updated },
    };
    this.notify();
  }

  addCredits(amount: number) {
    this.profile = {
      ...this.profile,
      economy: {
        ...this.profile.economy,
        credits: this.profile.economy.credits + amount,
      },
    };
    this.notify();
  }

  incrementStreak() {
    this.profile = {
      ...this.profile,
      streak: this.profile.streak + 1,
    };
    this.notify();
  }

  resetStreak() {
    this.profile = {
      ...this.profile,
      streak: 0,
    };
    this.notify();
  }

  incrementGenerated() {
    this.profile = {
      ...this.profile,
      totalCasesGenerated: this.profile.totalCasesGenerated + 1,
    };
    this.notify();
  }

  completeTutorial() {
    this.profile = {
      ...this.profile,
      hasCompletedTutorial: true,
    };
    this.notify();
  }
}

export const gameStore = new GameStore();

export function useGameProfile(): DetectiveProfile {
  return useSyncExternalStore(
    gameStore.subscribe,
    gameStore.getSnapshot,
    gameStore.getSnapshot
  );
}

export function useCaseTimer(caseId: string | null): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!caseId) return;
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [caseId]);
  if (!caseId) return 0;
  const cp = gameStore.getSnapshot().caseProgress[caseId];
  if (!cp) return 0;
  if (cp.endTime) return cp.endTime - cp.startTime;
  return Date.now() - cp.startTime;
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
