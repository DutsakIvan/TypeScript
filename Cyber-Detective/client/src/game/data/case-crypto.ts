import type { InvestigationCase } from "../types";

export const caseCrypto: InvestigationCase = {
  id: "case_crypto",
  title: "Справа Cryptex: вкрадені мільйони",
  subtitle: "Внутрішній заговір на криптобіржі",
  codename: "OPERATION GOLDFINCH",
  difficulty: "medium",
  basePoints: 1500,
  unlockRequirement: "case_404",
  description:
    "У ніч з 11 на 12 листопада з гарячих гаманців української криптобіржі Cryptex Solutions зникло $4.7 млн в Ethereum та Bitcoin. Транзакції здійснювались зі звичайних робочих IP-адрес, а 2FA не зупинила атаку. Хтось зсередини знав protocol. Знайдіть кротa.",
  briefing: `[CLASSIFIED — РІВЕНЬ ДОСТУПУ: TOP SECRET]

Дата інциденту: 11-12 листопада 2024, 02:14-04:33
Об'єкт: Cryptex Solutions — гарячі гаманці
Збитки: $4,723,000 (заходи: ETH 1,247 + BTC 67.3)

ОБСТАВИНИ:
- Транзакції здійснені вночі, поза робочим часом
- 2FA пройдено успішно (як?!)
- IP — внутрішня корпоративна мережа
- Кошти перенаправлені через 17 mixer-вузлів

ПІДОЗРЮВАНИХ: 5
КЛЮЧОВИХ ДОКАЗІВ: 6
СКЛАДНІСТЬ: ПІДВИЩЕНА

Ваше завдання — знайти інсайдера.
Шукайте суперечності між алібі та логами.

⚠ Обережно з red herrings — деякі докази навмисне вводять в оману.`,
  correctSuspectId: "serhiy_burnt",
  suspects: [
    {
      id: "andriy_ceo",
      name: "Андрій Мельник",
      nickname: "CEO",
      role: "Генеральний директор",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-1-MSLiFpPm3LaGGo3EayAczo.webp",
      motive:
        'Біржа на межі банкрутства. Інсайдерська інформація — клієнтів масово відписують. Можлива схема "exit scam".',
      alibi:
        "Був на конференції в Дубаї (підтверджено бортпроводницею Emirates). Telegram-локація: UAE. Логічно — фізично не міг.",
      accessLevel: "admin",
      lastActivity: "23:14 (Dubai)",
      suspicionLevel: 65,
      bio: "43 роки. Засновник Cryptex у 2021. Раніше — інвестбанкір у Лондоні. Останні 6 місяців компанія втрачає клієнтів.",
      relatedEvidenceIds: ["ceo_alibi", "company_finances"],
    },
    {
      id: "kateryna_trader",
      name: "Катерина Іваненко",
      nickname: "Trader",
      role: "Старший трейдер",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-2-hp5NRSyMPgp3DHNwbzgfbp.webp",
      motive:
        "Має значні особисті борги (азартні ігри). Пропустили підвищення на користь конкурента в липні 2024.",
      alibi:
        "Стверджує, що спала вдома. Однак її смартфон під час інциденту був на WiFi офісу (логи не брешуть).",
      accessLevel: "editor",
      lastActivity: "02:47",
      suspicionLevel: 78,
      bio: "29 років. У Cryptex 3 роки. Має доступ до trading desk, але не до hot wallets безпосередньо.",
      relatedEvidenceIds: ["trader_phone_log", "gambling_debts"],
    },
    {
      id: "serhiy_burnt",
      name: "Сергій Левченко",
      nickname: "Burnt",
      role: "Senior Backend Developer",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-3-YLejiiWjfiZyCbxAqdRVXD.webp",
      motive:
        "Burnout. Працював 80 годин/тиждень рік без премії. Йому відомий весь архітектурний стек, включно з обхідними шляхами 2FA. Останній тиждень очолював міграцію HSM-ключів.",
      alibi:
        "Стверджує, що о 02:14 був вдома. Але VPN-логи показують його активність із корпоративної мережі через wireguard. Crypto wallet створений 9 листопада з його корпоративним email-pattern.",
      accessLevel: "admin",
      lastActivity: "04:33",
      suspicionLevel: 91,
      bio: '34 роки. У Cryptex 4 роки. Має повний доступ до production. Останні місяці скаржився на стрес, працював до 4 ранку. Збирався звільнятися "коли буде можливість".',
      relatedEvidenceIds: ["vpn_logs", "wallet_creation", "overtime_logs"],
    },
    {
      id: "halyna_intern",
      name: "Галина Козлова",
      nickname: "Intern",
      role: "Стажер кібербезпеки",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-4-n6njohUrYNX8Lm873z2Xvi.webp",
      motive:
        "Низька зарплата. Доступ до моніторингу — могла відключити сповіщення.",
      alibi:
        "У ніч атаки спала після пари. Підтверджено співмешканкою. У логах входу на VPN — порожньо.",
      accessLevel: "limited",
      lastActivity: "18:22 (попередній день)",
      suspicionLevel: 22,
      bio: "22 роки. Стажер, 3 місяці. Дуже відповідальна, доволі недосвідчена. Технічно не змогла б провести таку складну атаку самостійно.",
      relatedEvidenceIds: ["intern_logs"],
    },
    {
      id: "volodymyr_chief",
      name: "Володимир Бойко",
      nickname: "Chief",
      role: "Head of Security",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-5-X2oJ3FU6ZsNG8qzgMqkhDV.webp",
      motive:
        "Колишній СБУ. Знає всі обхідні шляхи безпеки. Власник конкуруючої консалтингової компанії.",
      alibi:
        "На дзвінку з західним партнером (Zoom-логи підтверджують). Триває 2:30. Камера ON весь час.",
      accessLevel: "admin",
      lastActivity: "04:00",
      suspicionLevel: 47,
      bio: "54 роки. У Cryptex 2 роки. Раніше — підполковник СБУ. Серйозний професіонал, але має конфлікт інтересів через свій консалтинг.",
      relatedEvidenceIds: ["security_chief_zoom", "consulting_business"],
    },
  ],
  evidence: [
    {
      id: "incident_summary_crypto",
      title: "Зведений звіт інциденту",
      category: "report",
      status: "open",
      shortDescription: "Загальний огляд викрадення коштів.",
      fullContent: `[ЗВІТ ПРО ІНЦИДЕНТ — CRYPTEX-001]
Дата: 11-12.11.2024
Загальні збитки: $4,723,000

ХРОНОЛОГІЯ:
02:14 — Hot wallet #3 (ETH) спустошено: 1,247 ETH → 0x7f...
02:47 — Hot wallet #1 (BTC) спустошено: 67.3 BTC → bc1q...
03:12 — Hot wallet #2 (ETH) спустошено: приховано виведено
04:33 — Зафіксована остання транзакція

МЕТОД:
- 2FA пройдено (транзакції підписані HSM)
- Використана внутрішня IP-адреса (діапазон 10.0.4.x)
- Усі перекази ініційовано через /api/wallet/withdraw
- Кошти відмиті через 17 міксерів

АНОМАЛІЯ:
Обхід multi-sig: використано 2 з 3 ключів.
Обидва ключі належали до однієї ролі admin.`,
      isKeyEvidence: false,
    },
    {
      id: "vpn_logs",
      title: "VPN-логи Сергія",
      category: "log",
      status: "locked",
      shortDescription: "WireGuard-логи активності за ніч атаки.",
      fullContent: `[WIREGUARD VPN LOG — serhiy.l]
12.11.2024

[01:47] HANDSHAKE accepted
        peer: serhiy.l@cryptex
        endpoint: 87.245.x.x:51820
        allowed_ips: 10.0.4.0/24

[01:48-04:35] ACTIVE SESSION
        rx_bytes: 4,231,892 (завантажені дані!)
        tx_bytes: 89,234 (надіслані команди)

[04:35] DISCONNECT
        session_duration: 2h 48m

[04:36] LATER ATTEMPT (failed)
        Примітка: Спроба очистити логи (відхилено політикою audit retention)

ВИСНОВОК:
Сергій активно сидів у корпоративній мережі під час
атаки. Стверджує, що "був вдома і спав".
Це пряме спростування його алібі.`,
      isKeyEvidence: true,
      pointsToSuspectId: "serhiy_burnt",
      unlockCommand: "scan vpn",
      unlockHint: "Просканувати VPN-логи: scan vpn",
    },
    {
      id: "wallet_creation",
      title: "Створення зловмисного гаманця",
      category: "transaction",
      status: "locked",
      shortDescription: "Аналіз гаманця-приймача викрадених коштів.",
      fullContent: `[BLOCKCHAIN FORENSICS]

Гаманець-отримувач: 0x7f3a2b1c8d4e9f7a2b6c5d8e1f3a9b7c4d2e0a8f
Створено: 2024-11-09 18:23:17 UTC

ВІДБИТОК СТВОРЕННЯ:
- Початковий gas поповнено з 0x9c... (виведення з KuCoin)
- Слід KuCoin KYC веде до email: s.levchenko@protonmail
  ^^ збігається з патерном serhiy.levchenko@cryptex.io
- IP при створенні: 87.245.x.x (Kyiv residential)
- Цей самий IP використовувався serhiy.l для особистих логінів (підтверджено)

⚠ ПРЯМИЙ ЗБІГ:
Protonmail творця гаманця використовує той самий патерн
іменування, що й корпоративний email Сергія.
Патерн: s.[surname]@protonmail.

ВИСНОВОК:
Гаманець-приймач створений за 2 дні до атаки
із IP та email-патерну Сергія Левченка.`,
      isKeyEvidence: true,
      pointsToSuspectId: "serhiy_burnt",
      unlockCommand: "trace wallet 0x7f3a",
      unlockHint: "Trace гаманець: trace wallet 0x7f3a",
    },
    {
      id: "overtime_logs",
      title: "Логи понаднормового часу",
      category: "log",
      status: "open",
      shortDescription: "HR-system показує переробки Сергія.",
      fullContent: `[HR ATTENDANCE LOG — serhiy.l]

ОСТАННІ 30 ДНІВ:
Середньо год/тижд: 78.4
Понаднормові години: 162
Схвалено менеджером: 24h
Не схвалено: 138h ⚠

ПРИМІТКИ (коментарі HR):
- 03.11: "Говорили з Сергієм про burnout, рекомендували відпустку."
- 07.11: "Сергій відмовився від відпустки. Стверджує, що 'забагато critical work'."
- 09.11: "Залогінено 14 годин поспіль. Міграція HSM."
- 10.11: "Надіслав гнівний email CTO: 'Обіцяний бонус не виплачується 4 квартали.'"

ЦИТАТИ (slack):
"Якщо нічого не зміниться, я піду — але вони мене ще запам'ятають."
                                              — 11.11.2024 23:44`,
      isKeyEvidence: false,
    },
    {
      id: "ceo_alibi",
      title: "Алібі CEO — Дубай",
      category: "log",
      status: "open",
      shortDescription: "Підтвердження локації Андрія в Дубаї.",
      fullContent: `[ПЕРЕВІРКА АЛІБІ — andriy.m]

Рейс: EK176 KBP→DXB (10.11 22:55→05:35)
Посадка: підтверджено, біометричний скан ✓
Готель: Atlantis The Palm (10-13.11)
        Використання картки: 11.11 14:23, 22:09, 12.11 09:15 ✓
Конференція: WEB3 Summit Dubai
             Бейдж спікера відскановано: 11.11 16:00, 12.11 10:30 ✓

Локація Telegram:
[10.11 23:14] Координати: 25.115° N, 55.137° E (Дубай)
[12.11 04:00] Координати: 25.115° N, 55.137° E (Дубай)

ВЕРДИКТ: Алібі підтверджено. Фізично неможливо,
щоб він ініціював транзакції з Дубая, використовуючи внутрішній IP.

⚠ ПРИМІТКА: Міг наказати комусь іншому це зробити.`,
      isKeyEvidence: false,
    },
    {
      id: "company_finances",
      title: "Фінансовий звіт Cryptex",
      category: "file",
      status: "open",
      shortDescription: "Внутрішній фінансовий звіт.",
      fullContent: `[INTERNAL Q3 2024]

Дохід: $1.2M (-43% YoY)
Активні користувачі: 12,400 (-31% YoY)
Відтік клієнтів (churn): 8.7% на місяць

КРИТИЧНІ ПРИМІТКИ:
- Фінансування Series B призупинено
- Інвестори вимагають зростання доходу
- Залишилось 6 місяців runway
- CEO надіслав повідомлення раді директорів: "Нам потрібне диво."

ПРИМІТКА ВІД CFO:
"Маємо тривожні ознаки. Якщо щось трапиться з гарячими
гаманцями, ми зможемо звинуватити insider та отримати
страховку на $5M (Lloyd's coverage)."`,
      isKeyEvidence: false,
      redHerring: true,
    },
    {
      id: "trader_phone_log",
      title: "Логи телефону трейдерки",
      category: "log",
      status: "open",
      shortDescription: "Smartphone Катерини показує дивну активність.",
      fullContent: `[MDM PHONE LOG — kateryna.i]

Мережеві підключення:
[12.11 02:00] WiFi: Cryptex_Office_5GHz
[12.11 02:47] WiFi: Cryptex_Office_5GHz (все ще там!)
[12.11 03:30] WiFi: Cryptex_Office_5GHz
[12.11 06:14] WiFi: home network

⚠ Телефон знаходився в офісі під час крадіжки.
Але вона стверджує, що спала вдома.

ОФІСНИЙ БЕЙДЖ:
Жодних відміток бейджа між 22:00 (11.11) та 09:00 (12.11).

ПОЯСНЕННЯ:
Телефон міг бути випадково залишений в офісі минулого 
вечора. WiFi підключається автоматично.
Саме по собі це не доводить присутність.`,
      isKeyEvidence: false,
      redHerring: true,
    },
    {
      id: "gambling_debts",
      title: "Гральні борги Катерини",
      category: "file",
      status: "locked",
      shortDescription: "Записи з онлайн-казино та боргових агентств.",
      fullContent: `[BACKGROUND CHECK — kateryna.i]

Акаунт в онлайн-казино: PokerStars
- Загальні депозити 2024: $34,500
- Загальні виведення: $12,800
- Чистий збиток: $21,700

Непогашені борги:
- "Швидко-гроші" кредит: $8,200
- Позики в ломбарді: $4,500
- Позика у друга (Telegram чат): $3,000
Загалом: ~$15,700

Повідомлення другу за останні 30 днів:
"Я по вуха в боргах. Якщо знайду пару тисяч,
розрахуюсь хоча б з частиною."

⚠ Сильний фінансовий мотив.
Але технічна можливість обмежена її роллю.
Trader access не дає прямого доступу до wallets.`,
      isKeyEvidence: false,
      redHerring: true,
      unlockCommand: "background check kateryna",
      unlockHint: "background check kateryna",
    },
    {
      id: "security_chief_zoom",
      title: "Zoom-сесія Володимира",
      category: "log",
      status: "open",
      shortDescription: "Лог Zoom-дзвінка Володимира.",
      fullContent: `[ZOOM SESSION LOG — vboiko@cryptex]

Дата: 12.11.2024 02:00 - 04:30
Учасники: Volodymyr Boiko, Marcus Schmidt (Берлінський партнер)
Камера: УВІМКНЕНО весь час
Аудіо: УВІМКНЕНО весь час
Screen share: фінансові звіти (45% часу)
Активність: говорив 67% часу

ВЕРДИКТ: Сильне алібі.
Він був на дзвінку під час атаки. Камера показує,
що він сидів за робочим столом у домашньому кабінеті,
не взаємодіючи з іншими пристроями.

ПРИМІТКА: На його особистому ноутбуці була зафіксована активність,
але це нормально для screen-share + відеодзвінка.`,
      isKeyEvidence: false,
    },
    {
      id: "consulting_business",
      title: "Конкуруючий бізнес Володимира",
      category: "file",
      status: "open",
      shortDescription: "Реєстраційні документи його консалтингу.",
      fullContent: `[РЕЄСТР — UA-Reg-DB]

Компанія: BoikoCyberSec LLC
Засновник: Volodymyr Boiko
Засновано: 2023-04-12
Працівників: 5
Клієнти: не розголошуються (але включають 2 конкурентів Cryptex)

КОНФЛІКТ ІНТЕРЕСІВ:
- Повідомлено раді директорів Cryptex ✓
- Очищено юридичним відділом ✓
- Підлягає угоді про неконкуренцію (non-compete): Так (обмежено)

Примітка: Це викликає підозри, але не доводить намір.
Консалтинговий бізнес не пов'язаний з операціями гаманців.`,
      isKeyEvidence: false,
    },
    {
      id: "intern_logs",
      title: "Логи стажера",
      category: "log",
      status: "open",
      shortDescription: "Активність Галини в системі.",
      fullContent: `[ACTIVITY LOG — halyna.k]

11.11.2024:
[18:22] Останній логін (перевірка роботи)
[18:45] Logout
12.11.2024:
НЕМАЄ АКТИВНОСТІ

Мобільна локація (Telegram):
[01:00] Дім (квартира на Лук'янівці)
[02:00 - 06:00] Та сама локація (спить)

ЗАЯВА СПІВМЕШКАНКИ:
"Галина повернулася додому близько 18:30. Дивилася TV.
Ми вечеряли о 19:30. Вона лягла спати близько 23:00.
Точно була вдома всю ніч — я б почула двері."`,
      isKeyEvidence: false,
    },
    {
      id: "final_chat_log",
      title: "Фінальний внутрішній чат",
      category: "message",
      status: "encrypted",
      shortDescription: "Slack-чат Сергія на закритому каналі.",
      fullContent: `[SLACK PRIVATE DM — serhiy.l → "self_notes" channel]
03.11.2024
"Я знаю, як вийти з multi-sig. HSM має
fallback що мало хто пам'ятає. Тестую."

07.11.2024
"Working: я можу підписати 2 з 3 з одного ключа,
якщо роль admin. Architecture flaw."

09.11.2024
"Створив hot wallet для тестів. Ні, для… просто на всяк."

10.11.2024
"4 роки. 80 годин/тиждень. Без премії. Окей."

11.11.2024 23:44
"Завтра вони мене запам'ятають."

ВИСНОВОК:
Сергій планував атаку щонайменше тиждень.
Знав архітектурний flaw і використав його.
Прямі докази мотиву та наміру.`,
      isKeyEvidence: true,
      pointsToSuspectId: "serhiy_burnt",
      unlockCommand: "decrypt slack BURNT-OUT",
      unlockHint: "decrypt slack <password>. Подивіться на нікнейм...",
    },
  ],
  messages: [
    {
      id: "m1",
      sender: "Сергій",
      receiver: "CTO",
      timestamp: "10.11.2024",
      content:
        "Знову не виплатили премію за квартал. Це вже 4-й квартал поспіль.",
      relatedEvidenceId: "overtime_logs",
      suspicious: true,
    },
    {
      id: "m2",
      sender: "Сергій",
      receiver: "self_notes",
      timestamp: "11.11.2024 23:44",
      content: "Завтра вони мене запам'ятають.",
      relatedEvidenceId: "final_chat_log",
      suspicious: true,
    },
    {
      id: "m3",
      sender: "Катерина",
      receiver: "друг",
      timestamp: "09.11.2024",
      content:
        "Я по вуха в боргах. Якщо знайду пару тисяч, розрахуюсь хоча б з частиною.",
      relatedEvidenceId: "gambling_debts",
    },
    {
      id: "m4",
      sender: "Андрій",
      receiver: "Borad",
      timestamp: "01.11.2024",
      content: "We need a Hail Mary. Cash situation is critical.",
      relatedEvidenceId: "company_finances",
    },
    {
      id: "m5",
      sender: "Володимир",
      receiver: "Marcus",
      timestamp: "12.11.2024 02:00",
      content: "Joining now, Marcus. Let me share the report.",
      relatedEvidenceId: "security_chief_zoom",
    },
  ],
  terminalCommands: [
    {
      command: "help",
      description: "Показати команди",
      type: "info",
      response: `╔════════════════════════════════════════════════╗
║       CRYPTEX FORENSICS TERMINAL              ║
╠════════════════════════════════════════════════╣
║ help                  — Довідка               ║
║ scan vpn              — VPN-логи              ║
║ trace wallet <addr>   — Trace гаманець        ║
║ decrypt slack <pass>  — Розшифрувати Slack    ║
║ background check <name> — Перевірка особи     ║
║ status                — Стан розслідування    ║
║ ls /evidence          — Список доказів        ║
║ clear                 — Очистити              ║
╚════════════════════════════════════════════════╝
Tip: Деякі команди приймають аргументи!`,
    },
    {
      command: "scan vpn",
      description: "Просканувати VPN-логи",
      type: "unlock_evidence",
      response: `⟩ Connecting to WireGuard control plane...
⟩ Querying audit retention DB...
⟩ ████████████████████ 100%
⟩
⟩ Виявлено аномальну сесію:
⟩ User: serhiy.l
⟩ Time: 01:47-04:35 (12.11)
⟩ Duration: 2h 48m
⟩ rx_bytes: 4.2 MB (підозрілий обсяг завантаження)
⟩
⟩ ⚠ Спроба видалення о 04:36 (відхилено політикою audit)
⟩
⟩ ✓ Доказ "VPN-логи Сергія" розблоковано.`,
      unlockEvidenceId: "vpn_logs",
    },
    {
      command: "trace wallet 0x7f3a",
      description: "Відстежити гаманець отримувача",
      type: "unlock_evidence",
      response: `⟩ Connecting to Etherscan API...
⟩ Querying wallet 0x7f3a2b1c...
⟩
⟩ Знайдено гаманець-отримувач:
⟩ - Створено: 09.11.2024
⟩ - Поповнено через: KuCoin withdrawal
⟩ - KYC email: s.levchenko@protonmail
⟩ - Початковий IP: 87.245.x.x (Kyiv)
⟩
⟩ Перехресна перевірка з базою співробітників Cryptex...
⟩ ЗБІГ: serhiy.levchenko@cryptex.io
⟩
⟩ Email патерн: s.[surname]@protonmail
⟩               serhiy.[surname]@cryptex
⟩
⟩ ⚠ Protonmail Сергія = KYC email творця гаманця
⟩
⟩ ✓ Доказ "Створення зловмисного гаманця" розблоковано.`,
      unlockEvidenceId: "wallet_creation",
    },
    {
      command: "decrypt slack BURNT-OUT",
      description: "Розшифрувати приватний Slack-чат",
      type: "decrypt",
      response: `⟩ Password: BURNT-OUT
⟩ Initializing decryption...
⟩ ████████████████████ 100%
⟩
⟩ ✓ Розшифрування успішне.
⟩
⟩ Відновлено 5 повідомлень з #self_notes:
⟩ — "Я знаю, як вийти з multi-sig..."
⟩ — "Working: я можу підписати 2 з 3..."
⟩ — "Створив hot wallet для тестів..."
⟩ — "4 роки. 80 годин/тиждень. Без премії..."
⟩ — "Завтра вони мене запам'ятають."
⟩
⟩ ⚠ Підтверджено заздалегідь сплановану атаку.
⟩
⟩ ✓ Доказ "Фінальний внутрішній чат" розблоковано.`,
      unlockEvidenceId: "final_chat_log",
    },
    {
      command: "background check kateryna",
      description: "Перевірити дані Катерини",
      type: "unlock_evidence",
      response: `⟩ Querying credit bureaus...
⟩ Checking gambling registries...
⟩ ████████████████████ 100%
⟩
⟩ Суб'єкт: Катерина Іваненко
⟩ Загальні борги: $15,700
⟩ Активність у казино: PokerStars, $34,500 депозитів
⟩
⟩ ⚠ Сильний фінансовий мотив.
⟩ ⚠ Але технічний доступ обмежений до trading desk.
⟩
⟩ ✓ Доказ "Гральні борги Катерини" розблоковано.`,
      unlockEvidenceId: "gambling_debts",
    },
    {
      command: "status",
      description: "Статус розслідування",
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
      description: "Інформація про детектива",
      type: "info",
      response: `⟩ User: detective@cyber-unit
⟩ Role: Senior Cyber Detective
⟩ Active case: CRYPTEX-001 ($4.7M heist)
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
      id: "h1",
      text: "Хто фізично міг бути в офісі вночі? Перевірте VPN-логи кожного.",
      cost: 100,
    },
    {
      id: "h2",
      text: "Деякі підозрювані мають мотив, але не доступ. Деякі — навпаки. Шукайте перетин.",
      cost: 150,
    },
    {
      id: "h3",
      text: "Гаманець-приймач створений за 2 дні до атаки. KYC email веде до конкретної людини.",
      cost: 200,
    },
    {
      id: "h4",
      text: "Slack-канал #self_notes Сергія зашифрований. Спробуйте пароль що описує його стан.",
      cost: 150,
    },
  ],
};
