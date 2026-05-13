# ArtVault — Лабораторна робота №3

Односторінковий веб-додаток на чистому TypeScript + Ajax для курсу
«Розробка WEB-додатків (TypeScript)».

## Запуск локально

```bash
# 1. Встановити TypeScript (одноразово)
npm install

# 2. Скомпілювати TS у JS
npm run build

# 3. Запустити локальний HTTP-сервер
# (Ajax не працює з file://, потрібен саме http://)
npx http-server -p 8080 -c-1 .
```

Після цього відкрити у браузері: <http://localhost:8080/>.

## Розгортання на GitHub Pages

1. Скомпілювати: `npm run build`.
2. Закомітити теку `dist/` разом з рештою файлів.
3. У налаштуваннях репозиторію → Pages → Source: **main** / **root**
   (або відповідна підпапка проекту).

## Структура

```
artvault-lab3/
├── index.html          # Каркас сторінки
├── styles.css          # Стилі
├── tsconfig.json       # Конфіг TypeScript
├── package.json
├── src/
│   ├── app.ts          # Основний контролер
│   ├── ajax.ts         # Узагальнена fetchJson<T>
│   └── types.ts        # Інтерфейси Category, Product
├── data/
│   ├── categories.json
│   └── products/
│       ├── paintings.json
│       ├── sculptures.json
│       ├── photography.json
│       └── digital.json
└── dist/               # Згенерований tsc-ом JS
```
