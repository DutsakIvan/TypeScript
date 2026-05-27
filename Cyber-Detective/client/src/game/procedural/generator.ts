import type {
  InvestigationCase,
  Suspect,
  Evidence,
  Message,
  TerminalCommand,
  Hint,
  CipherPuzzle,
  NetworkLogChallenge,
  NetworkPacket,
  SteganographyChallenge,
  DynamicEvent,
  Difficulty,
  CipherType,
} from "../types";
import { cipherEncrypt } from "./ciphers";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function generateId(prefix: string, rng: () => number): string {
  return `${prefix}_${Math.floor(rng() * 999999).toString(36)}`;
}

function generateIP(rng: () => number): string {
  return `${Math.floor(rng() * 200) + 10}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 254) + 1}`;
}

function generateTimestamp(baseHour: number, rng: () => number): string {
  const h = baseHour + Math.floor(rng() * 4);
  const m = Math.floor(rng() * 60);
  return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const CASE_TEMPLATES = [
  { type: "data_breach", title: "Витік даних", icon: "🔓" },
  { type: "ransomware", title: "Атака шифрувальника", icon: "🔐" },
  { type: "insider_theft", title: "Крадіжка інсайдером", icon: "🕵️" },
  { type: "crypto_fraud", title: "Криптовалютне шахрайство", icon: "💰" },
  { type: "identity_theft", title: "Крадіжка особистості", icon: "👤" },
  { type: "ddos_attack", title: "DDoS-атака", icon: "⚡" },
  { type: "phishing_campaign", title: "Фішингова кампанія", icon: "🎣" },
  { type: "supply_chain", title: "Атака на ланцюг постачання", icon: "🔗" },
  { type: "espionage", title: "Корпоративне шпигунство", icon: "🕶️" },
  { type: "sabotage", title: "Кіберсаботаж", icon: "💣" },
];

const ORGANIZATIONS = [
  { name: "NovaTech Solutions", sector: "IT-компанія" },
  { name: "CryptoVault Exchange", sector: "Криптобіржа" },
  { name: "MedSecure Systems", sector: "Медичний центр" },
  { name: "GreenEnergy Corp", sector: "Енергетична компанія" },
  { name: "DataFlow Analytics", sector: "Аналітична компанія" },
  { name: "SecureBank UA", sector: "Банк" },
  { name: "CloudNine Hosting", sector: "Хостинг-провайдер" },
  { name: "LogiTrans Shipping", sector: "Логістична компанія" },
  { name: "EduPlatform Online", sector: "Освітня платформа" },
  { name: "GameForge Studios", sector: "Ігрова студія" },
  { name: "PharmaCorp Ukraine", sector: "Фармацевтична компанія" },
  { name: "AeroDefense Systems", sector: "Оборонна компанія" },
];

const FIRST_NAMES_MALE = [
  "Олександр",
  "Максим",
  "Андрій",
  "Дмитро",
  "Сергій",
  "Ігор",
  "Віталій",
  "Олег",
  "Тарас",
  "Богдан",
];
const FIRST_NAMES_FEMALE = [
  "Катерина",
  "Оксана",
  "Марія",
  "Юлія",
  "Анна",
  "Наталія",
  "Ірина",
  "Тетяна",
  "Олена",
  "Дарія",
];
const LAST_NAMES = [
  "Коваленко",
  "Шевченко",
  "Бондаренко",
  "Ткаченко",
  "Кравченко",
  "Олійник",
  "Шевчук",
  "Поліщук",
  "Бойко",
  "Ткачук",
  "Мельник",
  "Савченко",
  "Литвин",
  "Гончар",
  "Марченко",
  "Руденко",
  "Павленко",
  "Петренко",
  "Іваненко",
  "Дорошенко",
];
const NICKNAMES = [
  "Root",
  "Ghost",
  "Shadow",
  "Cipher",
  "Phoenix",
  "Viper",
  "Hawk",
  "Storm",
  "Frost",
  "Blaze",
  "Nexus",
  "Pulse",
  "Raven",
  "Byte",
  "Glitch",
  "Zero",
  "Nova",
  "Flux",
  "Onyx",
  "Apex",
];
const ROLES = [
  "Системний адміністратор",
  "DevOps-інженер",
  "Фронтенд-розробник",
  "Бекенд-розробник",
  "Менеджер проекту",
  "CEO",
  "CTO",
  "Фінансовий директор",
  "HR-менеджер",
  "Аналітик безпеки",
  "Тестувальник",
  "Дизайнер",
  "DBA-адміністратор",
  "Мережевий інженер",
  "Технічний письменник",
];

const MOTIVES = [
  "Має значні фінансові борги через азартні ігри.",
  "Був звільнений і поновлений через суд — затаїв образу.",
  "Планує перехід до конкурента і хоче забрати дані.",
  "Шантажується третьою стороною через компромат.",
  "Має таємну угоду з darknet-маркетинговою агенцією.",
  "Не отримав обіцяне підвищення і вирішив помститися.",
  "Працює на іноземну розвідку під прикриттям.",
  "Має хвору дитину і потребує грошей на лікування.",
  'Виявив корупцію керівництва і вирішив "покарати".',
  "Залежний від криптовалютних спекуляцій, потребує капітал.",
];

const ALIBIS_STRONG = [
  "Був на конференції в іншому місті (підтверджено квитками та CCTV готелю).",
  "Чергував у серверній кімнаті під камерами (5 свідків).",
  "Мав відеодзвінок з родиною протягом всього часу інциденту.",
  "Знаходився у лікарні на плановій операції (медичні записи).",
  "Був у відпустці за кордоном (штампи паспорту, геолокація).",
];

const ALIBIS_WEAK = [
  '"Спав вдома". Ніхто не може підтвердити.',
  '"Був на прогулянці". Телефон був вимкнений.',
  '"Працював з дому". VPN-лог показує підключення, але з іншої IP.',
  '"Був у спортзалі". Камери спортзалу не працювали тієї ночі.',
  '"Їздив до друзів". Друзі підтверджують, але є розбіжності у часі.',
];

const CODENAMES = [
  "PHANTOM",
  "BLACKOUT",
  "NIGHTFALL",
  "SERPENT",
  "ECLIPSE",
  "THUNDERBOLT",
  "FROSTBITE",
  "WILDFIRE",
  "DARKWAVE",
  "IRONCLAD",
  "STORMFRONT",
  "DEADLOCK",
  "VORTEX",
  "SHADOWPLAY",
  "CROSSFIRE",
  "FIRESTORM",
  "ICEBREAKER",
  "BLACKBIRD",
  "GHOSTWIRE",
  "NEUROMANCER",
];

const AVATAR_POOL_FEMALE = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-1-nWF6B3BtzhVMtp5W8ZBqi8.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-3-JXB2A5nKGUaWYCmvPf4R2C.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-2-hp5NRSyMPgp3DHNwbzgfbp.webp",
];

const AVATAR_POOL_MALE = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-2-FgKGaALEVysbt352a6zdtV.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-4-JfBcekVkpfuDHP53c45ukn.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-1-EDXJrkTbNt9583V7PHjfHZ.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-1-MSLiFpPm3LaGGo3EayAczo.webp",
];

export function generateCase(
  seed?: number,
  difficulty?: Difficulty
): InvestigationCase {
  const actualSeed = seed ?? Date.now();
  const rng = seededRandom(actualSeed);
  const diff =
    difficulty ??
    pick(["easy", "medium", "hard", "extreme"] as Difficulty[], rng);

  const template = pick(CASE_TEMPLATES, rng);
  const org = pick(ORGANIZATIONS, rng);
  const codename = `OPERATION ${pick(CODENAMES, rng)}`;
  const caseId = `gen_${actualSeed.toString(36)}`;

  const suspectCount =
    diff === "easy" ? 3 : diff === "medium" ? 4 : diff === "hard" ? 5 : 6;
  const suspects = generateSuspects(suspectCount, rng);
  const culpritIndex = Math.floor(rng() * suspectCount);
  const culprit = suspects[culpritIndex];

  culprit.alibi = pick(ALIBIS_WEAK, rng);
  culprit.suspicionLevel = 40 + Math.floor(rng() * 30);

  const redHerringIndex =
    (culpritIndex + 1 + Math.floor(rng() * (suspectCount - 1))) % suspectCount;
  suspects.forEach((s, i) => {
    if (i === culpritIndex) return;
    if (i === redHerringIndex) {
      s.suspicionLevel = 70 + Math.floor(rng() * 20);
      s.alibi = pick(ALIBIS_WEAK, rng);
      s.motive = pick(MOTIVES, rng);
    } else {
      s.alibi = pick(ALIBIS_STRONG, rng);
      s.suspicionLevel = 20 + Math.floor(rng() * 30);
    }
  });

  const evidence = generateEvidence(
    suspects,
    culpritIndex,
    redHerringIndex,
    diff,
    template.type,
    rng
  );

  const cipherPuzzles = generateCipherPuzzles(evidence, diff, rng);

  const networkChallenges = generateNetworkChallenges(
    evidence,
    culprit,
    diff,
    rng
  );

  const stegoChallenges = generateStegoChallenges(evidence, diff, rng);

  const messages = generateMessages(
    suspects,
    culpritIndex,
    evidence,
    rng,
    cipherPuzzles
  );

  const terminalCommands = generateTerminalCommands(
    evidence,
    cipherPuzzles,
    rng
  );

  const hints = generateHints(culprit, evidence, diff, rng);

  const dynamicEvents = generateDynamicEvents(diff, rng);

  suspects.forEach((s, i) => {
    s.relatedEvidenceIds = evidence
      .filter(e => e.pointsToSuspectId === s.id)
      .map(e => e.id);
  });

  const basePoints =
    diff === "easy"
      ? 800
      : diff === "medium"
        ? 1500
        : diff === "hard"
          ? 2500
          : 4000;

  const incidentHour = 1 + Math.floor(rng() * 4);

  return {
    id: caseId,
    title: `${template.title}: ${org.name}`,
    subtitle: `Інцидент у ${org.sector.toLowerCase()}`,
    codename,
    difficulty: diff,
    description: generateDescription(template.type, org, culprit, rng),
    briefing: generateBriefing(
      template.type,
      org,
      incidentHour,
      suspectCount,
      diff,
      rng
    ),
    correctSuspectId: culprit.id,
    suspects,
    evidence,
    messages,
    terminalCommands,
    hints,
    basePoints,
    cipherPuzzles,
    networkChallenges,
    stegoChallenges,
    dynamicEvents,
    isGenerated: true,
  };
}

function generateSuspects(count: number, rng: () => number): Suspect[] {
  const usedNames = new Set<string>();
  const usedNicknames = new Set<string>();
  const suspects: Suspect[] = [];
  const shuffledAvatarsMale = [...AVATAR_POOL_MALE].sort(() => rng() - 0.5);
  const shuffledAvatarsFemale = [...AVATAR_POOL_FEMALE].sort(() => rng() - 0.5);
  let maleAvatarIndex = 0;
  let femaleAvatarIndex = 0;

  for (let i = 0; i < count; i++) {
    const isMale = rng() > 0.5;
    let firstName: string, lastName: string, fullName: string;
    do {
      firstName = pick(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE, rng);
      lastName = pick(LAST_NAMES, rng);
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));
    usedNames.add(fullName);

    let nickname: string;
    do {
      nickname = pick(NICKNAMES, rng);
    } while (usedNicknames.has(nickname));
    usedNicknames.add(nickname);

    let avatarUrl: string;
    if (isMale) {
      avatarUrl =
        shuffledAvatarsMale[maleAvatarIndex % shuffledAvatarsMale.length];
      maleAvatarIndex++;
    } else {
      avatarUrl =
        shuffledAvatarsFemale[femaleAvatarIndex % shuffledAvatarsFemale.length];
      femaleAvatarIndex++;
    }

    const role = pick(ROLES, rng);
    const accessLevel =
      i < 2
        ? pick(["admin", "editor"] as const, rng)
        : pick(["limited", "guest"] as const, rng);

    suspects.push({
      id: `suspect_${i}_${nickname.toLowerCase()}`,
      name: fullName,
      nickname,
      role,
      avatar: avatarUrl,
      motive: pick(MOTIVES, rng),
      alibi: "",
      accessLevel,
      lastActivity: generateTimestamp(22, rng),
      suspicionLevel: 50,
      bio: `${20 + Math.floor(rng() * 30)} років. Працює в компанії ${1 + Math.floor(rng() * 10)} років. ${role}. ${rng() > 0.5 ? "Має конфлікти з колегами." : "Тихий та відповідальний працівник."}`,
      relatedEvidenceIds: [],
    });
  }

  return suspects;
}

function generateEvidence(
  suspects: Suspect[],
  culpritIdx: number,
  redHerringIdx: number,
  diff: Difficulty,
  caseType: string,
  rng: () => number
): Evidence[] {
  const evidence: Evidence[] = [];
  const culprit = suspects[culpritIdx];
  const redHerring = suspects[redHerringIdx];
  const evidenceCount =
    diff === "easy" ? 6 : diff === "medium" ? 8 : diff === "hard" ? 10 : 12;

  const getUnlockHint = (hint: string) => {
    if (diff === "hard" || diff === "extreme") return undefined;
    if (diff === "medium") return rng() > 0.5 ? hint : undefined;
    return hint;
  };

  const scanCode = Math.floor(rng() * 900 + 100).toString();
  evidence.push({
    id: generateId("ev_key", rng),
    title: "Логи доступу до системи",
    category: "log",
    status: "locked",
    shortDescription: "Детальні логи авторизації в момент інциденту",
    fullContent: `[ACCESS LOG]\nTimestamp: 02:14:33\nUser: ${culprit.nickname.toLowerCase()}@internal\nIP: 10.0.1.${Math.floor(rng() * 254) + 1}\nAction: EXPORT_DATA\nResult: SUCCESS\nBytes: ${Math.floor(rng() * 50000) + 10000}\n\n⚠ Цей лог підтверджує, що обліковий запис "${culprit.nickname}" був активний під час інциденту.`,
    isKeyEvidence: true,
    pointsToSuspectId: culprit.id,
    unlockCommand: `scan logs ${scanCode}`,
    unlockHint: getUnlockHint(
      `Спробуйте команду scan logs ${scanCode} у терміналі`
    ),
  });

  const cipherCode = Math.floor(rng() * 9000 + 1000).toString();
  evidence.push({
    id: generateId("ev_cipher", rng),
    title: "Зашифроване повідомлення",
    category: "encrypted",
    status: "encrypted",
    shortDescription: "Перехоплене зашифроване листування підозрюваного",
    fullContent: `[DECRYPTED MESSAGE]\nВід: ${culprit.nickname}\nДо: buyer_anon@darknet\n\n"Дані готові. Передача через 48 годин.\nОплата на гаманець: 0x${Math.floor(rng() * 999999).toString(16)}...\nНе контактуй більше через цей канал."\n\n⚠ Це повідомлення безпосередньо пов'язує ${culprit.name} з продажем даних.`,
    isKeyEvidence: true,
    pointsToSuspectId: culprit.id,
    unlockCommand: `decrypt ${cipherCode}`,
    unlockHint: getUnlockHint(
      "Розшифруйте повідомлення у вкладці Приладів, щоб дізнатися пароль, і введіть decrypt [ПАРОЛЬ]"
    ),
    cipherPuzzleId: "cipher_main",
  });

  suspects.forEach((s, i) => {
    if (i === culpritIdx) return;

    evidence.push({
      id: generateId("ev_red", rng),
      title: `Підозріла активність: ${s.name}`,
      category: "log",
      status: "open",
      shortDescription: `Незвичайна поведінка ${s.nickname} напередодні інциденту`,
      fullContent: `[ACTIVITY REPORT]\nUser: ${s.nickname}\nDate: За день до інциденту\n\n- 23:45 — Вхід у систему з нестандартної IP\n- 23:52 — Перегляд конфіденційних файлів\n- 00:10 — Вихід\n\n⚠ УВАГА: Ця активність виглядає підозріло, але відбулася ЗА ДОБУ до реального інциденту. Можливо, це підстава або збіг.`,
      isKeyEvidence: false,
      pointsToSuspectId: s.id,
      redHerring: true,
    });

    if (evidence.length >= evidenceCount + 5) return;

    evidence.push({
      id: generateId("ev_alibi", rng),
      title: `Підтвердження алібі: ${s.name}`,
      category: "report",
      status: rng() > 0.5 ? "locked" : "open",
      shortDescription: `Документальне підтвердження місцезнаходження ${s.nickname}`,
      fullContent: `[ALIBI VERIFICATION]\nСуб'єкт: ${s.name} (@${s.nickname})\n\n${s.alibi}\n\nСтатус: ПІДТВЕРДЖЕНО ✓\nДжерело: ${pick(["CCTV", "GPS-дані", "Свідчення колег", "Банківські транзакції", "Логи VPN"], rng)}`,
      isKeyEvidence: false,
      pointsToSuspectId: s.id,
      unlockCommand: s.role.includes("адмін")
        ? `background check ${s.nickname.toLowerCase()}`
        : undefined,
      unlockHint: s.role.includes("адмін")
        ? getUnlockHint("Перевірте біографію через background check")
        : undefined,
    });
  });

  const netCode = Math.floor(rng() * 9000 + 1000).toString();
  evidence.push({
    id: generateId("ev_network", rng),
    title: "Мережевий трафік",
    category: "network",
    status: "locked",
    shortDescription: "Дамп мережевого трафіку під час інциденту",
    fullContent: `[NETWORK CAPTURE]\nPeriod: 02:00 - 03:00\nTotal packets: ${1000 + Math.floor(rng() * 5000)}\nSuspicious: ${3 + Math.floor(rng() * 5)}\n\n⚠ Виявлено аномальний трафік з внутрішньої IP на зовнішній сервер.\nОб'єм переданих даних: ${Math.floor(rng() * 50) + 10} GB\nПротокол: HTTPS (encrypted tunnel)\nDestination: ${generateIP(rng)} (darknet relay)`,
    isKeyEvidence: true,
    pointsToSuspectId: undefined,
    unlockCommand: `analyze ${netCode}`,
    unlockHint: getUnlockHint(
      "Знайдіть аномалії в трафіку, щоб отримати код доступу, і введіть analyze [КОД] у терміналі"
    ),
    networkChallengeId: "net_main",
  });

  evidence.push({
    id: generateId("ev_stego", rng),
    title: "Підозріле зображення",
    category: "steganography",
    status: "locked",
    shortDescription: "Зображення з прихованими метаданими",
    fullContent: `[STEGANOGRAPHY ANALYSIS]\nFile: profile_photo_${culprit.nickname.toLowerCase()}.png\n\nВиявлено приховані дані у EXIF-метаданих:\n- GPS: 50.4501° N, 30.5234° E (Київ, бізнес-центр)\n- Timestamp: Час інциденту\n- Hidden text: "${culprit.nickname}_was_here"\n\n⚠ Це спростовує алібі "${culprit.alibi.substring(0, 40)}..."`,
    isKeyEvidence: true,
    pointsToSuspectId: culprit.id,
    unlockCommand: "stego scan",
    unlockHint: getUnlockHint(
      "Використайте стеганографічний сканер у вкладці Приладів"
    ),
    stegoChallengeId: "stego_main",
  });

  const fillerCategories: Array<{
    cat: "file" | "transaction" | "message" | "report";
    title: string;
  }> = [
    { cat: "transaction", title: "Фінансова транзакція" },
    { cat: "file", title: "Видалений файл" },
    { cat: "message", title: "Внутрішнє листування" },
    { cat: "report", title: "Звіт служби безпеки" },
    { cat: "file", title: "Бекап конфігурації" },
    { cat: "transaction", title: "Криптовалютний переказ" },
  ];

  while (evidence.length < evidenceCount) {
    const filler = pick(fillerCategories, rng);
    const targetSuspect = pick(suspects, rng);
    evidence.push({
      id: generateId("ev_fill", rng),
      title: `${filler.title}: ${targetSuspect.nickname}`,
      category: filler.cat,
      status: rng() > 0.6 ? "locked" : "open",
      shortDescription: `${filler.title} пов'язаний з ${targetSuspect.name}`,
      fullContent: `[${filler.cat.toUpperCase()} ANALYSIS]\nПов'язано з: ${targetSuspect.name} (@${targetSuspect.nickname})\n\n${targetSuspect.id === culprit.id ? "⚠ Містить підозрілу інформацію що вказує на причетність." : "Інформація не містить прямих доказів причетності."}`,
      isKeyEvidence: targetSuspect.id === culprit.id && rng() > 0.5,
      pointsToSuspectId: targetSuspect.id,
      redHerring: targetSuspect.id !== culprit.id && rng() > 0.7,
      unlockCommand:
        filler.cat === "file"
          ? `recover ${targetSuspect.nickname.toLowerCase()}`
          : undefined,
      unlockHint:
        filler.cat === "file"
          ? getUnlockHint("Відновіть видалений файл через термінал")
          : undefined,
    });
  }

  return evidence;
}

function generateCipherPuzzles(
  evidence: Evidence[],
  diff: Difficulty,
  rng: () => number
): CipherPuzzle[] {
  const puzzles: CipherPuzzle[] = [];
  const cipherEvidence = evidence.find(e => e.cipherPuzzleId);

  const cipherTypes: CipherType[] =
    diff === "easy"
      ? ["caesar", "base64"]
      : diff === "medium"
        ? ["caesar", "vigenere", "base64", "hex"]
        : ["vigenere", "xor", "morse", "substitution", "atbash"];

  const selectedType = pick(cipherTypes, rng);
  const codeMatch = cipherEvidence?.unlockCommand?.match(/decrypt\s+(\d+)/);
  const password = codeMatch ? codeMatch[1] : "0000";

  const plainTextPhrases = [
    "ДАНІ ГОТОВІ ДО ПЕРЕДАЧІ ПОКУПЦЮ",
    "СЛІДИ ВЕДУТЬ ДО ГОЛОВНОГО СЕРВЕРА",
    "КЛЮЧОВИЙ ПАРОЛЬ СХОВАНО В БАЗІ",
    "ПЕРЕВІРТЕ ЖУРНАЛИ ДОСТУПУ",
    "СИСТЕМА БЕЗПЕКИ БУЛА ЗЛАМАНА ВНОЧІ",
    "ВИДАЛЕНІ ФАЙЛИ ВСЕ ЩЕ НА ДИСКУ",
    "УВАЖНО ПЕРЕВІРЯЙТЕ КОД КОЛЕГ",
    "ХТОСЬ ВІДДАЛЕНО КЕРУЄ ПРОЦЕСАМИ",
  ];
  const plainText = `${pick(plainTextPhrases, rng)}. ПАРОЛЬ: ${password}`;
  const key =
    selectedType === "caesar"
      ? 3 + Math.floor(rng() * 20)
      : selectedType === "vigenere"
        ? pick(["КЛЮЧ", "ТАЙНА", "ШИФР", "СЕКРЕТ", "ПАРОЛЬ"], rng)
        : selectedType === "base64"
          ? "base64"
          : selectedType === "hex"
            ? "hex"
            : selectedType === "morse"
              ? "morse"
              : selectedType === "xor"
                ? Math.floor(rng() * 200) + 50
                : "atbash";

  const cipherText = cipherEncrypt(plainText, selectedType, key);

  puzzles.push({
    id: "cipher_main",
    type: selectedType,
    cipherText,
    plainText,
    key,
    hint:
      selectedType === "caesar"
        ? `Зсув на ${key} позицій`
        : selectedType === "vigenere"
          ? `Ключове слово з 5 літер`
          : selectedType === "base64"
            ? "Стандартне кодування Base64"
            : `Тип шифру: ${selectedType}`,
    difficulty: diff,
    relatedEvidenceId: cipherEvidence?.id ?? "",
    solved: false,
  });

  if (diff === "hard" || diff === "extreme") {
    const secondType = pick(
      cipherTypes.filter(t => t !== selectedType),
      rng
    );
    const secondPlain = pick(
      plainTextPhrases.filter(p => p !== plainText),
      rng
    );
    const secondKey =
      secondType === "caesar" ? 7 + Math.floor(rng() * 15) : "НІЧНИЙ";
    puzzles.push({
      id: "cipher_secondary",
      type: secondType,
      cipherText: cipherEncrypt(secondPlain, secondType, secondKey),
      plainText: secondPlain,
      key: secondKey,
      hint: `Другий шифр: ${secondType}`,
      difficulty: diff,
      relatedEvidenceId:
        evidence[Math.floor(rng() * evidence.length)]?.id ?? "",
      solved: false,
    });
  }

  return puzzles;
}

function generateNetworkChallenges(
  evidence: Evidence[],
  culprit: Suspect,
  diff: Difficulty,
  rng: () => number
): NetworkLogChallenge[] {
  const packetCount =
    diff === "easy" ? 15 : diff === "medium" ? 25 : diff === "hard" ? 40 : 60;
  const anomalyCount =
    diff === "easy" ? 2 : diff === "medium" ? 3 : diff === "hard" ? 4 : 6;

  const culpritIP = `10.0.1.${Math.floor(rng() * 50) + 100}`;
  const externalIP = generateIP(rng);
  const normalIPs = Array.from(
    { length: 8 },
    () => `10.0.1.${Math.floor(rng() * 200) + 1}`
  );

  const packets: NetworkPacket[] = [];
  const anomalyIds: string[] = [];

  for (let i = 0; i < packetCount; i++) {
    const isAnomaly = i < anomalyCount;
    const pktId = `pkt_${i}`;

    if (isAnomaly) {
      anomalyIds.push(pktId);
      packets.push({
        id: pktId,
        timestamp: `02:${String(14 + i).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(2, "0")}`,
        srcIP: culpritIP,
        dstIP: externalIP,
        srcPort: 443 + Math.floor(rng() * 1000),
        dstPort: pick([443, 8080, 4444, 9001], rng),
        protocol: pick(["HTTPS", "TCP"], rng),
        size: 50000 + Math.floor(rng() * 500000),
        suspicious: true,
        flags: "PSH,ACK",
        payload: "[ENCRYPTED DATA TRANSFER]",
        description: `Великий об'єм даних на зовнішню IP`,
      });
    } else {
      packets.push({
        id: pktId,
        timestamp: `02:${String(Math.floor(rng() * 59)).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(2, "0")}`,
        srcIP: pick(normalIPs, rng),
        dstIP: pick([...normalIPs, "8.8.8.8", "1.1.1.1"], rng),
        srcPort: Math.floor(rng() * 60000) + 1024,
        dstPort: pick([80, 443, 53, 22, 25, 3306], rng),
        protocol: pick(["TCP", "UDP", "HTTP", "DNS", "SSH"], rng),
        size: Math.floor(rng() * 5000) + 64,
        suspicious: false,
        flags: pick(["SYN", "ACK", "SYN,ACK", "FIN", "PSH,ACK"], rng),
      });
    }
  }

  packets.sort(() => rng() - 0.5);

  const netEvidence = evidence.find(e => e.networkChallengeId);

  return [
    {
      id: "net_main",
      packets,
      anomalyPacketIds: anomalyIds,
      filterHint: `Фільтруйте за IP: ${culpritIP} або за розміром > 50KB`,
      relatedEvidenceId: netEvidence?.id ?? "",
      solved: false,
    },
  ];
}

function generateStegoChallenges(
  evidence: Evidence[],
  diff: Difficulty,
  rng: () => number
): SteganographyChallenge[] {
  const stegoEvidence = evidence.find(e => e.stegoChallengeId);
  const methods: Array<
    "metadata" | "lsb" | "exif_gps" | "header_injection" | "color_channel"
  > =
    diff === "easy"
      ? ["metadata", "exif_gps"]
      : ["lsb", "header_injection", "color_channel", "exif_gps"];

  return [
    {
      id: "stego_main",
      imageUrl: "/tools/stego-sample.png",
      hiddenData: `GPS: 50.${Math.floor(rng() * 9999)}N, 30.${Math.floor(rng() * 9999)}E | TIME: 02:${String(Math.floor(rng() * 59)).padStart(2, "0")} | USER: suspect_confirmed`,
      extractionMethod: pick(methods, rng),
      hint: "Перевірте метадані зображення або проаналізуйте LSB-канал",
      relatedEvidenceId: stegoEvidence?.id ?? "",
      solved: false,
    },
  ];
}

function generateMessages(
  suspects: Suspect[],
  culpritIdx: number,
  evidence: Evidence[],
  rng: () => number,
  cipherPuzzles?: CipherPuzzle[]
): Message[] {
  const messages: Message[] = [];
  const culprit = suspects[culpritIdx];

  const mainCipher = cipherPuzzles?.[0];
  let culpritMessageContent =
    "Все готово. Починаю о 02:00. Не пиши сюди більше.";

  if (mainCipher) {
    switch (mainCipher.type) {
      case "morse":
        culpritMessageContent = `Слухай, я залишив тобі голосове. Там тільки дивні гудки: ${mainCipher.cipherText}. Це і є ключ.`;
        break;
      case "base64":
        culpritMessageContent = `Ось той рядок, як і домовлялися. Закінчується на "==", ти зрозумієш: ${mainCipher.cipherText}`;
        break;
      case "caesar":
        culpritMessageContent = `Я зсунув усі літери, як ми вчили в дитинстві. Текст: ${mainCipher.cipherText}`;
        break;
      case "hex":
        culpritMessageContent = `Надсилаю шістнадцятковий дамп пам'яті, там всередині наш секрет: ${mainCipher.cipherText}`;
        break;
      case "binary":
        culpritMessageContent = `Лише нулі та одиниці: ${mainCipher.cipherText}`;
        break;
      case "vigenere":
        culpritMessageContent = `Використав наш старий шифр і секретне слово. Ось каша, що вийшла: ${mainCipher.cipherText}`;
        break;
      case "xor":
        culpritMessageContent = `Пропустив через XOR операцію з ключем. Дані: ${mainCipher.cipherText}`;
        break;
      case "atbash":
        culpritMessageContent = `Алфавіт задом наперед. Ти впораєшся: ${mainCipher.cipherText}`;
        break;
      default:
        culpritMessageContent = `Зашифровано: ${mainCipher.cipherText}`;
    }
  }

  messages.push({
    id: generateId("msg", rng),
    sender: culprit.nickname,
    receiver: "unknown_contact",
    timestamp: "01:45",
    content: culpritMessageContent,
    suspicious: true,
    relatedEvidenceId: evidence[0]?.id,
  });

  messages.push({
    id: generateId("msg", rng),
    sender: "unknown_contact",
    receiver: culprit.nickname,
    timestamp: "01:47",
    content: "Отримав. Дані будуть розшифровані.",
    suspicious: true,
  });

  for (let i = 0; i < suspects.length; i++) {
    if (i === culpritIdx) continue;
    const other = suspects[(i + 1) % suspects.length];
    if (other.id === culprit.id) continue;

    messages.push({
      id: generateId("msg", rng),
      sender: suspects[i].nickname,
      receiver: other.nickname,
      timestamp: generateTimestamp(9, rng),
      content: pick(
        [
          "Привіт, чи можеш глянути той тікет? Клієнт чекає.",
          "Завтра мітинг о 10:00, не забудь.",
          "Дякую за допомогу з деплоєм!",
          "Бачив нові правила безпеки? Треба змінити паролі.",
          "Обід разом? Є нова кав'ярня навпроти.",
        ],
        rng
      ),
      suspicious: false,
    });
  }

  const redHerring = suspects[(culpritIdx + 1) % suspects.length];
  messages.push({
    id: generateId("msg", rng),
    sender: redHerring.nickname,
    receiver: "private_chat",
    timestamp: "23:30",
    content: "Мені потрібні гроші. Терміново. Є варіант заробити швидко?",
    suspicious: true,
  });

  return messages.sort(() => rng() - 0.5);
}

function generateTerminalCommands(
  evidence: Evidence[],
  cipherPuzzles: CipherPuzzle[],
  rng: () => number
): TerminalCommand[] {
  const commands: TerminalCommand[] = [];

  evidence.forEach(e => {
    if (e.unlockCommand && e.status !== "open") {
      const parts = e.unlockCommand.split(" ");
      commands.push({
        command: e.unlockCommand,
        description: `${e.shortDescription}`,
        type: parts[0] === "decrypt" ? "decrypt" : "unlock_evidence",
        response: `Обробка запиту...\n${e.shortDescription}\n\nДані отримано успішно.`,
        unlockEvidenceId: e.id,
        requiresArgument: parts.length > 2,
        expectedArgument:
          parts.length > 2 ? parts.slice(2).join(" ") : undefined,
        cpuCost: 10 + Math.floor(rng() * 20),
      });
    }
  });

  commands.push({
    command: "scan network",
    description: "Сканувати мережевий трафік",
    type: "scan",
    response:
      "Запуск сканування мережі...\nВиявлено аномальний трафік. Використайте аналізатор пакетів у вкладці Приладів.",
    cpuCost: 15,
  });

  commands.push({
    command: "trace ip",
    description: "Відстежити IP-адресу",
    type: "trace",
    response:
      "Трасування маршруту...\nIP веде через кілька проксі-серверів. Потрібен глибший аналіз.",
    requiresArgument: true,
    expectedArgument: undefined,
    cpuCost: 20,
  });

  return commands;
}

function generateHints(
  culprit: Suspect,
  evidence: Evidence[],
  diff: Difficulty,
  rng: () => number
): Hint[] {
  return [
    {
      id: "hint_1",
      text: "Зверніть увагу на часові мітки в логах. Хто був активний під час інциденту?",
      cost: diff === "easy" ? 50 : diff === "medium" ? 100 : 200,
    },
    {
      id: "hint_2",
      text: `Перевірте алібі кожного підозрюваного. Одне з них не витримує перевірки.`,
      cost: diff === "easy" ? 100 : diff === "medium" ? 200 : 350,
    },
    {
      id: "hint_3",
      text: `Зашифроване повідомлення містить ключову інформацію. Використайте дешифратор.`,
      cost: diff === "easy" ? 150 : diff === "medium" ? 300 : 500,
    },
    {
      id: "hint_4",
      text: `Підозрюваний з найвищим рівнем підозри може бути підставлений. Шукайте справжнього винуватця серед тих, хто виглядає "чистим".`,
      cost: diff === "easy" ? 200 : diff === "medium" ? 400 : 700,
    },
    {
      id: "hint_5",
      text: `Винуватець: @${culprit.nickname}. Мотив: ${culprit.motive.substring(0, 50)}...`,
      cost: diff === "easy" ? 400 : diff === "medium" ? 600 : 1000,
    },
  ];
}

function generateDynamicEvents(
  diff: Difficulty,
  rng: () => number
): DynamicEvent[] {
  const eventCount =
    diff === "easy" ? 1 : diff === "medium" ? 2 : diff === "hard" ? 3 : 4;
  const events: DynamicEvent[] = [];

  const templates: Array<Omit<DynamicEvent, "id" | "resolved">> = [
    {
      type: "counter_hack",
      title: "⚠ КОНТР-АТАКА ВИЯВЛЕНА",
      description:
        "Хтось намагається видалити логи з сервера! Введіть команду блокування.",
      timeLimit: 30,
      requiredAction: "block intrusion",
      reward: 200,
      penalty: -300,
    },
    {
      type: "bonus_intel",
      title: "📡 ПЕРЕХОПЛЕНО СИГНАЛ",
      description:
        "Виявлено незашифрований канал зв'язку. Введіть команду перехоплення.",
      timeLimit: 45,
      requiredAction: "intercept signal",
      reward: 300,
      penalty: 0,
    },
    {
      type: "data_corruption",
      title: "💾 ПОШКОДЖЕННЯ ДАНИХ",
      description: "Частина доказів пошкоджена! Запустіть відновлення.",
      timeLimit: 20,
      requiredAction: "repair data",
      reward: 150,
      penalty: -200,
    },
    {
      type: "informant_tip",
      title: "🕵️ АНОНІМНА ПІДКАЗКА",
      description: "Інформатор надіслав зашифровану підказку. Розшифруйте її.",
      timeLimit: 60,
      requiredAction: "decode tip",
      reward: 250,
      penalty: 0,
    },
    {
      type: "system_alert",
      title: "🔴 СИСТЕМНА ТРИВОГА",
      description:
        "Виявлено несанкціонований доступ до вашого терміналу! Змініть ключі.",
      timeLimit: 15,
      requiredAction: "rotate keys",
      reward: 100,
      penalty: -400,
    },
  ];

  const selected = pickN(templates, eventCount, rng);
  selected.forEach((t, i) => {
    events.push({ ...t, id: `event_${i}`, resolved: false });
  });

  return events;
}

function generateDescription(
  type: string,
  org: { name: string; sector: string },
  culprit: Suspect,
  rng: () => number
): string {
  const descriptions: Record<string, string> = {
    data_breach: `У системі ${org.name} (${org.sector}) стався масштабний витік конфіденційних даних. Понад ${Math.floor(rng() * 50000) + 5000} записів було експортовано та передано невідомій третій стороні. Ваше завдання — знайти інсайдера.`,
    ransomware: `Сервери ${org.name} були заражені шифрувальником. Зловмисник вимагає ${Math.floor(rng() * 50) + 5} BTC за ключ дешифрування. Атака була здійснена зсередини. Знайдіть зрадника.`,
    insider_theft: `З внутрішньої мережі ${org.name} було викрадено інтелектуальну власність вартістю $${Math.floor(rng() * 10) + 1}M. Доступ мали лише працівники. Хто зрадив компанію?`,
    crypto_fraud: `З гарячих гаманців ${org.name} зникло $${(Math.floor(rng() * 90) + 10) / 10}M у криптовалюті. Транзакції здійснено з внутрішньої мережі. Знайдіть крота.`,
    identity_theft: `Персональні дані ${Math.floor(rng() * 20000) + 3000} клієнтів ${org.name} з'явилися на darknet. Витік стався через внутрішній канал. Визначте відповідального.`,
    ddos_attack: `${org.name} зазнала потужної DDoS-атаки, яка була скоординована зсередини. Хтось надав зловмисникам архітектуру мережі. Знайдіть інсайдера.`,
    phishing_campaign: `Масова фішингова кампанія проти клієнтів ${org.name} використовувала внутрішні шаблони листів. Хтось з працівників передав їх зловмисникам.`,
    supply_chain: `У ланцюг постачання ${org.name} було впроваджено шкідливий код. Атака здійснена через внутрішній доступ до CI/CD pipeline.`,
    espionage: `Конфіденційні розробки ${org.name} з'явилися у конкурента. Корпоративне шпигунство здійснено зсередини. Знайдіть шпигуна.`,
    sabotage: `Критична інфраструктура ${org.name} була навмисно пошкоджена. Саботаж здійснено особою з привілейованим доступом.`,
  };
  return descriptions[type] ?? descriptions.data_breach;
}

function generateBriefing(
  type: string,
  org: { name: string; sector: string },
  hour: number,
  suspectCount: number,
  diff: Difficulty,
  rng: () => number
): string {
  return `[CLASSIFIED — РІВЕНЬ ДОСТУПУ: TOP SECRET]

Дата інциденту: ${Math.floor(rng() * 28) + 1} ${pick(["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"], rng)} 2025, ${String(hour).padStart(2, "0")}:${String(Math.floor(rng() * 59)).padStart(2, "0")}
Об'єкт: ${org.name} — ${org.sector}
Складність: ${diff.toUpperCase()}

ПІДОЗРЮВАНИХ: ${suspectCount}
СТАТУС: АКТИВНЕ РОЗСЛІДУВАННЯ

ВАШЕ ЗАВДАННЯ:
1. Розблокуйте всі ключові докази через термінал та прилади
2. Використайте дешифратор для розкодування перехоплених повідомлень
3. Проаналізуйте мережевий трафік на аномалії
4. Перевірте алібі кожного підозрюваного
5. Висуньте обґрунтоване звинувачення

⚠ УВАГА: Деякі докази є red herrings (хибними слідами).
⚠ Помилкове звинувачення = значна втрата очок.
⚠ Використовуйте вкладку ПРИЛАДИ для складних головоломок.

ІНСТРУМЕНТИ ДОСТУПНІ:
• Дешифратор (Caesar, Vigenère, Base64, Hex, Morse)
• Аналізатор мережевих пакетів
• Стеганографічний сканер
• Граф зв'язків для візуалізації розслідування`;
}
