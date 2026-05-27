import { useState, useEffect, useRef } from "react";
import { InvestigationCase, Suspect } from "@/game/types";
import type { ChatMessage } from "@/lib/gemini";
import { chatWithSuspectViaServer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, UserCircle2, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterrogationTabProps {
  caseData: InvestigationCase;
}

type ChatHistoryMap = Record<string, ChatMessage[]>;

export function InterrogationTab({ caseData }: InterrogationTabProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistoryMap>(() => {
    const saved = localStorage.getItem(`interrogation_${caseData.id}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectedModel, setConnectedModel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(
      `interrogation_${caseData.id}`,
      JSON.stringify(chatHistories)
    );
  }, [chatHistories, caseData.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistories, selectedSuspect]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedSuspect || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");

    const suspectId = selectedSuspect.id;
    const currentHistory = chatHistories[suspectId] || [];

    const updatedHistory: ChatMessage[] = [
      ...currentHistory,
      { role: "user", parts: [{ text: userMessage }] },
    ];

    setChatHistories(prev => ({ ...prev, [suspectId]: updatedHistory }));
    setIsLoading(true);

    try {
      const response = await chatWithSuspectViaServer(
        caseData,
        selectedSuspect,
        userMessage,
        currentHistory
      );

      setConnectedModel(response.modelUsed);

      setChatHistories(prev => ({
        ...prev,
        [suspectId]: [
          ...(prev[suspectId] || []),
          { role: "model", parts: [{ text: response.text }] },
        ],
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid h-[600px] grid-cols-1 overflow-hidden rounded-xl border border-cyan-500/20 bg-card/50 lg:grid-cols-4">
      {}
      <div className="border-b border-cyan-500/20 bg-black/40 lg:col-span-1 lg:border-b-0 lg:border-r">
        <div className="p-4 border-b border-cyan-500/20">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2">
            <UserCircle2 className="h-4 w-4" /> Підозрювані
          </h3>
        </div>
        <ScrollArea className="h-[150px] lg:h-[calc(600px-50px)]">
          <div className="p-2 flex flex-col gap-1">
            {caseData.suspects.map(suspect => (
              <button
                key={suspect.id}
                onClick={() => setSelectedSuspect(suspect)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                  selectedSuspect?.id === suspect.id
                    ? "bg-cyan-500/15 border border-cyan-500/30"
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                <img
                  src={suspect.avatar}
                  alt={suspect.name}
                  className="h-10 w-10 rounded-full border border-cyan-500/30 object-cover grayscale"
                />
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-stone-200">
                    {suspect.name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-stone-500">
                    @{suspect.nickname}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {}
      <div className="flex flex-col bg-black/20 lg:col-span-3">
        {selectedSuspect ? (
          <>
            {}
            <div className="flex items-center gap-3 border-b border-cyan-500/20 bg-black/40 p-4">
              <img
                src={selectedSuspect.avatar}
                alt={selectedSuspect.name}
                className="h-8 w-8 rounded-full border border-cyan-500/50 object-cover"
              />
              <div>
                <h3 className="font-display font-semibold text-stone-100">
                  {selectedSuspect.name}
                </h3>
                <p className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider">
                  {selectedSuspect.role}{" "}
                  {connectedModel && connectedModel !== "none"
                    ? `// АКТИВНА ШІ: ${connectedModel}`
                    : ""}
                </p>
              </div>
            </div>

            {}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {(chatHistories[selectedSuspect.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-cyan-600 text-white rounded-br-none"
                      : "bg-stone-800 text-stone-200 rounded-bl-none border border-stone-700"
                  )}
                >
                  <span className="font-mono text-[10px] opacity-50 uppercase">
                    {msg.role === "user"
                      ? "Ви (Детектив)"
                      : selectedSuspect.nickname}
                  </span>
                  <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
              ))}

              {isLoading && (
                <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 text-sm bg-stone-800 text-stone-200 rounded-bl-none border border-stone-700">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                </div>
              )}
            </div>

            {}
            <div className="border-t border-cyan-500/20 bg-black/40 p-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Введіть ваше запитання..."
                  className="border-cyan-500/30 bg-black/50 font-mono text-sm focus-visible:ring-cyan-500/50"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-stone-500">
            <MessageSquare className="mb-4 h-12 w-12 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-widest">
              Оберіть підозрюваного для допиту
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
