# Cyber Detective — Дизайн-концепції

## Контекст
Інтерактивний кібердетективний веб-квест з кількома справами, псевдо-терміналом, доказами, підозрюваними та фінальним звинуваченням. Темна кібер-стилістика з неоновими акцентами. Має бути красивою, замасштабованою грою з реіграбельністю.

---

<response>
<text>

## Підхід №1: "Terminal Noir" — Кінематографічний CRT-кіберпанк

**Design Movement**: Поєднання Blade Runner 2049 + старий ЕЛТ-монітор + сучасний brutalist UI. Атмосфера фільмів noir перенесена у цифрову епоху.

**Core Principles**:
- Моноширинна друкарська машинка як основний візуальний голос
- CRT-сканування, легкий шум плівки, хроматична аберація на ключових елементах
- Інформаційна щільність — як на справжньому пульті аналітика
- Рваний, асиметричний layout: "розкидані файли по столу детектива"

**Color Philosophy**: Глибокий чорний (#050505) як "ніч у бункері", янтарний/амбер (#ffb000) як старий фосфорний термінал — основний акцент, аварійний червоний (#ff003c) лише для критичних подій, холодний м'ятний (#7affc6) для розблокованих доказів. Палітра намеренно вузька — як на реальному моніторі ЕОМ.

**Layout Paradigm**: Багатопанельний "command center" із колажним розташуванням карток-файлів під різними кутами (легкий поворот ±2°), як docs на робочому столі. Терминал прибитий донизу як command bar. Sidebar з вертикальним текстом-маркуванням.

**Signature Elements**:
- CRT-розгортка на фоні (ледве помітна, рухома)
- "Папки справ" зі stamp-печатками (CLASSIFIED, TOP SECRET)
- ASCII-арт для логотипів та розділювачів

**Interaction Philosophy**: Кожна дія — як натискання реальних кнопок. Звуки клавіатури, "печатання" тексту, шорсткий feedback. Доказ "відкривається" як файл з шурхотом.

**Animation**: Typewriter-друк для всього критичного тексту (40-60 знаків/сек), CRT-flicker раз на 8 секунд, scanline пробігає кожні 4 сек, staggered fade-in для карток (60-80мс затримки), shake на помилку.

**Typography**: Display — JetBrains Mono Bold для заголовків (моно-display!), Body — IBM Plex Mono для тіла, Special — Special Elite (друкарська машинка) для "паперових" елементів.

</text>
<probability>0.07</probability>
</response>

<response>
<text>

## Підхід №2: "Holographic Investigation" — Футуристичний голографічний UI

**Design Movement**: Inspired by Iron Man HUD, Cyberpunk 2077 quickhack interface, та сучасні sci-fi фільми. Все плаває у тривимірному просторі з glassmorphism.

**Core Principles**:
- Багатошаровість: картки як прозорі панелі, що нашаровуються одна на одну
- Glow & blur всюди — від кнопок до фону
- Параллакс при русі миші — глибина відчувається фізично
- Округлі форми, текучі градієнти, плавні переходи

**Color Philosophy**: Темно-фіолетовий (#0a0420) як "космос розслідування", електричний бірюзовий (#00f0ff) і ультрафіолетовий (#a020f0) як основні неонові акценти, блискучий рожевий (#ff2b9d) для ключових доказів. Багатий, насичений gradient-mix.

**Layout Paradigm**: Центральний "hub" з orbit-розкиданими підрозділами. 3D-карусель доказів. Sidebar — вертикальна вузька стрічка з абстрактними іконами.

**Signature Elements**:
- Голографічні аватари підозрюваних з обертовим кільцем
- Particle field на фоні (повільний дрейф 100+ часток)
- Glow-orbs замість звичайних кнопок

**Interaction Philosophy**: Все реагує на курсор. 3D tilt на картках, magnetic pull для кнопок, ripple ефекти при кліках.

**Animation**: Framer-motion-driven, spring physics, неперервна "життєвість" — все легко погойдується. 200-300мс спрингові переходи. Particle-emit на ключових подіях.

**Typography**: Display — Space Grotesk Bold для футуристичного шарму, Body — Inter, Mono — JetBrains Mono.

</text>
<probability>0.06</probability>
</response>

<response>
<text>

## Підхід №3: "Forensic Workstation" — Реалістична детективна станція

**Design Movement**: Реалістичний UI справжнього криміналістичного ПЗ (як Maltego, Wireshark, IBM i2 Analyst's Notebook), помножений на dark cyberpunk-естетику. Серйозний, "професійний" вигляд.

**Core Principles**:
- Інформаційна щільність професійного інструменту
- Карти зв'язків (graph view) між підозрюваними та доказами
- Tabbed/dockable панелі — як в IDE
- Grid-baseline, чіткі лінії, мінімум "м'якого"

**Color Philosophy**: Slate (#0e1218) як база, neon-cyan (#00d9ff) для активних елементів, lime (#a3ff12) для "evidence found", criminal-red (#ff2840) для тривог. Палітра професійна, без розважального.

**Layout Paradigm**: Multi-panel IDE-style. Топ-бар з активним кейсом. Лівий sidebar — ієрархія справ. Центр — workspace з вкладками (Overview / Evidence Graph / Terminal / Suspects). Правий — context inspector.

**Signature Elements**:
- Force-directed graph підозрюваних та доказів (SVG/Canvas)
- Реальні mock-логи з підсвіткою синтаксису
- Status bar внизу як у IDE

**Interaction Philosophy**: Швидкість і точність. Хоткеї, drag-resize панелей, command palette (⌘K).

**Animation**: Стримана, функціональна. 120-180мс на UI-state changes. Без декоративних анімацій. Glow на focused elements.

**Typography**: Display — Bricolage Grotesque, Body — Inter, Mono — JetBrains Mono.

</text>
<probability>0.05</probability>
</response>

---

## ✅ ОБРАНО: Підхід №1 — "Terminal Noir"

Цей варіант обраний через найкраще поєднання атмосферності, професійного вигляду та "крутості" для гри. CRT-естетика дає унікальний характер, який неможливо сплутати з типовими "AI-сайтами". Кожен доказ читається як справжній файл детектива.
