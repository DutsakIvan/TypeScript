import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type {
  GraphNode,
  GraphEdge,
  InvestigationBoard,
  Suspect,
  Evidence,
} from "../../game/types";

interface EvidenceGraphProps {
  suspects: Suspect[];
  evidence: Evidence[];
  unlockedEvidenceIds: string[];
  board: InvestigationBoard;
  onBoardUpdate: (board: InvestigationBoard) => void;
}

type BoardMode =
  | "move"
  | "connect"
  | "card"
  | "sticky"
  | "photo"
  | "hypothesis";
type BoardFilter =
  | "all"
  | "case"
  | "custom"
  | "suspects"
  | "evidence"
  | "notes";

type RelationStyle = {
  label: string;
  color: string;
  dash?: string;
};

const relationStyles: Record<GraphEdge["type"], RelationStyle> = {
  connection: { label: "зв’язок", color: "#c084fc" },
  suspicion: { label: "підозра", color: "#ef4444", dash: "7 5" },
  alibi: { label: "підтверджено", color: "#22c55e" },
  contradiction: { label: "суперечність", color: "#f59e0b", dash: "3 5" },
  custom: { label: "гіпотеза", color: "#38bdf8" },
};

const creationModes: BoardMode[] = ["card", "sticky", "photo", "hypothesis"];

function isCreationMode(mode: BoardMode): boolean {
  return creationModes.includes(mode);
}

function truncateLabel(label: string, length = 24) {
  return label.length > length ? `${label.slice(0, length - 1)}…` : label;
}

function nodeIcon(node: GraphNode) {
  if (node.variant === "photo") return "▣";
  if (node.variant === "sticky") return "✎";
  if (node.variant === "hypothesis") return "?";
  if (node.type === "suspect") return "S";
  if (node.type === "evidence") return "E";
  if (node.type === "location") return "L";
  if (node.type === "event") return "!";
  return "N";
}

function nodeKindLabel(node: GraphNode) {
  if (node.source === "custom") {
    if (node.variant === "photo") return "фото / скрин";
    if (node.variant === "sticky") return "власна нотатка";
    if (node.variant === "hypothesis") return "гіпотеза";
    return "власна картка";
  }
  if (node.type === "suspect") return "підозрюваний";
  if (node.type === "evidence") return "доказ справи";
  return "елемент справи";
}

function defaultColorForNode(node: GraphNode) {
  if (node.color) return node.color;
  if (node.variant === "sticky") return "#f59e0b";
  if (node.variant === "photo") return "#e5e7eb";
  if (node.variant === "hypothesis") return "#38bdf8";
  if (node.source === "custom") return "#c084fc";
  if (node.type === "suspect") return "#ef4444";
  if (node.type === "evidence") return "#3b82f6";
  return "#94a3b8";
}

function buildCaseNodeId(kind: "suspect" | "evidence", id: string) {
  return `${kind}:${id}`;
}

export function EvidenceGraph({
  suspects,
  evidence,
  unlockedEvidenceIds,
  board,
  onBoardUpdate,
}: EvidenceGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [mode, setMode] = useState<BoardMode>("move");
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeType, setEdgeType] = useState<GraphEdge["type"]>("connection");
  const [draftTitle, setDraftTitle] = useState("Нова зачіпка");
  const [draftBody, setDraftBody] = useState("");
  const [draftImage, setDraftImage] = useState("");
  const [showInspector, setShowInspector] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 550 });
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
        }
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCanvasSize({ width: rect.width, height: rect.height });
    }
    return () => ro.disconnect();
  }, []);

  const nodes = board.nodes ?? [];
  const edges = board.edges ?? [];
  const notes = board.notes ?? [];

  const selected = useMemo(
    () => nodes.find(node => node.id === selectedNode) ?? null,
    [nodes, selectedNode]
  );

  const caseNodeIds = useMemo(() => {
    return new Set([
      ...suspects.map(s => buildCaseNodeId("suspect", s.id)),
      ...evidence.map(e => buildCaseNodeId("evidence", e.id)),
      ...suspects.map(s => s.id),
      ...evidence.map(e => e.id),
    ]);
  }, [suspects, evidence]);

  const customNodeCount = nodes.filter(node => node.source === "custom").length;
  const caseNodeCount = nodes.length - customNodeCount;

  useEffect(() => {
    const existingNodeIds = new Set(nodes.map(n => n.id));
    const additions: GraphNode[] = [];
    const visibleEvidence = evidence.filter(
      e => unlockedEvidenceIds.includes(e.id) || e.status === "open"
    );

    const centerX = canvasSize.width * 0.48;
    const centerY = canvasSize.height * 0.48;
    const suspectRadius = Math.min(
      canvasSize.width * 0.25,
      canvasSize.height * 0.35
    );
    const suspectRadiusY = Math.min(
      canvasSize.height * 0.35,
      suspectRadius * 0.7
    );
    const evidenceRadius = Math.min(
      canvasSize.width * 0.38,
      canvasSize.height * 0.42
    );
    const evidenceRadiusY = Math.min(
      canvasSize.height * 0.42,
      evidenceRadius * 0.65
    );

    suspects.forEach((suspect, index) => {
      const nodeId = buildCaseNodeId("suspect", suspect.id);
      if (existingNodeIds.has(nodeId) || existingNodeIds.has(suspect.id))
        return;
      const angle = (index / Math.max(suspects.length, 1)) * Math.PI * 2 - 0.4;
      additions.push({
        id: nodeId,
        type: "suspect",
        label: suspect.nickname,
        subtitle: suspect.role,
        content: `${suspect.motive}\n\nАлібі: ${suspect.alibi}`,
        x: centerX + Math.cos(angle) * suspectRadius,
        y: centerY + Math.sin(angle) * suspectRadiusY,
        color: "#ef4444",
        variant: "case",
        source: "case",
      });
    });

    visibleEvidence.forEach((item, index) => {
      const nodeId = buildCaseNodeId("evidence", item.id);
      if (existingNodeIds.has(nodeId) || existingNodeIds.has(item.id)) return;
      const angle =
        (index / Math.max(visibleEvidence.length, 1)) * Math.PI * 2 + 0.35;
      additions.push({
        id: nodeId,
        type: "evidence",
        label: item.title,
        subtitle: item.category,
        content: item.shortDescription,
        x: centerX + Math.cos(angle) * evidenceRadius,
        y: centerY + Math.sin(angle) * evidenceRadiusY,
        color: item.isKeyEvidence ? "#f59e0b" : "#3b82f6",
        variant: "case",
        source: "case",
      });
    });

    if (additions.length > 0) {
      onBoardUpdate({
        ...board,
        nodes: [...nodes, ...additions],
        edges,
        notes,
      });
    }
  }, [
    suspects,
    evidence,
    unlockedEvidenceIds,
    nodes,
    edges,
    notes,
    board,
    onBoardUpdate,
    canvasSize,
  ]);

  useEffect(() => {
    if (notes.length === 0) return;
    const migratedNotes: GraphNode[] = notes.map(note => ({
      id: `custom:${note.id}`,
      type: "note",
      label: truncateLabel(note.text, 28),
      content: note.text,
      x: note.x,
      y: note.y,
      color: "#f59e0b",
      variant: "sticky",
      source: "custom",
    }));
    const existingIds = new Set(nodes.map(n => n.id));
    const newNodes = migratedNotes.filter(n => !existingIds.has(n.id));
    onBoardUpdate({
      ...board,
      nodes: [...nodes, ...newNodes],
      edges,
      notes: [],
    });
  }, [notes, nodes, edges, board, onBoardUpdate]);

  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filter === "case") return node.source !== "custom";
      if (filter === "custom") return node.source === "custom";
      if (filter === "suspects") return node.type === "suspect";
      if (filter === "evidence") return node.type === "evidence";
      if (filter === "notes")
        return (
          node.type === "note" ||
          node.variant === "sticky" ||
          node.variant === "hypothesis"
        );
      return true;
    });
  }, [nodes, filter]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map(n => n.id)),
    [visibleNodes]
  );

  function localPoint(e: MouseEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 320, y: 220 };
    return {
      x: Math.max(32, Math.min(e.clientX - rect.left, rect.width - 32)),
      y: Math.max(32, Math.min(e.clientY - rect.top, rect.height - 32)),
    };
  }

  function updateBoard(next: Partial<InvestigationBoard>) {
    onBoardUpdate({
      ...board,
      nodes,
      edges,
      notes,
      ...next,
    });
  }

  function resetDraft(nextMode: BoardMode = mode) {
    if (nextMode === "photo") {
      setDraftTitle("Фото або скриншот");
      setDraftBody("Що на ньому важливого?");
    } else if (nextMode === "sticky") {
      setDraftTitle("Швидка нотатка");
      setDraftBody("Моя думка / підказка / підозра");
    } else if (nextMode === "hypothesis") {
      setDraftTitle("Гіпотеза");
      setDraftBody("Як це може бути пов’язано?");
    } else {
      setDraftTitle("Нова зачіпка");
      setDraftBody("");
    }
  }

  function selectMode(nextMode: BoardMode) {
    setMode(nextMode);
    setConnecting(null);
    setSelectedEdge(null);
    if (isCreationMode(nextMode)) resetDraft(nextMode);
  }

  function addCustomNode(kind: BoardMode, point?: { x: number; y: number }) {
    if (!isCreationMode(kind)) return;
    const title =
      draftTitle.trim() ||
      (kind === "photo"
        ? "Фото / скрин"
        : kind === "hypothesis"
          ? "Гіпотеза"
          : "Нотатка");

    const colCount = Math.max(2, Math.floor(canvasSize.width / 200));
    const colWidth = canvasSize.width / (colCount + 1);
    const fallbackX = colWidth + (customNodeCount % colCount) * colWidth;
    const fallbackY =
      canvasSize.height * 0.2 +
      (customNodeCount % 3) * (canvasSize.height * 0.2);
    const variant: GraphNode["variant"] =
      kind === "photo"
        ? "photo"
        : kind === "sticky"
          ? "sticky"
          : kind === "hypothesis"
            ? "hypothesis"
            : "pin";
    const type: GraphNode["type"] =
      kind === "hypothesis" ? "event" : kind === "card" ? "location" : "note";
    const color =
      kind === "photo"
        ? "#e5e7eb"
        : kind === "sticky"
          ? "#f59e0b"
          : kind === "hypothesis"
            ? "#38bdf8"
            : "#c084fc";
    const newNode: GraphNode = {
      id: `custom:${kind}:${Date.now()}`,
      type,
      label: title,
      subtitle:
        kind === "photo"
          ? "власне фото"
          : kind === "sticky"
            ? "sticky note"
            : kind === "hypothesis"
              ? "гіпотеза"
              : "custom clue",
      content: draftBody.trim(),
      imageUrl:
        kind === "photo"
          ? draftImage.trim() || "/redesign/investigation-board-ui-concept.png"
          : undefined,
      x: point?.x ?? fallbackX,
      y: point?.y ?? fallbackY,
      color,
      variant,
      source: "custom",
    };
    updateBoard({ nodes: [...nodes, newNode] });
    setSelectedNode(newNode.id);
    setMode("move");
    resetDraft("card");
    setDraftImage("");
  }

  const handleNodeMouseDown = useCallback(
    (e: MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setSelectedNode(nodeId);
      setSelectedEdge(null);

      if (mode === "connect") {
        if (connecting && connecting !== nodeId) {
          const style = relationStyles[edgeType];
          const newEdge: GraphEdge = {
            id: `edge:${Date.now()}`,
            from: connecting,
            to: nodeId,
            label: edgeLabel.trim() || style.label,
            type: edgeType,
            color: style.color,
          };
          updateBoard({ edges: [...edges, newEdge] });
          setConnecting(null);
          setEdgeLabel("");
        } else {
          setConnecting(nodeId);
        }
        return;
      }

      if (mode === "move") {
        const node = nodes.find(n => n.id === nodeId);
        const point = localPoint(e);
        if (node) {
          setDragging(nodeId);
          setDragOffset({ x: point.x - node.x, y: point.y - node.y });
        }
      }
    },
    [mode, connecting, edgeType, edgeLabel, edges, nodes, updateBoard]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      const point = localPoint(e);
      updateBoard({
        nodes: nodes.map(node =>
          node.id === dragging
            ? { ...node, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
            : node
        ),
      });
    },
    [dragging, dragOffset, nodes, updateBoard]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  function handleCanvasClick(e: MouseEvent) {
    if (isCreationMode(mode)) {
      addCustomNode(mode, localPoint(e));
      return;
    }
    setSelectedEdge(null);
  }

  function updateNode(nodeId: string, patch: Partial<GraphNode>) {
    updateBoard({
      nodes: nodes.map(node =>
        node.id === nodeId ? { ...node, ...patch } : node
      ),
    });
  }

  function deleteSelectedNode() {
    if (!selected || selected.source !== "custom") return;
    updateBoard({
      nodes: nodes.filter(node => node.id !== selected.id),
      edges: edges.filter(
        edge => edge.from !== selected.id && edge.to !== selected.id
      ),
    });
    setSelectedNode(null);
  }

  function deleteSelectedEdge() {
    if (!selectedEdge) return;
    updateBoard({ edges: edges.filter(edge => edge.id !== selectedEdge) });
    setSelectedEdge(null);
  }

  function clearCustomNodes() {
    const customIds = new Set(
      nodes.filter(node => node.source === "custom").map(node => node.id)
    );
    updateBoard({
      nodes: nodes.filter(node => !customIds.has(node.id)),
      edges: edges.filter(
        edge => !customIds.has(edge.from) && !customIds.has(edge.to)
      ),
      notes: [],
    });
    setSelectedNode(null);
    setSelectedEdge(null);
  }

  function autoArrange() {
    const custom = nodes.filter(node => node.source === "custom");
    const caseNodes = nodes.filter(node => node.source !== "custom");

    const centerX = canvasSize.width * 0.48;
    const centerY = canvasSize.height * 0.48;
    const radiusX = Math.max(canvasSize.width * 0.35, caseNodes.length * 35);
    const radiusY = Math.max(canvasSize.height * 0.38, caseNodes.length * 25);
    const arrangedCase = caseNodes.map((node, index) => {
      const angle = (index / Math.max(caseNodes.length, 1)) * Math.PI * 2;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY,
      };
    });
    const colCount = Math.max(2, Math.floor(canvasSize.width / 200));
    const colWidth = canvasSize.width / (colCount + 1);
    const arrangedCustom = custom.map((node, index) => ({
      ...node,
      x: colWidth + (index % colCount) * colWidth,
      y: 100 + Math.floor(index / colCount) * 130,
    }));
    updateBoard({ nodes: [...arrangedCase, ...arrangedCustom] });
  }

  function fitToView() {
    if (nodes.length === 0) return;
    const padding = 80;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x);
      maxY = Math.max(maxY, n.y);
    }
    const contentW = maxX - minX || 1;
    const contentH = maxY - minY || 1;
    const targetW = canvasSize.width - padding * 2;
    const targetH = canvasSize.height - padding * 2;
    const scale = Math.min(targetW / contentW, targetH / contentH, 1);
    const newCenterX = canvasSize.width / 2;
    const newCenterY = canvasSize.height / 2;
    const oldCenterX = (minX + maxX) / 2;
    const oldCenterY = (minY + maxY) / 2;
    const rescaled = nodes.map(n => ({
      ...n,
      x: newCenterX + (n.x - oldCenterX) * scale,
      y: newCenterY + (n.y - oldCenterY) * scale,
    }));
    updateBoard({ nodes: rescaled });
  }

  function renderNodeCard(node: GraphNode) {
    const color = defaultColorForNode(node);
    const isSelected = selectedNode === node.id;
    const isCustom = node.source === "custom";
    const commonStyle = {
      borderColor: `${color}99`,
      boxShadow: isSelected
        ? `0 0 28px ${color}66, 0 10px 35px rgba(0,0,0,.6)`
        : `0 10px 28px rgba(0,0,0,.55)`,
      width: node.width,
      height: node.height,
      resize: "both" as const,
      overflow: "hidden",
    };

    if (node.variant === "photo") {
      return (
        <div
          className={`w-36 flex flex-col rounded-sm border bg-stone-100 p-2 text-stone-950 shadow-2xl ${isSelected ? "scale-105" : ""}`}
          style={commonStyle}
        >
          <div className="aspect-[4/3] overflow-hidden bg-stone-900 border border-stone-300">
            <img
              src={
                node.imageUrl || "/redesign/investigation-board-ui-concept.png"
              }
              alt={node.label}
              className="h-full w-full object-cover grayscale-[.25] contrast-125 pointer-events-none"
              draggable={false}
            />
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-wide truncate">
            {node.label}
          </div>
          {node.content && (
            <div className="mt-1 text-[9px] leading-tight text-stone-700 overflow-y-auto flex-1">
              {node.content}
            </div>
          )}
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-red-700 shadow-[0_0_12px_rgba(185,28,28,.8)]" />
        </div>
      );
    }

    if (node.variant === "sticky") {
      return (
        <div
          className={`w-36 min-h-28 flex flex-col border border-amber-500/30 bg-amber-950/60 p-3 text-amber-50 shadow-2xl backdrop-blur-sm rotate-[-2deg] ${isSelected ? "scale-105" : ""}`}
          style={commonStyle}
        >
          <div className="absolute -top-2 right-5 h-4 w-8 rotate-6 bg-amber-400/20 shadow-[0_0_8px_rgba(245,158,11,0.2)] border border-amber-500/20" />
          <div className="font-handwritten font-bold text-xs uppercase tracking-wider text-amber-400 truncate shrink-0">
            {node.label}
          </div>
          <div className="mt-2 whitespace-pre-wrap text-[11px] leading-snug text-amber-100/80 overflow-y-auto flex-1 custom-scrollbar">
            {node.content || "Клікни в інспекторі, щоб записати власну думку."}
          </div>
        </div>
      );
    }

    if (node.variant === "hypothesis") {
      return (
        <div
          className={`w-40 flex flex-col rounded-xl border bg-cyan-950/75 p-3 text-cyan-50 backdrop-blur-md ${isSelected ? "scale-105" : ""}`}
          style={commonStyle}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-400/15 font-mono text-sm">
              ?
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[11px] font-bold uppercase tracking-wider">
                {node.label}
              </div>
              <div className="text-[9px] uppercase tracking-[.2em] text-cyan-300/70">
                working theory
              </div>
            </div>
          </div>
          <div className="text-[10px] leading-relaxed text-cyan-100/80 overflow-y-auto flex-1 custom-scrollbar">
            {node.content || "Ще не описано."}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-32 flex flex-col rounded-lg border bg-black/70 p-2.5 text-slate-100 backdrop-blur-md ${isSelected ? "scale-105" : ""}`}
        style={commonStyle}
      >
        <div className="absolute -top-2 left-3 h-4 w-4 rounded-full border border-white/20 bg-red-600 shadow-[0_0_12px_rgba(239,68,68,.7)]" />
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold"
            style={{ borderColor: color, backgroundColor: `${color}24`, color }}
          >
            {nodeIcon(node)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-mono text-[10px] font-bold uppercase tracking-wide">
              {truncateLabel(node.label, 22)}
            </div>
            <div className="truncate text-[9px] uppercase tracking-[.16em] text-slate-400">
              {nodeKindLabel(node)}
            </div>
          </div>
        </div>
        {node.content && (
          <div className="mt-2 text-[10px] leading-snug text-slate-300/85 overflow-y-auto flex-1 custom-scrollbar">
            {node.content}
          </div>
        )}
        {isCustom && (
          <div className="mt-2 border-t border-white/10 pt-1 text-[9px] uppercase tracking-widest text-purple-300/70 shrink-0">
            custom
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-black transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[100] rounded-none" : "relative h-full min-h-[400px] md:min-h-[620px] rounded-2xl border border-red-500/30 shadow-2xl shadow-red-950/30 overflow-hidden"}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: "url('/board-bg.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(120,50,28,0.18),rgba(7,0,0,0.88)_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.15)_34%,rgba(0,0,0,.76))]" />
      <div className="absolute inset-0 pointer-events-none scanlines opacity-20 mix-blend-overlay" />

      <div className="relative z-20 flex flex-wrap items-center gap-3 border-b border-red-500/25 bg-black/55 px-4 py-3 backdrop-blur-md">
        <img
          src="/tools/evidence-board.png"
          alt="Investigation Board"
          className="h-9 w-9 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-1 shadow-[0_0_18px_rgba(34,211,238,.25)]"
        />
        <div>
          <h3 className="font-mono text-sm font-black uppercase tracking-[.18em] text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,.8)]">
            INVESTIGATION BOARD
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[.22em] text-red-300/70">
            personal corkboard workspace
          </p>
        </div>

        <div className="hidden items-center gap-4 rounded border border-red-500/25 bg-red-950/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider md:flex">
          <span className="text-red-200">
            Case: <b>{caseNodeCount}</b>
          </span>
          <span className="text-purple-200">
            Custom: <b>{customNodeCount}</b>
          </span>
          <span className="text-cyan-200">
            Links: <b>{edges.length}</b>
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2 rounded border border-white/10 bg-black/35 px-1 py-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
              className="px-2 text-slate-400 hover:text-white"
              title="Зменшити"
            >
              -
            </button>
            <span
              className="w-9 text-center font-mono text-[10px] text-cyan-200"
              onClick={() => setZoom(1)}
              role="button"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="px-2 text-slate-400 hover:text-white"
              title="Збільшити"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="mr-2 rounded border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-200 hover:bg-purple-500/20"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          {(
            [
              ["move", "Move"],
              ["connect", "Connect"],
              ["sticky", "Sticky"],
              ["card", "Card"],
              ["photo", "Photo"],
              ["hypothesis", "Theory"],
            ] as Array<[BoardMode, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => selectMode(key)}
              className={`rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
                mode === key
                  ? "border-cyan-300/80 bg-cyan-400/15 text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,.28)]"
                  : "border-white/10 bg-black/35 text-slate-400 hover:border-red-400/40 hover:text-red-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "connect" && (
        <div className="relative z-20 flex flex-wrap items-center gap-2 border-b border-red-500/15 bg-black/45 px-4 py-2 font-mono text-xs backdrop-blur">
          <span className="text-cyan-200">
            {connecting
              ? "Обери другу картку, щоб протягнути нитку."
              : "Обери першу картку для зв’язку."}
          </span>
          <select
            value={edgeType}
            onChange={e => setEdgeType(e.target.value as GraphEdge["type"])}
            className="rounded border border-red-500/25 bg-black/70 px-2 py-1 text-red-100 outline-none"
          >
            {Object.entries(relationStyles).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <input
            value={edgeLabel}
            onChange={e => setEdgeLabel(e.target.value)}
            placeholder="Підпис нитки / зв’язку"
            className="min-w-52 flex-1 rounded border border-red-500/25 bg-black/70 px-2 py-1 text-red-100 outline-none placeholder:text-red-200/35"
          />
          {connecting && (
            <button
              onClick={() => setConnecting(null)}
              className="rounded border border-white/10 px-2 py-1 text-slate-300 hover:text-white"
            >
              Скасувати
            </button>
          )}
        </div>
      )}

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <aside className="hidden w-40 shrink-0 border-r border-red-500/15 bg-black/45 p-3 backdrop-blur-sm lg:block">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[.25em] text-red-300/70">
            Filters
          </div>
          {(
            [
              ["all", "All"],
              ["case", "Case"],
              ["custom", "Custom"],
              ["suspects", "Suspects"],
              ["evidence", "Evidence"],
              ["notes", "Notes"],
            ] as Array<[BoardFilter, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`mb-2 w-full rounded border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition ${
                filter === key
                  ? "border-cyan-400/60 bg-cyan-500/12 text-cyan-100"
                  : "border-white/10 bg-black/35 text-slate-500 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
            <button
              onClick={fitToView}
              className="w-full rounded border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan-100 hover:bg-cyan-500/20"
            >
              Fit to view
            </button>
            <button
              onClick={autoArrange}
              className="w-full rounded border border-amber-400/30 bg-amber-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-100 hover:bg-amber-500/20"
            >
              Auto layout
            </button>
            <button
              onClick={clearCustomNodes}
              className="w-full rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-red-100 hover:bg-red-500/20"
            >
              Clear custom
            </button>
          </div>
        </aside>

        <div
          ref={canvasRef}
          className={`relative flex-1 overflow-auto select-none ${mode === "move" ? "cursor-grab" : isCreationMode(mode) ? "cursor-copy" : "cursor-crosshair"}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        >
          <div className="absolute left-8 top-6 rounded border border-amber-500/25 bg-black/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[.2em] text-amber-100/70 backdrop-blur">
            {isCreationMode(mode)
              ? "Клікни по дошці, щоб прикріпити новий елемент"
              : mode === "connect"
                ? "З’єднуй елементи нитками"
                : "Перетягуй картки по дошці"}
          </div>

          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
          >
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <filter id="threadGlow">
                  <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {edges.map(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (
                  !fromNode ||
                  !toNode ||
                  !visibleNodeIds.has(fromNode.id) ||
                  !visibleNodeIds.has(toNode.id)
                )
                  return null;
                const style =
                  relationStyles[edge.type] ?? relationStyles.connection;
                const color = edge.color || style.color;
                return (
                  <g
                    key={edge.id}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedEdge(edge.id);
                      setSelectedNode(null);
                    }}
                    className="cursor-pointer"
                  >
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="rgba(0,0,0,.7)"
                      strokeWidth="7"
                    />
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={color}
                      strokeWidth={selectedEdge === edge.id ? 3.2 : 2.1}
                      strokeDasharray={style.dash}
                      opacity="0.92"
                      filter="url(#threadGlow)"
                    />
                    <circle
                      cx={fromNode.x}
                      cy={fromNode.y}
                      r="4"
                      fill={color}
                    />
                    <circle cx={toNode.x} cy={toNode.y} r="4" fill={color} />
                    {edge.label && (
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 - 8}
                        fill={color}
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="monospace"
                        paintOrder="stroke"
                        stroke="rgba(0,0,0,.9)"
                        strokeWidth="4"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {connecting &&
                (() => {
                  const node = nodes.find(n => n.id === connecting);
                  if (!node) return null;
                  return (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="38"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      className="animate-pulse"
                    />
                  );
                })()}
            </svg>

            {visibleNodes.map(node => (
              <div
                key={node.id}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${selectedNode === node.id ? "z-30" : "hover:z-20"}`}
                style={{ left: node.x, top: node.y }}
                onMouseDown={e => handleNodeMouseDown(e, node.id)}
                onMouseUp={e => {
                  handleMouseUp();
                  const card = e.currentTarget.firstElementChild as HTMLElement;
                  if (card && card.style.width) {
                    const w = parseInt(card.style.width, 10);
                    const h = parseInt(card.style.height, 10);
                    if (
                      !isNaN(w) &&
                      !isNaN(h) &&
                      (node.width !== w || node.height !== h)
                    ) {
                      updateNode(node.id, { width: w, height: h });
                    }
                  }
                }}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedNode(node.id);
                  setSelectedEdge(null);
                  setShowInspector(true);
                }}
              >
                {renderNodeCard(node)}
              </div>
            ))}
          </div>
        </div>

        {showInspector && (
          <aside className="w-72 shrink-0 border-l border-red-500/15 bg-black/62 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[.25em] text-red-300/70">
                  Inspector
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  Робочі інструменти
                </div>
              </div>
              <button
                onClick={() => setShowInspector(false)}
                className="rounded border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                hide
              </button>
            </div>

            {isCreationMode(mode) && (
              <div className="mb-4 rounded-xl border border-cyan-400/25 bg-cyan-950/20 p-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-cyan-100">
                  Додати на дошку
                </div>
                <input
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  className="mb-2 w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                  placeholder="Назва"
                />
                <textarea
                  value={draftBody}
                  onChange={e => setDraftBody(e.target.value)}
                  className="mb-2 h-20 w-full resize-none rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                  placeholder="Опис / думка / деталь"
                />
                {mode === "photo" && (
                  <div className="mb-2">
                    <input
                      value={draftImage}
                      onChange={e => setDraftImage(e.target.value)}
                      className="mb-2 w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                      placeholder="URL фото або залиш порожнім"
                    />
                    <div className="mb-1 text-[9px] uppercase tracking-wider text-cyan-300/50">
                      Або вибери швидке фото:
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {suspects.map(s => (
                        <img
                          key={s.id}
                          src={s.avatar}
                          alt={s.name}
                          onClick={() => setDraftImage(s.avatar)}
                          className={`h-8 w-8 cursor-pointer rounded object-cover border ${draftImage === s.avatar ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "border-transparent opacity-60 hover:opacity-100"}`}
                          title={s.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => addCustomNode(mode)}
                  className="w-full rounded border border-cyan-300/40 bg-cyan-400/15 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan-50 hover:bg-cyan-400/25"
                >
                  Додати по центру
                </button>
                <p className="mt-2 text-[10px] leading-relaxed text-cyan-100/55">
                  Або просто клікни в потрібне місце на дошці — елемент
                  з’явиться саме там.
                </p>
              </div>
            )}

            {selected && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Обрано: {nodeKindLabel(selected)}
                </div>
                <input
                  value={selected.label}
                  onChange={e =>
                    updateNode(selected.id, { label: e.target.value })
                  }
                  className="w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                />
                <input
                  value={selected.subtitle ?? ""}
                  onChange={e =>
                    updateNode(selected.id, { subtitle: e.target.value })
                  }
                  className="w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                  placeholder="Підпис"
                />
                <textarea
                  value={selected.content ?? ""}
                  onChange={e =>
                    updateNode(selected.id, { content: e.target.value })
                  }
                  className="h-28 w-full resize-none rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                  placeholder="Опис"
                />
                {selected.variant === "photo" && (
                  <div className="mb-2">
                    <input
                      value={selected.imageUrl ?? ""}
                      onChange={e =>
                        updateNode(selected.id, { imageUrl: e.target.value })
                      }
                      className="mb-2 w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100 outline-none"
                      placeholder="URL зображення"
                    />
                    <div className="mb-1 text-[9px] uppercase tracking-wider text-cyan-300/50">
                      Швидке фото:
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {suspects.map(s => (
                        <img
                          key={s.id}
                          src={s.avatar}
                          alt={s.name}
                          onClick={() =>
                            updateNode(selected.id, { imageUrl: s.avatar })
                          }
                          className={`h-8 w-8 cursor-pointer rounded object-cover border ${selected.imageUrl === s.avatar ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "border-transparent opacity-60 hover:opacity-100"}`}
                          title={s.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selected.source === "custom" ? (
                  <button
                    onClick={deleteSelectedNode}
                    className="w-full rounded border border-red-500/35 bg-red-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-red-100 hover:bg-red-500/20"
                  >
                    Видалити елемент
                  </button>
                ) : (
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Це автоматичний елемент справи. Ви можете редагувати його
                    текст для власних нотаток, але видалити не можна.
                  </p>
                )}
              </div>
            )}

            {selectedEdge && (
              <div className="space-y-3 rounded-xl border border-purple-400/20 bg-purple-950/15 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-purple-100">
                  Обрана нитка
                </div>
                <button
                  onClick={deleteSelectedEdge}
                  className="w-full rounded border border-red-500/35 bg-red-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-red-100 hover:bg-red-500/20"
                >
                  Видалити зв’язок
                </button>
              </div>
            )}

            {!selected && !selectedEdge && !isCreationMode(mode) && (
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs leading-relaxed text-slate-400">
                Обери картку, щоб побачити деталі. У режимі{" "}
                <b className="text-cyan-200">Connect</b> клікай по двох
                елементах, щоб з’єднати їх ниткою.
              </div>
            )}
          </aside>
        )}
      </div>

      {!showInspector && (
        <button
          onClick={() => setShowInspector(true)}
          className="absolute bottom-4 right-4 z-30 rounded border border-cyan-400/35 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan-100 backdrop-blur hover:bg-cyan-400/10"
        >
          Inspector
        </button>
      )}
    </div>
  );
}
