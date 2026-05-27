import { GoogleGenerativeAI } from "@google/generative-ai";
import { InvestigationCase, Suspect } from "@/game/types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export type ChatMessage = {
  role: "user" | "model";
  parts: [{ text: string }];
};

export async function chatWithSuspect(
  caseData: InvestigationCase,
  suspect: Suspect,
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    return {
      text: "ПОМИЛКА ЗВ'ЯЗКУ: Відсутній API-ключ Gemini. Перевірте налаштування.",
      modelUsed: "none",
    };
  }

  const keyEvidence = caseData.evidence.find(e => e.isKeyEvidence);
  const culpritId = keyEvidence ? keyEvidence.pointsToSuspectId : null;
  const isGuilty = suspect.id === culpritId;

  const organization = caseData.subtitle || caseData.codename || caseData.title;

  const systemPrompt = `Ви граєте роль підозрюваного в кіберзлочині на ім'я ${suspect.name} (нікнейм: ${suspect.nickname}).
Ваша посада: ${suspect.role}.
Контекст справи: ${organization}.
Ваше алібі: ${suspect.alibi}.
Мотив: ${suspect.motive}.
Біографія: ${suspect.bio}.

СТАТУС: Ви ${isGuilty ? "СПРАВЖНІЙ ЗЛОЧИНЕЦЬ (Винний)" : "НЕВИННИЙ Співробітник"}.

ІНСТРУКЦІЇ:
1. Ви не штучний інтелект і не чат-бот. Ви жива людина, яку зараз допитує приватний детектив.
2. Відповідайте коротко, стисло (не більше 2-3 речень), у стилі ІТ-спеціаліста або корпоративного працівника.
3. ${isGuilty ? "ВИ ВИННІ. Ви намагаєтеся приховати свою провину. Якщо детектив ще не надав прямих доказів, поводьтеся самовпевнено або брешіть. Якщо вас притискають фактами — починайте нервувати." : "ВИ НЕВИННІ. Ви трохи роздратовані тим, що вас підозрюють. Відповідайте чесно, але можете злитися на детектива за витрачений час."}
4. Спілкуйтеся виключно українською мовою.`;

  const fallbackModels = ["gemini-3.1-flash-lite", "gemini-2.5-flash"];
  let lastError = null;

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(message);
      return { text: result.response.text(), modelUsed: modelName };
    } catch (error) {
      console.warn(
        `Gemini Error with model ${modelName}, switching to fallback...`,
        error
      );
      lastError = error;
    }
  }

  console.error("All Gemini models failed:", lastError);
  return {
    text: "СИСТЕМНА ПОМИЛКА: З'єднання з терміналом підозрюваного обірвано. Усі канали зв'язку вичерпано.",
    modelUsed: "none",
  };
}
