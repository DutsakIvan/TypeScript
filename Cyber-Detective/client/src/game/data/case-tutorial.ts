import type { InvestigationCase } from "../types";

export const caseTutorial: InvestigationCase = {
  id: "tutorial-01",
  title: "Справа 0: Тренувальний запуск",
  subtitle: "Симуляція розслідування CyberClub",
  codename: "OPERATION START",
  difficulty: "easy",
  description:
    "Аналіз системи безпеки TechCorp та розшифрованого архіву підтвердив причетність Аліси Вонг до інциденту. Через незадоволення своєю роллю та доступ до базових інструментів, вона намагалася підняти свої привілеї і завантажити конфіденційний звіт конкурентам.\n\n[ СИСТЕМНЕ ПОВІДОМЛЕННЯ ]\nНавчальна симуляція для ознайомлення з основними механіками розслідування, роботи з доказами, використання терміналу та складання гіпотез на дошці.",
  briefing: `Вітаємо в системі CyberClub. Це навчальна симуляція, створена для перевірки ваших детективних навичок.

**Завдання:**
1. Ознайомтесь із вкладкою "Підозрювані".
2. Дослідіть "Докази" та зламайте заблокований файл за допомогою "Терміналу".
3. Знайдіть зв'язок між розблокованим доказом та одним із підозрюваних на "Дошці".
4. Висуньте "Звинувачення" правильному підозрюваному.

Ваша мета: з'ясувати, хто з працівників компанії вкрав конфіденційний звіт.
У вас є два підозрюваних. Дійте.`,
  basePoints: 100,
  correctSuspectId: "suspect_alice",
  suspects: [
    {
      id: "suspect_bob",
      name: 'Роберт "Боб" Сміт',
      nickname: "Bob",
      role: "Системний адміністратор",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c3-2-FgKGaALEVysbt352a6zdtV.webp",
      motive: "Ображений на компанію за відмову в підвищенні зарплати.",
      alibi: "Стверджує, що оновлював сервери всю ніч.",
      accessLevel: "admin",
      lastActivity: "Вчора о 23:45",
      suspicionLevel: 30,
      bio: "Досвідчений сисадмін. Має повний доступ до всіх систем, але його дії завжди чітко логуються. Любить скаржитись на керівництво.",
      relatedEvidenceIds: ["ev_log_1"],
    },
    {
      id: "suspect_alice",
      name: "Аліса Вонг",
      nickname: "Alice",
      role: "Молодший аналітик",
      avatar:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663695193417/LjDUeqTmuHUpVbojdzKXBw/suspect-c2-4-n6njohUrYNX8Lm873z2Xvi.webp",
      motive: "Отримала пропозицію від конкурентів, які потребують звіт.",
      alibi: "Стверджує, що пішла додому о 18:00.",
      accessLevel: "editor",
      lastActivity: "Сьогодні о 01:12",
      suspicionLevel: 80,
      bio: "Амбітна та кмітлива. Має доступ лише до базових документів, але відомо, що вона цікавилась інструментами для підвищення привілеїв (privilege escalation).",
      relatedEvidenceIds: ["ev_encrypted_log"],
    },
  ],
  evidence: [
    {
      id: "ev_log_1",
      title: "Журнал доступу до сервера",
      category: "log",
      status: "open",
      shortDescription: "Лог доступу до кімнати серверів.",
      fullContent:
        "23:45 - Вхід [Admin: Bob]\n23:55 - Система оновлена.\n00:30 - Вихід [Admin: Bob]\n\nУсі дії Боба задокументовані і відповідають його алібі.",
      isKeyEvidence: false,
    },
    {
      id: "ev_encrypted_log",
      title: "Прихований архів (archive.zip)",
      category: "encrypted",
      status: "locked",
      shortDescription:
        "Запаролений ZIP архів, знайдений на комп'ютері Аліси. Потрібно знайти вразливість.",
      fullContent:
        "Архів успішно розшифровано. Всередині знайдено копію конфіденційного звіту, а також листування з компанією-конкурентом. Це прямий доказ провини Аліси.",
      isKeyEvidence: true,
      pointsToSuspectId: "suspect_alice",
      unlockCommand: "decrypt archive.zip",
      unlockHint:
        "Спробуйте команду `scan archive.zip`, щоб проаналізувати архів і знайти пароль.",
    },
  ],
  messages: [],
  terminalCommands: [
    {
      command: "scan",
      description: "Аналіз файлів на наявність вразливостей",
      type: "scan",
      requiresArgument: true,
      expectedArgument: "archive.zip",
      response:
        "Алізуємо archive.zip... Знайдено вразливість у шифруванні ZIP crypto. Пароль слабкий. Для розблокування використайте: decrypt archive.zip",
      argumentHint: "Вкажіть файл для сканування (наприклад, scan archive.zip)",
    },
    {
      command: "decrypt",
      description: "Дешифрування заблокованих доказів",
      type: "decrypt",
      requiresArgument: true,
      expectedArgument: "archive.zip",
      response:
        'Розшифровка архіву archive.zip пройшла успішно. Доказ "Прихований архів" розблоковано. Перегляньте його у вкладці Докази.',
      argumentHint: "Вкажіть файл для дешифрування",
      unlockEvidenceId: "ev_encrypted_log",
    },
  ],
  hints: [
    {
      id: "h1",
      cost: 0,
      text: "Перевірте Термінал. Команда `scan archive.zip` може допомогти розблокувати доказ.",
    },
  ],
};
