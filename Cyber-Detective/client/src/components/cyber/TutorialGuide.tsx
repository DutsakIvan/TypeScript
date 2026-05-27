import { useEffect } from "react";
import { useLocation } from "wouter";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameProfile, gameStore } from "@/game/store";

interface TutorialGuideProps {
  caseId: string;
  activeSection: string;
}

export function TutorialGuide({ caseId, activeSection }: TutorialGuideProps) {
  const profile = useGameProfile();
  const [, setLocation] = useLocation();

  if (caseId !== "tutorial-01") return null;
  if (profile.hasCompletedTutorial) return null;

  const progress = profile.caseProgress[caseId];
  const unlockedEvIds = progress?.unlockedEvidenceIds || [];
  const solved = progress?.caseSolved;

  let text = "";
  let highlight = "";

  if (solved) {
    text =
      "Вітаю! Ви успішно розкрили свою першу справу. Тепер ви готові до справжніх розслідувань. Натисніть кнопку нижче, щоб завершити навчання та перейти до архіву справ.";
    highlight = "none";
  } else if (activeSection === "briefing") {
    text =
      'Вітаю в симуляції CyberClub. Я ваш системний куратор. Зліва ви бачите вкладки розслідування. Зараз ми на вкладці Брифінг. Ознайомтесь із завданням, а потім перейдіть у вкладку "Підозрювані".';
    highlight = "tab-suspects";
  } else if (activeSection === "suspects") {
    text =
      'Тут зібрані всі фігуранти справи. Вивчіть їхні мотиви та алібі. Після цього відкрийте вкладку "Докази".';
    highlight = "tab-evidence";
  } else if (activeSection === "evidence") {
    if (unlockedEvIds.length < 2) {
      text =
        'Зверніть увагу: один із доказів заблоковано (archive.zip). Нам потрібно зламати його, щоб дізнатись правду. Перейдіть до "Терміналу".';
      highlight = "tab-terminal";
    } else {
      text =
        'Доказ розблоковано! Ви можете його прочитати. Тепер ми знаємо всю правду. Переходьте на "Дошку", щоб об\'єднати підозрюваного з його доказом.';
      highlight = "tab-graph";
    }
  } else if (activeSection === "terminal") {
    if (unlockedEvIds.length < 2) {
      text =
        "Це ваш хакерський термінал. Введіть `scan archive.zip` і натисніть Enter, щоб знайти вразливість. Після цього введіть `decrypt archive.zip`, щоб зняти пароль.";
      highlight = "terminal-input";
    } else {
      text =
        'Чудова робота! Архів успішно розшифровано. Поверніться до вкладки "Докази", щоб переглянути його, або одразу переходьте на "Дошку".';
      highlight = "tab-evidence";
    }
  } else if (activeSection === "board") {
    text =
      'Це інтерактивна дошка. Сюди автоматично додаються всі докази та підозрювані. Ви можете перетягувати їх і з\'єднувати лініями. Ознайомились? Переходимо до "Звинувачення"!';
    highlight = "tab-accusation";
  } else if (activeSection === "accusation") {
    text =
      "У вас є мотив і розблокований доказ. Оберіть винного (це Аліса Вонг) і винесіть обвинувачення!";
    highlight = "suspect-cards";
  } else {
    text = "Слідуйте підказкам куратора.";
  }

  useEffect(() => {
    document.querySelectorAll(".tutorial-highlight").forEach(el => {
      el.classList.remove("tutorial-highlight");
    });

    if (highlight && highlight !== "none") {
      setTimeout(() => {
        const el = document.getElementById(highlight);
        if (el) {
          el.classList.add("tutorial-highlight");
        }
      }, 100);
    }

    return () => {
      document.querySelectorAll(".tutorial-highlight").forEach(el => {
        el.classList.remove("tutorial-highlight");
      });
    };
  }, [highlight, activeSection, unlockedEvIds.length]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[400px] rounded-xl border border-cyan-500/50 bg-black/95 p-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-xl animate-fade-rise">
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-50 blur pointer-events-none" />

      <div className="relative mb-4 flex items-center gap-4 border-b border-cyan-500/20 pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-950/80 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display text-base font-bold uppercase tracking-widest text-cyan-300">
            Системний Куратор
          </h4>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-500/70">
            Навчальна симуляція
          </p>
        </div>
      </div>

      <div className="relative text-sm leading-relaxed text-stone-200 font-medium">
        {text}
      </div>

      {solved && (
        <div className="relative mt-5">
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            onClick={() => {
              gameStore.completeTutorial();
              setLocation("/cases");
            }}
          >
            Завершити навчання
          </Button>
        </div>
      )}
    </div>
  );
}
