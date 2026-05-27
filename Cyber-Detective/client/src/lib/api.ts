import type { DetectiveProfile, InvestigationCase, Suspect } from "@/game/types";
import { chatWithSuspect, type ChatMessage } from "@/lib/gemini";

export type GeminiResponse = {
  text: string;
  modelUsed: string;
};

export type VerdictPayload = {
  caseId: string;
  suspectId: string;
  attempts: number;
  currentPoints: number;
};

export type VerdictResponse = {
  correct: boolean;
  pointsEarned: number;
  attempts: number;
  correctSuspectId: string;
  message: string;
};

const API_BASE = "/api";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `API request failed: ${response.status}`
    );
  }

  return data as T;
}

export async function submitVerdictToServer(
  payload: VerdictPayload
): Promise<VerdictResponse> {
  return fetchJson<VerdictResponse>("/verdict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function syncProfileToServer(profile: DetectiveProfile) {
  try {
    await fetchJson<{ ok: boolean }>("/profile/progress", {
      method: "POST",
      body: JSON.stringify({ profile }),
    });
  } catch {
    // GitHub Pages has no backend. The localStorage profile remains the fallback.
  }
}

export async function getCasesFromServer() {
  return fetchJson<InvestigationCase[]>("/cases");
}

export async function chatWithSuspectViaServer(
  caseData: InvestigationCase,
  suspect: Suspect,
  message: string,
  history: ChatMessage[]
): Promise<GeminiResponse> {
  try {
    return await fetchJson<GeminiResponse>("/gemini/chat", {
      method: "POST",
      body: JSON.stringify({
        caseId: caseData.id,
        suspectId: suspect.id,
        message,
        history,
      }),
    });
  } catch {
    return chatWithSuspect(caseData, suspect, message, history);
  }
}
