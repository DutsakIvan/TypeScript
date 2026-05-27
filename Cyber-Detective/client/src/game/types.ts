export type Difficulty = "easy" | "medium" | "hard" | "extreme";
export type EvidenceCategory =
  | "log"
  | "message"
  | "file"
  | "report"
  | "audio"
  | "image"
  | "transaction"
  | "encrypted"
  | "network"
  | "steganography";
export type EvidenceStatus = "open" | "locked" | "encrypted";
export type AccessLevel = "admin" | "editor" | "limited" | "none" | "guest";

export type CipherType =
  | "caesar"
  | "vigenere"
  | "base64"
  | "hex"
  | "binary"
  | "atbash"
  | "xor"
  | "morse"
  | "substitution";

export interface CipherPuzzle {
  id: string;
  type: CipherType;
  cipherText: string;
  plainText: string;
  key: string | number;
  hint: string;
  difficulty: Difficulty;
  relatedEvidenceId: string;
  solved: boolean;
}

export type ForensicToolType =
  | "decryptor"
  | "packet_analyzer"
  | "stego_scanner"
  | "metadata_viewer"
  | "hash_cracker"
  | "frequency_analyzer";

export interface ForensicTool {
  id: string;
  name: string;
  type: ForensicToolType;
  description: string;
  icon: string;
  level: number;
  cpuCost: number;
  unlocked: boolean;
}

export interface NetworkPacket {
  id: string;
  timestamp: string;
  srcIP: string;
  dstIP: string;
  srcPort: number;
  dstPort: number;
  protocol: "TCP" | "UDP" | "HTTP" | "HTTPS" | "SSH" | "FTP" | "DNS" | "SMTP";
  size: number;
  flags?: string;
  payload?: string;
  suspicious: boolean;
  description?: string;
}

export interface NetworkLogChallenge {
  id: string;
  packets: NetworkPacket[];
  anomalyPacketIds: string[];
  filterHint: string;
  relatedEvidenceId: string;
  solved: boolean;
  unlockCode?: string;
}

export interface SteganographyChallenge {
  id: string;
  imageUrl: string;
  hiddenData: string;
  extractionMethod:
    | "metadata"
    | "lsb"
    | "exif_gps"
    | "header_injection"
    | "color_channel";
  hint: string;
  relatedEvidenceId: string;
  solved: boolean;
}

export interface WorkstationUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "cpu" | "ram" | "security" | "forensic" | "network";
  level: number;
  maxLevel: number;
  cost: number;
  effect: string;
  purchased: boolean;
}

export interface EconomyState {
  credits: number;
  cpuCycles: number;
  maxCpuCycles: number;
  ramSlots: number;
  securityLevel: number;
  upgrades: WorkstationUpgrade[];
}

export type EventType =
  | "counter_hack"
  | "data_corruption"
  | "bonus_intel"
  | "time_pressure"
  | "informant_tip"
  | "system_alert";

export interface DynamicEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timeLimit?: number;
  requiredAction: string;
  reward?: number;
  penalty?: number;
  resolved: boolean;
}

export interface GraphNode {
  id: string;
  type: "suspect" | "evidence" | "location" | "event" | "note";
  label: string;
  x: number;
  y: number;
  color?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  variant?: "case" | "sticky" | "photo" | "hypothesis" | "pin";
  width?: number;
  height?: number;
  source?: "case" | "custom";
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type: "connection" | "suspicion" | "alibi" | "contradiction" | "custom";
  color?: string;
}

export interface InvestigationBoard {
  nodes: GraphNode[];
  edges: GraphEdge[];
  notes: { id: string; text: string; x: number; y: number }[];
}

export interface Suspect {
  id: string;
  name: string;
  nickname: string;
  role: string;
  avatar: string;
  motive: string;
  alibi: string;
  accessLevel: AccessLevel;
  lastActivity: string;
  suspicionLevel: number;
  bio: string;
  relatedEvidenceIds: string[];
}

export interface Evidence {
  id: string;
  title: string;
  category: EvidenceCategory;
  status: EvidenceStatus;
  shortDescription: string;
  fullContent: string;
  isKeyEvidence: boolean;
  pointsToSuspectId?: string;
  unlockCommand?: string;
  unlockHint?: string;
  redHerring?: boolean;

  cipherPuzzleId?: string;
  networkChallengeId?: string;
  stegoChallengeId?: string;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  timestamp: string;
  content: string;
  relatedEvidenceId?: string;
  suspicious?: boolean;
}

export interface TerminalCommand {
  command: string;
  description: string;
  type:
    | "info"
    | "unlock_evidence"
    | "status"
    | "clear"
    | "puzzle"
    | "decrypt"
    | "scan"
    | "trace"
    | "analyze";
  response: string;
  unlockEvidenceId?: string;
  requiresArgument?: boolean;
  expectedArgument?: string;
  argumentHint?: string;
  cpuCost?: number;
}

export interface Hint {
  id: string;
  text: string;
  cost: number;
}

export interface InvestigationCase {
  id: string;
  title: string;
  subtitle: string;
  codename: string;
  difficulty: Difficulty;
  description: string;
  briefing: string;
  correctSuspectId: string;
  suspects: Suspect[];
  evidence: Evidence[];
  messages: Message[];
  terminalCommands: TerminalCommand[];
  hints: Hint[];
  basePoints: number;
  unlockRequirement?: string;

  cipherPuzzles?: CipherPuzzle[];
  networkChallenges?: NetworkLogChallenge[];
  stegoChallenges?: SteganographyChallenge[];
  dynamicEvents?: DynamicEvent[];
  isGenerated?: boolean;
}

export interface CaseProgress {
  caseId: string;
  caseStarted: boolean;
  caseSolved: boolean;
  unlockedEvidenceIds: string[];
  reviewedEvidenceIds: string[];
  hintsUsed: string[];
  attempts: number;
  startTime: number;
  endTime?: number;
  points: number;

  solvedCipherIds: string[];
  solvedNetworkIds: string[];
  solvedStegoIds: string[];
  resolvedEventIds: string[];
  cpuUsed: number;
}

export interface DetectiveProfile {
  rank: string;
  totalPoints: number;
  casesSolved: string[];
  caseProgress: Record<string, CaseProgress>;
  currentCaseId: string | null;
  unlockedAchievements: string[];

  economy: EconomyState;
  totalCasesGenerated: number;
  streak: number;
  hasCompletedTutorial: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (profile: DetectiveProfile) => boolean;
}

export type Section =
  | "briefing"
  | "suspects"
  | "evidence"
  | "messages"
  | "terminal"
  | "tools"
  | "graph"
  | "accusation"
  | "report";
