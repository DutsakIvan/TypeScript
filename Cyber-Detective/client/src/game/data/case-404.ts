import type { InvestigationCase } from "../types";

export const case404: InvestigationCase = {
  id: "case_404",
  title: "Справа 404: цифровий слід",
  subtitle: "Витік даних у CyberClub",
  codename: "OPERATION GHOST",
  difficulty: "easy",
  basePoints: 1000,
  description:
    "У внутрішній системі студентського IT-клубу CyberClub стався витік файлу members_backup.zip. Архів із приватними даними учасників був експортований та надісланий з анонімної поштової адреси. Ваше завдання — проаналізувати докази, перевірити підозрюваних і знайти винного.",
  briefing: `[CLASSIFIED — РІВЕНЬ ДОСТУПУ: SECRET]

Дата інциденту: 20 листопада 2024, 22:17
Об'єкт: Внутрішній сервер CyberClub
Тип атаки: Несанкціонований експорт + ексфільтрація

ХРОНОЛОГІЯ:
22:14 — Авторизація через невідомий токен
22:17 — Експорт members_backup.zip (47 учасників)
22:18 — SMTP-relay → ghost_revenge@proton.me
22:19 — Сесія завершена

ВАШЕ ЗАВДАННЯ:
1. Розблокувати всі ключові докази через термінал
2. Проаналізувати алібі 4-х підозрюваних
3. Знайти зв'язки в листуванні
4. Висунути обґрунтоване звинувачення

⚠ Помилкове звинувачення = -300 очок репутації.`,
  correctSuspectId: "denys_ghost",
  suspects: [
    {
      id: "max_root",
      name: "Максим Коваль",
      nickname: "Root",
      role: "Адміністратор сайту",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-1-EDXJrkTbNt9583V7PHjfHZ.webp",
      motive:
        "Міг приховувати технічну помилку в системі, яка призвела до витоку. Або не деактивував токен Дениса вчасно.",
      alibi:
        "Під час витоку був офлайн. Останній вхід — 21:10 через мобільний у режимі read-only. Підтверджено логами резервного сервера.",
      accessLevel: "admin",
      lastActivity: "21:10",
      suspicionLevel: 62,
      bio: "Технічний лідер клубу, 24 роки. Працює в CyberClub з 2022 року. Має повний доступ до всіх систем. Колишній друг Дениса, але посварились після його виключення.",
      relatedEvidenceIds: ["admin_alibi", "server_logs"],
    },
    {
      id: "alina_pixel",
      name: "Аліна Мороз",
      nickname: "Pixel",
      role: "Дизайнерка клубу",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-2-hCq7NS4UXw9Ko4LtXpgy89.webp",
      motive:
        "Мала конфлікт через неопублікований дизайн. Незадоволена ставленням клубу.",
      alibi:
        "Не мала технічного доступу до архіву. Її акаунт обмежений лише графічними інструментами. Лог підтверджує — вона не була в мережі о 22:17.",
      accessLevel: "limited",
      lastActivity: "19:45",
      suspicionLevel: 35,
      bio: "22 роки, графічна дизайнерка. У клубі рік. Конфлікт стосувався виключно творчих рішень — технічних навичок для викрадення даних не має.",
      relatedEvidenceIds: ["design_conflict"],
    },
    {
      id: "denys_ghost",
      name: "Денис Романенко",
      nickname: "Ghost",
      role: "Колишній учасник клубу",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-3-SGN2KwmWkKAzEVQHjgqNCx.webp",
      motive:
        'Був виключений із клубу за порушення етики. Прилюдно погрожував, що "система ще пам\'ятає старі ключі".',
      alibi:
        "Стверджує, що давно не мав доступу. Заперечує будь-яку причетність. Проте старий токен (legacy_ghost_token) не був деактивований і використовувався о 22:14.",
      accessLevel: "none",
      lastActivity: "невідомо",
      suspicionLevel: 87,
      bio: '25 років. Один із засновників клубу, виключений у вересні 2024 за злив приватного коду. Перед виключенням додав підозрілий "backup script" з export endpoint, який був використаний для атаки.',
      relatedEvidenceIds: ["old_token", "anonymous_email", "commit_history"],
    },
    {
      id: "oleh_newbie",
      name: "Олег Савчук",
      nickname: "Newbie",
      role: "Новий волонтер",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-4-Vh8JjT6UkeLLsNxBC3MHHN.webp",
      motive:
        "Міг випадково або навмисно зробити помилку через недосвідченість. Намагався відкрити список учасників.",
      alibi:
        'Має рівень "editor". Лог показує, що він кілька разів безуспішно намагався відкрити /api/members (403). Технічно не зміг би експортувати архів.',
      accessLevel: "editor",
      lastActivity: "22:01",
      suspicionLevel: 41,
      bio: "19 років, перший рік навчання. Часто плутає інтерфейс адмін-панелі. Чесний, але занадто допитливий — це могло привернути увагу.",
      relatedEvidenceIds: ["newbie_mistake"],
    },
  ],
  evidence: [
    {
      id: "incident_report",
      title: "Звіт про інцидент",
      category: "report",
      status: "open",
      shortDescription: "Офіційний звіт про витік members_backup.zip.",
      fullContent: `[ЗВІТ #IR-2024-1120-A]
Складено: автоматичною системою моніторингу
Час: 22:23, 20.11.2024

ПОДІЯ:
О 22:17 файл members_backup.zip (2.4 MB) був експортований із внутрішньої системи CyberClub. Файл містив персональні дані 47 учасників: імена, email, номери телефонів та внутрішні ролі.

МЕТОД:
Експорт здійснений через API /api/export/members з використанням токена авторизації. Через 3 хвилини файл був надісланий на зовнішню email-адресу через SMTP-relay.

ШКОДА:
- Витік PII 47 осіб
- Можливі позови за GDPR-подібним законодавством
- Репутаційні втрати клубу

РЕКОМЕНДАЦІЇ:
1. Розслідувати всіх з активним токеном
2. Деактивувати застарілі ключі
3. Перевірити SMTP-relay логи`,
      isKeyEvidence: false,
    },
    {
      id: "server_logs",
      title: "Логи входу на сервер",
      category: "log",
      status: "locked",
      shortDescription: "Системні логи за вечір інциденту з IP та токенами.",
      fullContent: `[SERVER LOG — 20.11.2024]
[22:14:03] LOGIN attempt
  token: legacy_ghost_token
  IP: 172.16.4.22
  user-agent: curl/7.81.0
  status: AUTHENTICATED ✓

[22:15:11] GET /api/members
  token: legacy_ghost_token
  status: 200 OK
  bytes: 18403

[22:17:42] POST /api/export/members
  token: legacy_ghost_token
  file: members_backup.zip
  size: 2,457,128 bytes
  status: 200 OK ⚠

[22:18:09] SMTP relay
  attachment: members_backup.zip
  to: ghost_revenge@proton.me
  status: DELIVERED ⚠

[22:19:33] LOGOUT
  token: legacy_ghost_token
  session_duration: 5m 30s

>>> ANOMALY DETECTED: Token belongs to expelled member`,
      isKeyEvidence: true,
      pointsToSuspectId: "denys_ghost",
      unlockCommand: "scan logs",
      unlockHint: "Спробуйте просканувати серверні логи командою scan logs",
    },
    {
      id: "anonymous_email",
      title: "Анонімний лист",
      category: "message",
      status: "open",
      shortDescription: "Лист, з якого було надіслано архів.",
      fullContent: `From: ghost_revenge@proton.me
To: cybersec-news@gmail.com
Date: 20.11.2024 22:18
Subject: Система пам'ятає старі ключі

Текст:
"Ви думали, що мене немає? Що я зник?
Я все ще маю доступ. Ваша система — решето.
Ось вам доказ. У вкладенні — дані всіх ваших учасників.
Наступного разу думайте, перш ніж когось виганяти.
                                          — Ghost"

Вкладення: members_backup.zip (2.4 MB)
SHA-256: a3f2b1c8d4e9f7a2b6c5d8e1f3a9b7c4

ПРИМІТКА КРИМІНАЛІСТА:
Стиль фрази "система пам'ятає старі ключі" повторюється в особистих повідомленнях Дениса Романенка від 6 листопада 2024.`,
      isKeyEvidence: true,
      pointsToSuspectId: "denys_ghost",
    },
    {
      id: "old_token",
      title: "Старий токен доступу",
      category: "file",
      status: "locked",
      shortDescription: "Застарілий токен, який не був деактивований.",
      fullContent: `[TOKEN INSPECTION REPORT]

Token ID: legacy_ghost_token
Hash: 5f7a9b3c8d2e1f4a6b8c0d3e5f7a9b3c
Created: 2024-01-15 14:23:11
Owner: Денис Романенко (denys_ghost)
Permissions: read, export, api_access, admin_legacy
Status: ACTIVE ⚠ (НЕ ДЕАКТИВОВАНИЙ!)
Last used: 2024-11-20 22:14

ТЕРМІН ДІЇ: Має бути деактивований 02.09.2024
Фактична деактивація: НЕ ВИКОНАНА

ВИСНОВОК:
Через помилку (або навмисне) адміністратора Максима Коваля, токен Дениса не був деактивований після його виключення з клубу.
Денис теоретично міг продовжувати використовувати його до моменту блокування.`,
      isKeyEvidence: true,
      pointsToSuspectId: "denys_ghost",
      unlockCommand: "check token",
      unlockHint: "Перевірте всі активні токени командою check token",
    },
    {
      id: "admin_alibi",
      title: "Алібі адміністратора",
      category: "log",
      status: "open",
      shortDescription:
        "Логи резервного сервера показують, що Максим був офлайн.",
      fullContent: `[BACKUP SERVER LOG — max_root]

[20:45] LOGOUT from main server
[20:46] Last ping: desktop client disconnected
[21:10] Mobile app: read-only check (dashboard view)
[21:11] Mobile app: disconnected
[22:00 - 23:00] No activity recorded
[23:14] First login attempt after incident — failed (wrong password ×3)

ВИСНОВОК:
Максим не мав активної сесії під час експорту файлу о 22:17.
Його останній вхід був о 21:10 через мобільний додаток у режимі тільки-для-читання, що не дозволяє експорт.`,
      isKeyEvidence: false,
    },
    {
      id: "design_conflict",
      title: "Конфлікт через дизайн",
      category: "message",
      status: "open",
      shortDescription: "Листування Аліни з клубом про конфлікт.",
      fullContent: `[CHAT LOG — General Channel]
19 листопада 2024

[18:42] Аліна: Я витратила 2 тижні на новий дизайн головної. А ви навіть не розглянули.
[18:45] Максим: Алін, ми просто вирішили піти в іншому напрямку.
[18:47] Аліна: Я не злюся через дизайн, але більше безкоштовно нічого не перероблятиму.
[18:50] Олег: Може обговоримо на зустрічі?
[18:51] Аліна: Не бачу сенсу.
[18:52] Аліна вийшла з каналу.

ПРИМІТКА:
Конфлікт стосувався лише дизайнерських рішень. Аліна не мала технічного доступу до бази даних учасників.
Рівень її акаунту: limited (тільки графічні інструменти).`,
      isKeyEvidence: false,
    },
    {
      id: "commit_history",
      title: "Історія комітів Дениса",
      category: "file",
      status: "locked",
      shortDescription: "Git-логи з підозрілою активністю Дениса.",
      fullContent: `[GIT LOG — Author: denys]

commit a3f2b1c (Sep 5, 2024 16:42)
  Author: Денис Романенко <denys@cyberclub.ua>
  feat: backup script update - added export endpoint
  +files: api/export/members.py

  Diff:
  + def export_members():
  +     if request.headers.get('Authorization'):
  +         return jsonify(get_all_members())

commit 7d4e8f2 (Sep 3, 2024 23:11)
  Author: Денис Романенко <denys@cyberclub.ua>
  fix: token refresh logic
  modified: auth/tokens.py

  Diff:
  - if token.is_legacy: deactivate(token)
  + # TODO: deactivate later

commit 1c8d3e9 (Sep 2, 2024 02:33)
  Author: Денис Романенко <denys@cyberclub.ua>
  refactor: cleanup
  modified: .gitignore

ВИСНОВОК:
Денис додав export endpoint за 2 дні до свого виключення.
Він також закоментував логіку деактивації legacy-токенів.
Цей самий endpoint використовувався для витоку 20.11.2024.
Денис фактично залишив собі бекдор.`,
      isKeyEvidence: true,
      pointsToSuspectId: "denys_ghost",
      unlockCommand: "git log",
      unlockHint: "Перегляньте git історію командою git log",
    },
    {
      id: "newbie_mistake",
      title: "Помилка новачка",
      category: "log",
      status: "open",
      shortDescription: "Логи помилкових дій Олега в системі.",
      fullContent: `[ACTIVITY LOG — oleh_newbie] 20.11.2024

[21:30] EDIT /articles/welcome-post
        status: 200 OK
[21:45] EDIT /articles/welcome-post
        status: 200 OK
[21:50] DELETE /articles/draft-123
        status: 403 (permission denied)
[22:01] EDIT /articles/welcome-post
        status: 200 OK
[22:05] GET /api/members
        status: 403 (permission denied)
[22:06] GET /api/members
        status: 403 (permission denied)
[22:07] Олег вийшов з системи

ВИСНОВОК:
Олег намагався отримати доступ до списку учасників, але його рівень доступу (editor) не дозволяв цього.
Усі його спроби були заблоковані системою.
Технічно він не зміг би експортувати архів.`,
      isKeyEvidence: false,
    },
    {
      id: "denys_private_msg",
      title: "Приватне повідомлення Дениса",
      category: "message",
      status: "encrypted",
      shortDescription:
        "Зашифроване повідомлення Дениса до невідомого адресата.",
      fullContent: `[ARCHIVED PRIVATE MESSAGE — DECRYPTED]
Sent: 13.11.2024 (за тиждень до інциденту)
Channel: Невідомий (P2P)
From: denys.r
To: [приховано]

Текст:
"Вони думають, що видалили мій акаунт.
Але я залишив собі бекдор. Legacy token все ще працює.
Час показати їм, що не варто було мене виганяти.

P.S.: Скоро система пам'ятатиме старі ключі."

ВАЖЛИВО:
Фраза "система пам'ятає старі ключі" дослівно повторюється у заголовку анонімного листа.
Це прямий лінгвістичний доказ авторства Дениса.`,
      isKeyEvidence: true,
      pointsToSuspectId: "denys_ghost",
      unlockCommand: "unlock GHOST-404",
      unlockHint: "Спробуйте розшифрувати архів секретним кодом GHOST-404",
    },
  ],
  messages: [
    {
      id: "msg_1",
      sender: "Денис",
      receiver: "Максим",
      timestamp: "2 тижні до інциденту",
      content:
        "Система пам'ятає старі ключі. Побачимо, чи справді ви все закрили. Не варто було мене виганяти.",
      relatedEvidenceId: "anonymous_email",
      suspicious: true,
    },
    {
      id: "msg_2",
      sender: "Аліна",
      receiver: "Клуб",
      timestamp: "1 день до інциденту",
      content:
        "Я не злюся через дизайн, але більше безкоштовно нічого не перероблятиму. Це моя остання відповідь на цю тему.",
      relatedEvidenceId: "design_conflict",
    },
    {
      id: "msg_3",
      sender: "Олег",
      receiver: "Максим",
      timestamp: "День інциденту, 20:00",
      content:
        "Привіт! Я випадково натиснув щось не те в панелі. Здається, я намагався відкрити список учасників, але мені показало помилку доступу. Вибач!",
      relatedEvidenceId: "newbie_mistake",
    },
    {
      id: "msg_4",
      sender: "Максим",
      receiver: "Клуб",
      timestamp: "День після інциденту",
      content:
        "Увага всім! Виявлено витік даних. Файл members_backup.zip був експортований без дозволу. Розпочинаю внутрішнє розслідування.",
      relatedEvidenceId: "incident_report",
    },
    {
      id: "msg_5",
      sender: "Денис",
      receiver: "Невідомий",
      timestamp: "Тиждень до інциденту",
      content:
        "Вони думають, що видалили мій акаунт. Але я залишив собі бекдор. Legacy token все ще працює.",
      relatedEvidenceId: "denys_private_msg",
      suspicious: true,
    },
    {
      id: "msg_6",
      sender: "Система",
      receiver: "Адмін",
      timestamp: "День інциденту, 22:20",
      content:
        "[ALERT] Unusual export activity detected. Token: legacy_ghost_token. File: members_backup.zip exported via SMTP relay.",
      relatedEvidenceId: "server_logs",
      suspicious: true,
    },
  ],
  terminalCommands: [
    {
      command: "help",
      description: "Показати список команд",
      type: "info",
      response: `╔════════════════════════════════════════════╗
║       ДОСТУПНІ КОМАНДИ ТЕРМІНАЛУ          ║
╠════════════════════════════════════════════╣
║ help          — Показати цю довідку       ║
║ scan logs     — Просканувати серверні логи║
║ check token   — Перевірити токени         ║
║ trace ip      — Відстежити IP-адресу      ║
║ git log       — Історія комітів           ║
║ unlock <code> — Розблокувати архів        ║
║ status        — Статус розслідування      ║
║ whoami        — Інформація про детектива  ║
║ ls /evidence  — Список доказів            ║
║ clear         — Очистити термінал         ║
╚════════════════════════════════════════════╝
Підказка: ↑/↓ — історія команд, Tab — автодоповнення`,
    },
    {
      command: "scan logs",
      description: "Просканувати серверні логи",
      type: "unlock_evidence",
      response: `⟩ Initializing log scanner...
⟩ Connecting to /var/log/cyberclub/...
⟩ ████████████████████ 100%
⟩
⟩ Found 5 entries on 2024-11-20:
⟩ • [22:14] LOGIN — token: legacy_ghost_token
⟩ • [22:15] ACCESS /api/members
⟩ • [22:17] EXPORT /api/export/members ⚠
⟩ • [22:18] SMTP RELAY → external
⟩ • [22:19] LOGOUT
⟩
⟩ ⚠ ANOMALY: Token used after expulsion!
⟩
⟩ ✓ Доказ "Логи входу на сервер" розблоковано.`,
      unlockEvidenceId: "server_logs",
    },
    {
      command: "check token",
      description: "Перевірити старі токени доступу",
      type: "unlock_evidence",
      response: `⟩ Fetching active tokens from database...
⟩ ████████████████████ 100%
⟩
⟩ Found 12 active tokens. Cross-referencing...
⟩
⟩ ⚠ CRITICAL: legacy_ghost_token — STILL ACTIVE!
⟩   Owner: Денис Романенко (EXPELLED)
⟩   Created: 2024-01-15
⟩   Should have expired: 2024-09-02
⟩   Last used: 2024-11-20 22:14
⟩
⟩ ✓ Доказ "Старий токен доступу" розблоковано.`,
      unlockEvidenceId: "old_token",
    },
    {
      command: "trace ip",
      description: "Відстежити IP-адресу з логів",
      type: "info",
      response: `⟩ Tracing 172.16.4.22...
⟩ Hop 1: 172.16.0.1 (gateway)        [2ms]
⟩ Hop 2: 172.16.4.1 (subnet)         [5ms]
⟩ Hop 3: 172.16.4.22 (target)        [8ms]
⟩
⟩ Result: VPN pool address (anonymized)
⟩ Geo: Невизначено (анонімізовано)
⟩ Note: Тра same IP used historical:
⟩       — 2024-08 logins by denys_ghost (×17)
⟩       — 2024-09 last login pre-expulsion
⟩ 
⟩ ⚠ IP має історичний зв'язок з Денисом.`,
    },
    {
      command: "git log",
      description: "Переглянути історію комітів",
      type: "unlock_evidence",
      response: `⟩ Cloning repository...
⟩ git log --author='denys' --since='2024-09-01'
⟩
⟩ commit a3f2b1c (Sep 5)
⟩   feat: backup script update - added export endpoint
⟩
⟩ commit 7d4e8f2 (Sep 3)
⟩   fix: token refresh logic (deactivation disabled!)
⟩
⟩ commit 1c8d3e9 (Sep 2)
⟩   refactor: cleanup
⟩
⟩ ⚠ Денис додав export-endpoint та закоментував
⟩    деактивацію токенів за 2 дні до виключення.
⟩
⟩ ✓ Доказ "Історія комітів Дениса" розблоковано.`,
      unlockEvidenceId: "commit_history",
    },
    {
      command: "unlock GHOST-404",
      description: "Розблокувати секретний архів",
      type: "decrypt",
      response: `⟩ Введення коду доступу: GHOST-404
⟩ Перевірка...
⟩ ████████████████████ 100%
⟩ ✓ Код прийнято.
⟩
⟩ Розшифровка приватного архіву...
⟩ AES-256-GCM... декодування...
⟩
⟩ Знайдено приватне повідомлення Дениса (13.11.2024):
⟩
⟩  "Вони думають, що видалили мій акаунт.
⟩   Але я залишив собі бекдор. Legacy token все ще працює.
⟩   Час показати їм, що не варто було мене виганяти.
⟩   P.S.: Скоро система пам'ятатиме старі ключі."
⟩
⟩ ⚠ Лінгвістичний збіг з анонімним листом!
⟩ ✓ Доказ "Приватне повідомлення Дениса" розблоковано.`,
      unlockEvidenceId: "denys_private_msg",
    },
    {
      command: "whoami",
      description: "Інформація про поточного детектива",
      type: "info",
      response: `⟩ User: detective@cyber-unit
⟩ Role: Senior Cyber Detective
⟩ Clearance: LEVEL 7
⟩ Active case: #404 — Cyber Club Leak
⟩ Status: INVESTIGATING`,
    },
    {
      command: "ls /evidence",
      description: "Список усіх доказів",
      type: "status",
      response: "",
    },
    {
      command: "status",
      description: "Статус розслідування",
      type: "status",
      response: "",
    },
    {
      command: "clear",
      description: "Очистити термінал",
      type: "clear",
      response: "",
    },
  ],
  hints: [
    {
      id: "h1",
      text: "Зверніть увагу на токен у логах — кому він належить?",
      cost: 50,
    },
    {
      id: "h2",
      text: "Порівняйте лексику в анонімному листі з приватними повідомленнями підозрюваних.",
      cost: 75,
    },
    {
      id: "h3",
      text: "Хто з підозрюваних має технічну можливість + мотив + слід у логах?",
      cost: 100,
    },
  ],
};
