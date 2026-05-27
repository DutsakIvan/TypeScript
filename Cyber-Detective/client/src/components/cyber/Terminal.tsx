import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvestigationCase, TerminalCommand } from "@/game/types";

interface Line {
  type: "in" | "out" | "system" | "error" | "success" | "warn";
  text: string;
}

interface Props {
  caseData: InvestigationCase;
  unlockedEvidenceIds: string[];
  onUnlockEvidence: (evidenceId: string) => boolean;
  onTryDecrypt?: (
    code: string
  ) => { evidenceId?: string; message: string } | null;
}

export function Terminal({
  caseData,
  unlockedEvidenceIds,
  onUnlockEvidence,
  onTryDecrypt,
}: Props) {
  const [lines, setLines] = useState<Line[]>(() => [
    {
      type: "system",
      text: "╔════════════════════════════════════════════════════╗",
    },
    {
      type: "system",
      text: "║   CYBER UNIT — Forensic Terminal v2.1.0            ║",
    },
    {
      type: "system",
      text: "║   Secure Channel: ENCRYPTED [AES-256]              ║",
    },
    {
      type: "system",
      text: "╚════════════════════════════════════════════════════╝",
    },
    { type: "success", text: `✓ Case loaded: ${caseData.codename}` },
    { type: "system", text: `Type 'help' to see available commands.` },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const append = (newLines: Line | Line[]) => {
    setLines(prev =>
      prev.concat(Array.isArray(newLines) ? newLines : [newLines])
    );
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    append({ type: "in", text: `agent@cyber-unit:~$ ${trimmed}` });
    setHistory(h => [...h, trimmed]);
    setHistIdx(-1);

    const lower = trimmed.toLowerCase();
    const [cmdName, ...args] = lower.split(/\s+/);
    const arg = args.join(" ");

    const matched = matchCustomCommand(caseData.terminalCommands, trimmed);
    const isBuiltInOverride = [
      "help",
      "?",
      "clear",
      "cls",
      "status",
      "list-evidence",
      "ls",
    ].includes(cmdName);

    if (matched && !isBuiltInOverride) {
      handleCustomCommand(matched, trimmed, append, onUnlockEvidence);
      return;
    }

    if (cmdName === "help" || cmdName === "?") {
      const customCmds = caseData.terminalCommands.map(
        c => `  ${c.command.padEnd(28)} — ${c.description}`
      );
      append([
        { type: "out", text: "Available commands:" },
        {
          type: "out",
          text: "  help                         — show this help",
        },
        {
          type: "out",
          text: "  clear                        — clear terminal",
        },
        {
          type: "out",
          text: "  status                       — investigation status",
        },
        {
          type: "out",
          text: "  whoami                       — show agent identity",
        },
        {
          type: "out",
          text: "  ls /evidence                 — list all evidence files",
        },
        {
          type: "out",
          text: "  decrypt <code>               — try to decrypt a file",
        },
        ...(customCmds.length
          ? [
              { type: "system" as const, text: "— Case-specific commands —" },
              ...customCmds.map(t => ({ type: "out" as const, text: t })),
            ]
          : []),
      ]);
      return;
    }

    if (cmdName === "clear" || cmdName === "cls") {
      setLines([{ type: "system", text: "> terminal cleared" }]);
      return;
    }

    if (cmdName === "whoami") {
      append({
        type: "out",
        text: "agent_07 (Cyber Unit, Digital Forensics Division)",
      });
      return;
    }

    if (cmdName === "status") {
      append([
        { type: "out", text: `Case: ${caseData.title}` },
        { type: "out", text: `Codename: ${caseData.codename}` },
        {
          type: "out",
          text: `Difficulty: ${caseData.difficulty.toUpperCase()}`,
        },
        {
          type: "out",
          text: `Evidence unlocked: ${unlockedEvidenceIds.length}/${caseData.evidence.length}`,
        },
        { type: "out", text: `Suspects: ${caseData.suspects.length}` },
      ]);
      return;
    }

    if (
      cmdName === "list-evidence" ||
      trimmed.toLowerCase() === "ls /evidence" ||
      cmdName === "ls"
    ) {
      append([
        { type: "system", text: "— Evidence index —" },
        ...caseData.evidence.map(e => ({
          type: "out" as const,
          text: `  [${unlockedEvidenceIds.includes(e.id) ? "✓" : "✗"}] ${e.id.padEnd(28)} ${e.title}`,
        })),
      ]);
      return;
    }

    if (cmdName === "decrypt") {
      if (!arg) {
        append({ type: "error", text: "Usage: decrypt <code>" });
        return;
      }
      append({ type: "system", text: `> decrypting with key "${arg}"...` });

      if (onTryDecrypt) {
        const result = onTryDecrypt(arg);
        if (result) {
          if (result.evidenceId) {
            onUnlockEvidence(result.evidenceId);
          }
          append({ type: "success", text: `✓ ${result.message}` });
          return;
        }
      }
      append({ type: "error", text: "✗ Decryption failed: invalid key." });
      return;
    }

    append({
      type: "error",
      text: `command not found: ${cmdName}. Type 'help' for available commands.`,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next =
        histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(history.length, histIdx + 1);
      setHistIdx(next);
      setInput(next === history.length ? "" : history[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const allCmds = [
        "help",
        "clear",
        "status",
        "whoami",
        "list-evidence",
        "decrypt",
        ...caseData.terminalCommands.map(c => c.command.split(" ")[0]),
      ];
      const match = allCmds.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  return (
    <div
      className="rounded-md border border-cyan-500/25 bg-[#0a0e14]/95 backdrop-blur shadow-[0_0_60px_rgba(34,211,238,0.08)] flex flex-col h-[400px] md:h-[560px]"
      onClick={() => inputRef.current?.focus()}
    >
      {}
      <div className="flex items-center justify-between border-b border-cyan-500/20 bg-card/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            forensic-shell
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-[1.5] scanlines"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap break-words",
              l.type === "in" && "text-cyan-300",
              l.type === "out" && "text-foreground/85",
              l.type === "system" && "text-muted-foreground",
              l.type === "success" && "text-emerald-400",
              l.type === "error" && "text-rose-400",
              l.type === "warn" && "text-amber-400"
            )}
          >
            {l.text}
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center border-t border-cyan-500/20 bg-card/30 px-3 py-2 font-mono text-[12px]">
        <Power className="mr-2 h-3 w-3 text-emerald-400" />
        <span className="text-cyan-300 mr-1.5 select-none">
          agent@cyber-unit:~$
        </span>
        <input
          id="terminal-input"
          ref={inputRef}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/40"
          placeholder="type a command and press Enter..."
        />
        <span className="ml-1 inline-block w-1.5 h-3.5 bg-cyan-400 animate-[type-cursor_1s_infinite]" />
      </div>
    </div>
  );
}

function matchCustomCommand(
  cmds: TerminalCommand[],
  input: string
): TerminalCommand | null {
  const lower = input.toLowerCase();

  const sorted = [...cmds].sort((a, b) => b.command.length - a.command.length);
  for (const c of sorted) {
    const cmdLower = c.command.toLowerCase();
    if (lower === cmdLower || lower.startsWith(cmdLower + " ")) return c;

    const baseCmd = cmdLower.split(" ")[0];
    const baseInput = lower.split(" ")[0];
    if (baseCmd === baseInput && cmdLower.includes(" ")) return c;
  }
  return null;
}

function handleCustomCommand(
  cmd: TerminalCommand,
  rawInput: string,
  append: (l: Line | Line[]) => void,
  onUnlockEvidence: (id: string) => boolean
) {
  const cmdLower = cmd.command.toLowerCase();
  const inputLower = rawInput.toLowerCase();

  if (cmd.requiresArgument && cmd.expectedArgument) {
    const baseCmd = cmdLower.split(" ")[0];
    const argRaw = rawInput.slice(baseCmd.length).trim();
    if (!argRaw) {
      append({
        type: "error",
        text: `Usage: ${cmd.command}${cmd.argumentHint ? "   " + cmd.argumentHint : ""}`,
      });
      return;
    }
    const expected = cmd.expectedArgument.toLowerCase();
    if (argRaw.toLowerCase() !== expected) {
      append({ type: "error", text: `✗ Wrong argument. Try again.` });
      if (cmd.argumentHint)
        append({ type: "warn", text: `hint: ${cmd.argumentHint}` });
      return;
    }
  } else if (cmd.command.includes(" ") && cmdLower !== inputLower) {
    if (!inputLower.startsWith(cmdLower)) {
      append({ type: "error", text: `Usage: ${cmd.command}` });
      return;
    }
  }

  append({ type: "system", text: `> processing...` });
  if (cmd.response) {
    cmd.response.split("\n").forEach(line => {
      append({ type: "out", text: line });
    });
  }

  if (
    (cmd.type === "unlock_evidence" || cmd.type === "decrypt") &&
    cmd.unlockEvidenceId
  ) {
    onUnlockEvidence(cmd.unlockEvidenceId);
  }
}
