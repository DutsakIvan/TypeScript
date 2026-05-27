import type { InvestigationCase } from "../types";

export const caseHospital: InvestigationCase = {
  id: "case_hospital",
  title: "Справа Лікарня №7: продані діагнози",
  subtitle: "Витік медичних карт пацієнтів",
  codename: "OPERATION HIPPOCRATES",
  difficulty: "hard",
  basePoints: 2500,
  unlockRequirement: "case_crypto",
  description:
    "У базі даних Київської міської клінічної лікарні №7 зник медичний архів 12,000 пацієнтів. Дані з'явилися на darknet-форумі через 48 годин, де пропонувалися фарм-компаніям. Хтось продав здоров'я людей. Знайдіть зрадника серед 4-х підозрюваних.",
  briefing: `[CLASSIFIED — РІВЕНЬ ДОСТУПУ: TOP SECRET / NOFORN]

Дата інциденту: 12 листопада 2024, 02:14-02:31
Об'єкт: Київська лікарня №7, EMR-система
Постраждалих: ~12,000 пацієнтів

ХАРАКТЕР:
Витік 14 GB структурованих медичних даних:
— ПІБ, адреси, контакти
— Діагнози (включно з онко, ВІЛ, психіатрією)
— Лікувальні протоколи
— Страхові деталі

ПУБЛІКАЦІЯ:
Через 48 годин дані з'явилися на 2 darknet-форумах
з підписом seller "phantom_md".
Перші покупці: фарм-маркетинг агенції.

⚠ ВАЖЛИВО:
Це найскладніша справа. Багато слідів, багато
red herrings. Доказова база суперечлива. Переконайтесь
у висновку, перш ніж звинувачувати.

ХИБНЕ ЗВИНУВАЧЕННЯ → -500 очок та repaгуа detective rank.`,
  correctSuspectId: "mykola_pharm",
  suspects: [
    {
      id: "oksana_doctor",
      name: "Др. Оксана Григорівна",
      nickname: "Director",
      role: "Головний лікар",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-1-nWF6B3BtzhVMtp5W8ZBqi8.webp",
      motive:
        "Не отримує адекватного фінансування від МОЗ. Колеги-лікарі скаржилися на її жорсткі рішення щодо звільнень.",
      alibi:
        "Ніч провела вдома з онуком (5 років). Відеодзвінок з дочкою у Канаді 02:00-02:30 (часовий пояс синхронізовано).",
      accessLevel: "admin",
      lastActivity: "02:33",
      suspicionLevel: 53,
      bio: "58 років. У лікарні 22 роки. Має повний адмін-доступ. Сувора, але справедлива. Конфліктів не приховує — звільнила Андрія Коваленка за порушення в липні 2024 (за рішення суду — поновлений).",
      relatedEvidenceIds: ["director_video_call", "firing_lawsuit"],
    },
    {
      id: "andriy_admin",
      name: "Андрій Коваленко",
      nickname: "IT-Admin",
      role: "Системний адміністратор",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-2-FgKGaALEVysbt352a6zdtV.webp",
      motive:
        "Звільнений Оксаною за помилку в липні 2024. Поновлений судом у вересні. Затаїв образу. Має повний root-доступ до EMR.",
      alibi:
        "У ніч атаки був на чергуванні (підтвердило 3 свідки + бейдж). У логах CCTV — фізично присутній у server room.",
      accessLevel: "admin",
      lastActivity: "03:14",
      suspicionLevel: 88,
      bio: "36 років. У лікарні 8 років. Перший суспект — мав доступ, мав мотив, був на місці. Виглядає як перфектний кандидат. Але це може бути setup.",
      relatedEvidenceIds: ["admin_logs", "firing_lawsuit", "cctv_server_room"],
    },
    {
      id: "oksana_nurse",
      name: "Оксана Левченко",
      nickname: "Nurse",
      role: "Старша медсестра",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-3-JXB2A5nKGUaWYCmvPf4R2C.webp",
      motive:
        "Чоловік хворіє на онкологію — лікування дороге. Велика заборгованість. Доступ до EMR обмежений (тільки до пацієнтів свого відділення).",
      alibi:
        "Чергувала в реанімації. 5 свідків, відео CCTV, журнал процедур. Жодної можливості бути біля комп'ютера.",
      accessLevel: "limited",
      lastActivity: "06:00",
      suspicionLevel: 38,
      bio: "42 роки. Працює в лікарні 15 років. Тиха, відповідальна. Чоловік-онкохворий — фінансовий мотив значний, але технічні можливості обмежені.",
      relatedEvidenceIds: ["nurse_alibi", "husband_medical_bills"],
    },
    {
      id: "mykola_pharm",
      name: "Микола Дорош",
      nickname: "Pharm-Rep",
      role: "Представник фарм-компанії",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-4-JfBcekVkpfuDHP53c45ukn.webp",
      motive:
        "Працює на 3 фарм-компанії одночасно. Має закриту угоду з darknet-маркетинговою агенцією. Дані пацієнтів = пряма цінність для таргетованої реклами.",
      alibi:
        '"Був у відрядженні в Польщі". Готель оплачено карткою. Однак мобільна локація показує його в Києві. Бізнес-візит міг бути legend.',
      accessLevel: "guest",
      lastActivity: "02:31",
      suspicionLevel: 64,
      bio: '38 років. Зовнішній підрядник, не співробітник лікарні. Має тимчасові guest-картки доступу, які видаються на 1 день для презентацій. Колеги вважають його "дивним" — занадто цікавиться технічними деталями EMR-системи.',
      relatedEvidenceIds: [
        "pharm_phone_location",
        "darknet_listing",
        "guest_badge_log",
        "social_engineering_email",
      ],
    },
  ],
  evidence: [
    {
      id: "incident_brief_hosp",
      title: "Звіт служби кібербезпеки лікарні",
      category: "report",
      status: "open",
      shortDescription: "Технічні деталі витоку даних з EMR.",
      fullContent: `[ЗВІТ ІНЦИДЕНТУ КІБЕРБЕЗПЕКИ — KCH7-2024-014]

Дата: 12.11.2024 02:14-02:31 (17 хвилин)
Система: EMR-Core (Electronic Medical Records)
Обсяг: 14.3 GB експортовано
Постраждалих пацієнтів: ~12,000

МЕТОД ЕКСФІЛЬТРАЦІЇ:
- Використано вбудовану функцію /admin/export
- Автентифікована сесія: andriy.k (IT-Admin)
- АЛЕ активність миші/клавіатури нульова під час експорту
- Припущення: скриптоване/автоматизоване виконання

РОБОЧА СТАНЦІЯ:
PC #4 в кабінеті директорки (відкритий доступ вночі)

⚠ АНОМАЛІЯ:
Функція експорту вимагає 2FA (badge tap).
Зафіксовано два використання бейджа: andriy.k (00:47) та
M.DOROSH (00:51) — гостьовий бейдж, закінчився о 18:00.

ЗАЧЕКАЙТЕ — гостьовий бейдж використано через 6.5 годин після закінчення терміну.
Доступ до мережі дійсний лише 5 хвилин; експорт даних тривав 17 хв.

ВИСНОВОК: Кілька зловмисників? Або один видає себе за інших?`,
      isKeyEvidence: false,
    },
    {
      id: "admin_logs",
      title: "Логи входу адміністратора",
      category: "log",
      status: "locked",
      shortDescription: "EMR-логи активності Андрія Коваленка.",
      fullContent: `[EMR ACCESS LOG — andriy.k]
12.11.2024

[00:47] BADGE TAP — IT corridor → Server Room
[00:48] LOGIN до адмін консолі (2FA пройдено)
[00:49] SESSION розпочато
[00:50] HEARTBEAT (в очікуванні)
[02:14] EXPORT ініційовано: /admin/export?type=patients
[02:14] (нульове введення клавіатури — але сесія активна)
[02:31] EXPORT завершено (14.3 GB)
[02:31] LOGOUT

CCTV Server Room:
[00:47-03:14] Андрій присутній на робочому місці.
              Працює з server hardware (HSM upgrade).
              Не біля workstation коли стався експорт.

⚠ Логи говорять, що його сесія експортувала дані.
⚠ Камера підтверджує, що він не був біля робочої станції.
⚠ Це неможливо — ХІБА ЩО сесія була перехоплена.`,
      isKeyEvidence: true,
      pointsToSuspectId: "mykola_pharm",
      unlockCommand: "scan emr",
      unlockHint: "scan emr — просканувати лог EMR",
    },
    {
      id: "cctv_server_room",
      title: "CCTV сервер-кімнати",
      category: "image",
      status: "open",
      shortDescription: "Відео-журнал сервер-кімнати.",
      fullContent: `[CCTV LOG — Server Room]
12.11.2024 00:00 - 06:00

00:47 — Андрій Коваленко входить (badge tap)
00:48 — Сідає за консольний термінал (HSM upgrade)
01:00 — Працює зі стійкою #3 (rack maintenance)
01:30 — Перевіряє кабелі
02:00 — Стоїть біля стійки #5
02:14 — Точно не біля workstation #4
02:31 — Все ще зі стійками
03:14 — Виходить (нормальна зміна закінчена)

КРИТИЧНО:
Workstation #4 знаходиться у кабінеті директорки.
Це НЕ server room. Андрій фізично не міг
"натиснути export" о 02:14 — він був в іншій кімнаті.

ВИСНОВОК:
Хтось використав його сесію віддалено
АБО використав інше джерело автентифікації.`,
      isKeyEvidence: false,
    },
    {
      id: "firing_lawsuit",
      title: "Судова справа звільнення",
      category: "file",
      status: "open",
      shortDescription: "Судова справа Коваленко проти лікарні.",
      fullContent: `[СУДОВА СПРАВА — №2-1234/24]

Позивач: Коваленко Андрій Сергійович
Відповідач: КМКЛ №7
Статус: ВИРІШЕНО на користь позивача (вересень 2024)

Передісторія:
- Коваленко звільнений у липні 2024 за "критичну помилку"
- Виправдався у суді: помилка не його провина
- Поновлений з компенсацією 87,000 грн
- Подальші відносини з директоркою — зіпсовані

Примітка від психолога (вимога HR після спору):
"Андрій здавався напрочуд спокійним після поновлення.
'Я не з тих, хто шукає помсти. Я просто хочу
виконувати свою роботу належним чином.'"

Показання свідків (колеги):
"Андрій ніколи не говорив про помсту. Працює нормально."

ОЦІНКА:
Сильний потенційний мотив, але немає поведінкових доказів
планування помсти.`,
      isKeyEvidence: false,
      redHerring: true,
    },
    {
      id: "director_video_call",
      title: "Відеодзвінок директорки",
      category: "log",
      status: "open",
      shortDescription: "Технічний лог Skype-сесії директорки.",
      fullContent: `[SKYPE LOG — oksana.h]
12.11.2024

[01:54] Дзвінок розпочато
        Абонент: oksana.h (Київ)
        Отримувач: olena.h (Торонто, Канада)
        Примітка: Прямі родичі — дочка

[01:54-02:33] БЕЗПЕРЕРВНИЙ ДЗВІНОК
        Камера: УВІМКНЕНО
        Мікрофон: УВІМКНЕНО
        Говорила 47% часу

[02:33] Дзвінок завершено
        Тривалість: 39 хвилин

ROUTER LOG:
[01:54] Skype трафік з домашнього WiFi Оксани
[02:33] Skype сесія завершується
        Іншого значного трафіку немає
        Немає VPN, немає remote desktop

ВЕРДИКТ: Сильне технічне алібі. Камера працювала,
відеоконтент перевірено вручну — фон її домашнього
кабінету в Києві. Дочка підтверджує особу.`,
      isKeyEvidence: false,
    },
    {
      id: "pharm_phone_location",
      title: "Локація телефону Миколи",
      category: "log",
      status: "locked",
      shortDescription: "Carrier-логи мобільного оператора.",
      fullContent: `[KIEVSTAR CARRIER LOG — +380 67 XXX XXXX]
Суб'єкт: Микола Дорош

Заявлена локація: Варшава, Польща (12.11.2024)

ФАКТИЧНІ ПІНГИ СТІЛЬНИКОВИХ ВИШОК:
[11.11 18:00] Вишка: Lviv-Central (LV-001)
[11.11 21:30] Вишка: Kyiv-Vyshneve (KV-447)
[11.11 23:00] Вишка: Kyiv-Borshchahivka (KV-203)
[12.11 02:00] Вишка: Kyiv-Solomyanka (KV-156) ⚠
                     ← 1.2 км від Лікарні №7
[12.11 02:35] Вишка: Kyiv-Solomyanka (KV-156)
[12.11 03:30] Вишка: Kyiv-Borshchahivka (KV-203)
[12.11 11:00] Вишка: Kyiv-Boryspil-Airport (BO-005)
[12.11 14:00] Вишка: Warsaw-Central (PL-001)

⚠ Суб'єкт перебував у КИЄВІ під час витоку,
а не у Варшаві, як стверджував!

Він полетів до Варшави НАСТУПНОГО ДНЯ об 11:00.
Алібі "відрядження" було сфабриковане.`,
      isKeyEvidence: true,
      pointsToSuspectId: "mykola_pharm",
      unlockCommand: "trace phone mykola",
      unlockHint: "trace phone mykola",
    },
    {
      id: "guest_badge_log",
      title: "Лог гостьової картки",
      category: "log",
      status: "locked",
      shortDescription: "Журнал використання гостьових бейджів.",
      fullContent: `[GUEST BADGE LOG — Hospital #7]

Бейдж: GST-2024-1109
Видано: Микола Дорош (Pharm-rep, MediPlus Inc)
Час видачі: 11.11.2024 14:00
Дійсний до: 11.11.2024 18:00

ФАКТИЧНІ ВИКОРИСТАННЯ (TAPS):
[11.11 14:23] Вхід у вестибюль ✓
[11.11 14:31] 3-й поверх (презентації) ✓
[11.11 17:45] Вихід з вестибюлю ✓
[11.11 17:48] Подано звіт про "втрату" бейджа

[12.11 00:51] ⚠ Використання в IT коридорі!
              Бейдж нібито втрачено.
              Мав бути деактивований.
              СИСТЕМНА ПОМИЛКА: не деактивовано протягом 3 днів.

[12.11 00:52] Використання в коридорі кабінету директорки
[12.11 00:53] Двері PC#4 — відкрито вручну (ключем, не бейджем)

CCTV показує особу:
- В медичній масці (обличчя приховане)
- Зріст ~180см (збігається з Миколою)
- Має сумку для ноутбука
- Заходить в кабінет директорки (знав, що двері не замкнені)`,
      isKeyEvidence: true,
      pointsToSuspectId: "mykola_pharm",
      unlockCommand: "check badge gst-2024-1109",
      unlockHint: "check badge <id> — перевірити гостьовий бейдж",
    },
    {
      id: "social_engineering_email",
      title: "Фішинг-листи Миколи",
      category: "message",
      status: "encrypted",
      shortDescription: "Архів листів Миколи на корпоративну пошту.",
      fullContent: `[ARCHIVED EMAILS — DECRYPTED]

10.11.2024 — до andriy.k@kch7.gov.ua
"Привіт! Я Микола з MediPlus. Готуємо презентацію
нової системи на завтра. Ти не міг би скинути
мені скріншот робочого столу адмінки EMR?
Хочу під ваш UI зробити мокап."

[Відповідь: "Не можу, не за політикою"]

11.11.2024 14:30 — до alina@kch7.gov.ua (асистентка)
"Можеш дати мені тимчасовий пароль до PC#4 в кабінеті
головного лікаря? Хочу залишити там презентацію після
зустрічі. Не хочу турбувати Оксану Григорівну."

[Відповідь: "Окей. Пароль: HOSPITAL2024!"]

11.11.2024 18:00 — до самого себе
"Отримав. Сьогодні вночі."

⚠ Микола спершу спробував social engineering на адміна.
⚠ Не вийшло — переключився на менш свідомого співробітника.
⚠ Отримав пароль workstation директорки.

Це підтверджує: атаку планував він, не Андрій.
Андрій лише має active session, бо змінював HSM.`,
      isKeyEvidence: true,
      pointsToSuspectId: "mykola_pharm",
      unlockCommand: "decrypt emails PHANTOM",
      unlockHint: "decrypt emails <password>. Як він підписувався в darknet?",
    },
    {
      id: "darknet_listing",
      title: "Darknet оголошення",
      category: "message",
      status: "locked",
      shortDescription: "Tor-форум: продаж медичних даних.",
      fullContent: `[TOR FORUM SCRAPE — DataMarket.onion]

Оголошення #4729
Заголовок: "12K записів українських пацієнтів — повні PII + діагнози"
Опубліковано: 14.11.2024 06:00 UTC
Продавець: phantom_md
Ціна: 8 BTC ($340,000)
Статус: ПРОДАНО (15.11.2024)

Опис:
"Свіжі дані з Київської міської клінічної лікарні №7.
Повна демографія, адреси, номери телефонів,
діагнози, включаючи онкологію, ВІЛ, психіатрію.
Ідеально для фарм-маркетингу або страхового шахрайства."

Відбиток PGP продавця:
0x4F2D...A3B7

ПЕРЕХРЕСНА ПЕРЕВІРКА:
Такий самий PGP-ключ знайдено у біо
LinkedIn-профілю Миколи Дороша (архів 2022 року):
"Crypto enthusiast 0x4F2DA3B7"

⚠ ПРЯМИЙ ЗБІГ: phantom_md = Микола Дорош.

Покупець: pharma_marketing_eu
Кошти відмиті через: BTC mixer chain.`,
      isKeyEvidence: true,
      pointsToSuspectId: "mykola_pharm",
      unlockCommand: "crawl darknet",
      unlockHint: "crawl darknet — пошук продавця",
    },
    {
      id: "nurse_alibi",
      title: "Алібі медсестри",
      category: "log",
      status: "open",
      shortDescription: "Журнал процедур реанімації.",
      fullContent: `[ICU PROCEDURE LOG — 12.11.2024]

Чергова медсестра: Оксана Левченко

[01:30] Госпіталізація пацієнта (вогнепальне поранення)
[01:45] Введення крапельниці (зафіксовано 2 лікарями)
[02:00-02:45] Активна реанімація (повна команда)
[02:45] Пацієнта стабілізовано
[03:30] Оновлення документації

CCTV ICU:
Постійна присутність підтверджена протягом усієї зміни.

СВІДКИ:
- Dr. Petro (хірург): "Оксана була зі мною весь час."
- Dr. Yulia (анестезіолог): "Вона не виходила з палати."
- Студентка-медик Анна: "Я бачила її кожні 5 хвилин."

ВЕРДИКТ: Нечасто буває, але alibi бронебійне.
Вона фізично не могла бути біля комп'ютера.`,
      isKeyEvidence: false,
    },
    {
      id: "husband_medical_bills",
      title: "Медичні рахунки чоловіка",
      category: "file",
      status: "open",
      shortDescription: "Рахунки за лікування Романа Левченка.",
      fullContent: `[МЕДИЧНІ ВИТРАТИ — Роман Левченко]
Діагноз: Рак легенів 3 стадії (Травень 2024)

Витрати на лікування (останні 6 місяців):
- Хіміотерапія: $4,200
- Таргетна терапія: $8,500
- Госпіталізація: $2,300
- Ліки (з власної кишені): $3,400
Загалом: $18,400

Страхове покриття: $7,200
З власної кишені: $11,200

ПОТОЧНІ БОРГИ:
- Банківська позика: $5,500
- Позика в сім'ї (сестра): $3,000
- Кредитна картка: $2,700

Це значний мотив — але Оксана
не має технічного доступу для масового експорту EMR.`,
      isKeyEvidence: false,
    },
  ],
  messages: [
    {
      id: "h1m1",
      sender: "Микола",
      receiver: "Андрій",
      timestamp: "10.11.2024",
      content: "Готуємо презентацію. Не міг би скинути скріншот EMR-адмінки?",
      relatedEvidenceId: "social_engineering_email",
      suspicious: true,
    },
    {
      id: "h1m2",
      sender: "Микола",
      receiver: "Аліна (асистент)",
      timestamp: "11.11.2024 14:30",
      content:
        "Можеш дати мені тимчасовий пароль до PC#4 в кабінеті головного лікаря?",
      relatedEvidenceId: "social_engineering_email",
      suspicious: true,
    },
    {
      id: "h1m3",
      sender: "Аліна (асистент)",
      receiver: "Микола",
      timestamp: "11.11.2024 14:35",
      content: "Окей. Пароль: HOSPITAL2024!",
      relatedEvidenceId: "social_engineering_email",
    },
    {
      id: "h1m4",
      sender: "Микола",
      receiver: "self",
      timestamp: "11.11.2024 18:00",
      content: "Got it. Tonight is the night.",
      relatedEvidenceId: "social_engineering_email",
      suspicious: true,
    },
    {
      id: "h1m5",
      sender: "phantom_md",
      receiver: "darknet",
      timestamp: "14.11.2024",
      content: "12K Ukrainian patient records — full PII + diagnoses. 8 BTC.",
      relatedEvidenceId: "darknet_listing",
      suspicious: true,
    },
  ],
  terminalCommands: [
    {
      command: "help",
      description: "Показати команди",
      type: "info",
      response: `╔══════════════════════════════════════════════════╗
║   HOSPITAL #7 FORENSICS TERMINAL                ║
╠══════════════════════════════════════════════════╣
║ help                       — Довідка            ║
║ scan emr                   — Сканувати EMR-логи ║
║ trace phone <name>         — Trace phone        ║
║ check badge <id>           — Перевірити бейдж   ║
║ decrypt emails <password>  — Розшифрувати пошту ║
║ crawl darknet              — Пошук на даркнет   ║
║ status                     — Статус справи      ║
║ ls /evidence               — Список доказів     ║
║ clear                      — Очистити           ║
╚══════════════════════════════════════════════════╝
HARD CASE: уважно читайте докази!`,
    },
    {
      command: "scan emr",
      description: "Сканувати EMR-логи",
      type: "unlock_evidence",
      response: `⟩ Connecting to EMR audit DB...
⟩ Querying access logs for 12.11.2024 02:00-03:00...
⟩ ████████████████████ 100%
⟩
⟩ Виявлено аномалію:
⟩ Session: andriy.k (admin)
⟩ Export: 14.3 GB о 02:14
⟩ Активність клавіатури: НУЛЬОВА під час експорту
⟩ Активність миші: НУЛЬОВА під час експорту
⟩
⟩ ⚠ Перехресна перевірка CCTV: andriy.k фізично в
⟩    server room, а не біля workstation #4.
⟩
⟩ Виявлено суперечність. Сесія могла бути
⟩ перехоплена або керувалася віддалено.
⟩
⟩ ✓ Доказ "Логи входу адміністратора" розблоковано.`,
      unlockEvidenceId: "admin_logs",
    },
    {
      command: "trace phone mykola",
      description: "Відстежити телефон Миколи",
      type: "unlock_evidence",
      response: `⟩ Querying Kievstar carrier API...
⟩ Суб'єкт: Микола Дорош
⟩ Телефон: +380 67 XXX XXXX
⟩
⟩ Історія стільникових вишок (12.11.2024):
⟩ [00:00 - 06:00] Kyiv-Solomyanka, KV-156
⟩                  ← 1.2 км від Лікарні №7
⟩
⟩ ⚠ Суб'єкт стверджував, що був у Варшаві в цей час.
⟩ ⚠ Мобільний телефон показує: КИЇВ.
⟩
⟩ Він полетів до Варшави наступного дня об 11:00.
⟩ Алібі СФАЛЬСИФІКОВАНО.
⟩
⟩ ✓ Доказ "Локація телефону Миколи" розблоковано.`,
      unlockEvidenceId: "pharm_phone_location",
    },
    {
      command: "check badge gst-2024-1109",
      description: "Перевірити гостьовий бейдж",
      type: "unlock_evidence",
      response: `⟩ Querying badge log...
⟩ Бейдж: GST-2024-1109
⟩ Видано: Микола Дорош
⟩ Статус: ЗАЯВЛЕНО ЯК ВТРАЧЕНИЙ 11.11 17:48
⟩         (АЛЕ не деактивовано через системну помилку)
⟩
⟩ ⚠ Використання в IT коридорі: 12.11 00:51
⟩ ⚠ Використання в кабінеті директорки: 12.11 00:52
⟩
⟩ "Втрачений" бейдж був використаний для входу в зони обмеженого доступу.
⟩ Особа збігається зі зростом/статурою Миколи (CCTV).
⟩
⟩ ✓ Доказ "Лог гостьової картки" розблоковано.`,
      unlockEvidenceId: "guest_badge_log",
    },
    {
      command: "decrypt emails PHANTOM",
      description: "Розшифрувати email-архів",
      type: "decrypt",
      response: `⟩ Password: PHANTOM
⟩ Initializing AES-256-GCM decryption...
⟩ ████████████████████ 100%
⟩ ✓ 3 листи розшифровано.
⟩
⟩ Відновлено: Спроби social engineering Миколи:
⟩ — до andriy.k: прохання скріншоту EMR (НЕВДАЛО)
⟩ — до alina (асистентки): запит пароля PC#4 (УСПІШНО!)
⟩ — до самого себе: "Tonight is the night."
⟩
⟩ Патерн: pharma rep використовує social engineering
⟩ для обходу технічної безпеки.
⟩
⟩ ✓ Доказ "Фішинг-листи Миколи" розблоковано.`,
      unlockEvidenceId: "social_engineering_email",
    },
    {
      command: "crawl darknet",
      description: "Пошук на даркнет-форумах",
      type: "unlock_evidence",
      response: `⟩ Connecting to Tor proxy...
⟩ Crawling DataMarket.onion...
⟩ ████████████████████ 100%
⟩
⟩ Знайдено оголошення #4729:
⟩ "12K Ukrainian patient records..."
⟩ Продавець: phantom_md
⟩ PGP: 0x4F2DA3B7
⟩
⟩ ⚠ Перехресна перевірка з публічним LinkedIn (архів 2022):
⟩    "Mykola Dorosh — Crypto enthusiast 0x4F2DA3B7"
⟩
⟩ ПРЯМИЙ ЗБІГ ОСОБИ.
⟩ phantom_md = Микола Дорош.
⟩
⟩ ✓ Доказ "Darknet оголошення" розблоковано.`,
      unlockEvidenceId: "darknet_listing",
    },
    {
      command: "status",
      description: "Статус справи",
      type: "status",
      response: "",
    },
    {
      command: "ls /evidence",
      description: "Список доказів",
      type: "status",
      response: "",
    },
    {
      command: "whoami",
      description: "Інформація",
      type: "info",
      response: `⟩ User: detective@cyber-unit
⟩ Role: Senior Cyber Detective
⟩ Active case: HIPPOCRATES (Hospital #7)
⟩ Difficulty: HARD
⟩ Status: INVESTIGATING`,
    },
    {
      command: "clear",
      description: "Очистити",
      type: "clear",
      response: "",
    },
  ],
  hints: [
    {
      id: "hh1",
      text: "Найочевидніший підозрюваний (admin Андрій) виглядає винним. Але уважно подивіться CCTV — де саме він був?",
      cost: 200,
    },
    {
      id: "hh2",
      text: "Подивіться, хто був у Києві всупереч заявленому алібі. Локація телефону не бреше.",
      cost: 250,
    },
    {
      id: "hh3",
      text: "Хто отримав пароль workstation #4 через soсial engineering? Лист до асистента — ключ.",
      cost: 300,
    },
    {
      id: "hh4",
      text: "Псевдонім phantom_md на darknet. Шукайте PGP-key у відкритих профілях підозрюваних.",
      cost: 350,
    },
  ],
};
