import { useState, useEffect, useRef } from "react";
import type { DynamicEvent, EconomyState } from "../../game/types";
import {
  getEventTimeBonus,
  getEventPenaltyReduction,
} from "../../game/economy";

interface DynamicEventPanelProps {
  events: DynamicEvent[];
  economy: EconomyState;
  onEventResolved: (eventId: string, success: boolean) => void;
  onTriggerEvent: () => void;
  isPaused: boolean;
  missCount: number;
}

export function DynamicEventPanel({
  events,
  economy,
  onEventResolved,
  onTriggerEvent,
  isPaused,
  missCount,
}: DynamicEventPanelProps) {
  const [activeEvent, setActiveEvent] = useState<DynamicEvent | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [inputCommand, setInputCommand] = useState("");
  const [eventResult, setEventResult] = useState<"success" | "failure" | null>(
    null
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const nextEvent = events.find(e => !e.resolved);
    if (nextEvent && !activeEvent) {
      const delay = 5000 + Math.random() * 15000;
      const timeout = setTimeout(() => {
        setActiveEvent(nextEvent);
        const bonus = getEventTimeBonus(economy);
        setTimeRemaining((nextEvent.timeLimit ?? 30) + bonus);
        setEventResult(null);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [events, activeEvent]);

  useEffect(() => {
    if (!activeEvent || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeEvent, isPaused]);

  function handleSubmit() {
    if (!activeEvent) return;
    const normalized = inputCommand.trim().toLowerCase();
    const expected = activeEvent.requiredAction.toLowerCase();

    if (normalized === expected || normalized.includes(expected)) {
      handleSuccess();
    } else {
      setInputCommand("");
    }
  }

  function handleSuccess() {
    if (!activeEvent) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setEventResult("success");
    onEventResolved(activeEvent.id, true);
    setTimeout(() => {
      setActiveEvent(null);
      setEventResult(null);
      setInputCommand("");
    }, 2000);
  }

  function handleFailure() {
    if (!activeEvent) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setEventResult("failure");
    onEventResolved(activeEvent.id, false);
    setTimeout(() => {
      setActiveEvent(null);
      setEventResult(null);
      setInputCommand("");
    }, 2000);
  }

  if (!activeEvent) return null;

  const urgencyColor =
    timeRemaining > 20 ? "amber" : timeRemaining > 10 ? "orange" : "red";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-96 animate-in slide-in-from-right`}
    >
      {missCount === 2 && (
        <div className="mb-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono text-center animate-pulse">
          УВАГА: якщо ви будете постійно пропускати, ваші кредити почнуть
          мінусуватись!
        </div>
      )}
      <div
        className={`rounded-lg border-2 overflow-hidden shadow-2xl ${
          eventResult === "success"
            ? "border-green-400 shadow-green-500/20"
            : eventResult === "failure"
              ? "border-red-400 shadow-red-500/20"
              : `border-${urgencyColor}-500/70 shadow-${urgencyColor}-500/20`
        }`}
        style={{
          borderColor:
            eventResult === "success"
              ? "#4ade80"
              : eventResult === "failure"
                ? "#f87171"
                : timeRemaining > 20
                  ? "#f59e0b"
                  : timeRemaining > 10
                    ? "#f97316"
                    : "#ef4444",
          boxShadow: `0 0 30px ${
            eventResult === "success"
              ? "rgba(74,222,128,0.3)"
              : eventResult === "failure"
                ? "rgba(248,113,113,0.3)"
                : timeRemaining > 20
                  ? "rgba(245,158,11,0.3)"
                  : "rgba(239,68,68,0.3)"
          }`,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-black/95">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              eventResult === "success"
                ? "bg-green-400"
                : eventResult === "failure"
                  ? "bg-red-400"
                  : timeRemaining > 10
                    ? "bg-amber-400"
                    : "bg-red-500"
            }`}
          />
          <h4 className="text-sm font-mono font-bold text-white flex-1">
            {activeEvent.title}
          </h4>
          {!eventResult && (
            <div
              className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${
                timeRemaining > 10
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-red-400 bg-red-500/10 animate-pulse"
              }`}
            >
              {timeRemaining}s
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-900/95">
          {eventResult ? (
            <div
              className={`text-center py-2 ${
                eventResult === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              <div className="text-2xl mb-1">
                {eventResult === "success" ? "✓" : "✗"}
              </div>
              <div className="text-sm font-mono">
                {eventResult === "success"
                  ? `+${activeEvent.reward ?? 0} ₿!`
                  : `СИГНАЛ ВТРАЧЕНО ${missCount > 3 ? "(-20 ₿)" : "(бонусні очки не зараховано)"}`}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-300 font-mono mb-3">
                {activeEvent.description}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCommand}
                  onChange={e => setInputCommand(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder={`> ${activeEvent.requiredAction}`}
                  className="flex-1 px-3 py-2 bg-black/80 border border-gray-600 rounded text-sm font-mono text-green-300 focus:outline-none focus:border-green-500"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded text-green-300 font-mono text-sm font-bold hover:bg-green-500/30"
                >
                  ▶
                </button>
              </div>
              <p className="text-[10px] text-gray-600 font-mono mt-2">
                Підказка: введіть "{activeEvent.requiredAction}"
              </p>
            </>
          )}
        </div>

        {!eventResult && (
          <div className="h-1 bg-gray-800">
            <div
              className={`h-full transition-all duration-1000 ${
                timeRemaining > 10 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{
                width: `${(timeRemaining / ((activeEvent.timeLimit ?? 30) + getEventTimeBonus(economy))) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
