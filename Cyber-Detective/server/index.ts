import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALL_CASES, DEFAULT_PROFILE } from "../client/src/game/data/index";
import type { DetectiveProfile, InvestigationCase } from "../client/src/game/types";
import type { ChatMessage } from "../client/src/lib/gemini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeDir = path.resolve(process.cwd(), ".runtime-data");
const profilePath = path.join(runtimeDir, "profile.json");

type VerdictRequest = {
  caseId?: string;
  suspectId?: string;
  attempts?: number;
  currentPoints?: number;
};

type ProfilePayload = {
  profile?: DetectiveProfile;
};

type GeminiChatRequest = {
  caseId?: string;
  suspectId?: string;
  message?: string;
  history?: ChatMessage[];
};

function getCase(caseId: string | undefined): InvestigationCase | undefined {
  if (!caseId) return undefined;
  return ALL_CASES.find(c => c.id === caseId);
}

function publicCaseSummary(c: InvestigationCase) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    codename: c.codename,
    difficulty: c.difficulty,
    description: c.description,
    basePoints: c.basePoints,
    unlockRequirement: c.unlockRequirement ?? null,
    suspectsCount: c.suspects.length,
    evidenceCount: c.evidence.length,
  };
}

async function ensureRuntimeDir() {
  await fs.mkdir(runtimeDir, { recursive: true });
}

async function readServerProfile(): Promise<DetectiveProfile> {
  try {
    const raw = await fs.readFile(profilePath, "utf8");
    const stored = JSON.parse(raw) as Partial<DetectiveProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...stored,
      economy: {
        ...DEFAULT_PROFILE.economy,
        ...(stored.economy || {}),
      },
      casesSolved: stored.casesSolved || [],
      caseProgress: stored.caseProgress || {},
      unlockedAchievements: stored.unlockedAchievements || [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

async function writeServerProfile(profile: DetectiveProfile) {
  await ensureRuntimeDir();
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), "utf8");
}

function buildSuspectPrompt(caseData: InvestigationCase, suspectId: string) {
  const suspect = caseData.suspects.find(s => s.id === suspectId);
  if (!suspect) return null;

  const keyEvidence = caseData.evidence.find(e => e.isKeyEvidence);
  const culpritId = keyEvidence ? keyEvidence.pointsToSuspectId : null;
  const isGuilty = suspect.id === culpritId;
  const organization = caseData.subtitle || caseData.codename || caseData.title;

  return {
    suspect,
    prompt: `Ви граєте роль підозрюваного в кіберзлочині на ім'я ${suspect.name} (нікнейм: ${suspect.nickname}).
Ваша посада: ${suspect.role}.
Контекст справи: ${organization}.
Ваше алібі: ${suspect.alibi}.
Мотив: ${suspect.motive}.
Біографія: ${suspect.bio}.

СТАТУС: Ви ${isGuilty ? "СПРАВЖНІЙ ЗЛОЧИНЕЦЬ (Винний)" : "НЕВИННИЙ співробітник"}.

ІНСТРУКЦІЇ:
1. Ви не штучний інтелект і не чат-бот. Ви жива людина, яку зараз допитує приватний детектив.
2. Відповідайте коротко, стисло (не більше 2-3 речень), у стилі ІТ-спеціаліста або корпоративного працівника.
3. ${isGuilty ? "ВИ ВИННІ. Ви намагаєтеся приховати свою провину. Якщо детектив ще не надав прямих доказів, поводьтеся самовпевнено або брешіть. Якщо вас притискають фактами — починайте нервувати." : "ВИ НЕВИННІ. Ви трохи роздратовані тим, що вас підозрюють. Відповідайте чесно, але можете злитися на детектива за витрачений час."}
4. Спілкуйтеся виключно українською мовою.`,
  };
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "cyber-detective-api" });
  });

  app.get("/api/cases", (_req, res) => {
    res.json(ALL_CASES.map(publicCaseSummary));
  });

  app.get("/api/cases/:id", (req, res) => {
    const caseData = getCase(req.params.id);
    if (!caseData) {
      res.status(404).json({ error: "CASE_NOT_FOUND" });
      return;
    }
    res.json(caseData);
  });

  app.get("/api/profile", async (_req, res) => {
    res.json(await readServerProfile());
  });

  app.post("/api/profile/progress", async (req, res) => {
    const { profile } = req.body as ProfilePayload;
    if (!profile || typeof profile !== "object") {
      res.status(400).json({ error: "INVALID_PROFILE" });
      return;
    }
    await writeServerProfile(profile);
    res.json({ ok: true, profile });
  });

  app.post("/api/verdict", (req, res) => {
    const { caseId, suspectId, attempts = 0, currentPoints } =
      req.body as VerdictRequest;
    const caseData = getCase(caseId);

    if (!caseData || !suspectId) {
      res.status(400).json({ error: "INVALID_VERDICT_PAYLOAD" });
      return;
    }

    const correct = caseData.correctSuspectId === suspectId;
    const nextAttempts = Math.max(0, attempts) + 1;
    const basePoints =
      typeof currentPoints === "number" ? currentPoints : caseData.basePoints;

    if (correct) {
      const finalPoints = Math.max(
        50,
        nextAttempts > 1 ? basePoints * 0.7 : basePoints
      );
      res.json({
        correct: true,
        pointsEarned: Math.floor(finalPoints),
        attempts: nextAttempts,
        correctSuspectId: caseData.correctSuspectId,
        message: "Вердикт правильний. Справу успішно розкрито.",
      });
      return;
    }

    const penalty =
      caseData.difficulty === "hard"
        ? 500
        : caseData.difficulty === "medium"
          ? 300
          : 200;

    res.json({
      correct: false,
      pointsEarned: -penalty,
      attempts: nextAttempts,
      correctSuspectId: caseData.correctSuspectId,
      message: "Вердикт помилковий. Потрібні додаткові докази.",
    });
  });

  app.post("/api/gemini/chat", async (req, res) => {
    const { caseId, suspectId, message, history = [] } =
      req.body as GeminiChatRequest;
    const caseData = getCase(caseId);
    const promptData = caseData ? buildSuspectPrompt(caseData, suspectId || "") : null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!caseData || !promptData || !message) {
      res.status(400).json({ error: "INVALID_CHAT_PAYLOAD" });
      return;
    }

    if (!apiKey) {
      res.status(503).json({
        error: "GEMINI_KEY_MISSING",
        text: "ПОМИЛКА ЗВ'ЯЗКУ: серверний Gemini API-ключ не налаштовано.",
        modelUsed: "none",
      });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fallbackModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let lastError: unknown = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: promptData.prompt,
        });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        res.json({ text: result.response.text(), modelUsed: modelName });
        return;
      } catch (error) {
        lastError = error;
        console.warn(`Gemini Error with model ${modelName}`, error);
      }
    }

    console.error("All Gemini models failed", lastError);
    res.status(502).json({
      error: "GEMINI_FAILED",
      text: "СИСТЕМНА ПОМИЛКА: з'єднання з терміналом підозрюваного обірвано.",
      modelUsed: "none",
    });
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
