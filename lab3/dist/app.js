/**
 * ArtVault — головний модуль клієнтського додатка.
 * Лабораторна робота №3 з курсу «Розробка WEB-додатків (TypeScript)».
 *
 * Реалізує:
 *  - односторінковий додаток (SPA), де навігація відбувається без перезавантаження;
 *  - Ajax-завантаження JSON-даних про категорії та товари;
 *  - спеціальну категорію Specials, що випадково обирається через Math.random().
 */
import { fetchJson } from "./ajax.js";
/** Базовий клас рендера — інкапсулює корінь додатка */
class BaseRenderer {
    constructor(rootId) {
        // Type assertion: ми гарантуємо, що елемент існує в index.html
        this.root = document.getElementById(rootId);
        if (!this.root) {
            throw new Error(`Кореневий елемент #${rootId} не знайдено в DOM`);
        }
    }
    showLoader(text = "Завантаження...") {
        this.root.innerHTML = `<div class="av-loader">${text}</div>`;
    }
    showError(message) {
        this.root.innerHTML = `<div class="av-error">⚠ ${message}</div>`;
    }
}
/** Основний контролер додатка */
class ArtVaultApp extends BaseRenderer {
    constructor() {
        super("appRoot");
        this.dataUrl = "./data/categories.json";
    }
    /** Точка входу — викликається після завантаження DOM */
    init() {
        this.bindNavigation();
        this.showHome();
    }
    /** Привʼязка обробників навігації */
    bindNavigation() {
        const navHome = document.getElementById("navHome");
        const navCatalog = document.getElementById("navCatalog");
        const brand = document.getElementById("brandLink");
        // "Home" — повне перезавантаження сторінки (згідно з вимогами лаб. роботи)
        navHome.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.reload();
        });
        brand.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.reload();
        });
        // "Catalog" — Ajax-завантаження без перезавантаження
        navCatalog.addEventListener("click", (e) => {
            e.preventDefault();
            this.setActiveNav("navCatalog");
            void this.showCatalog();
        });
    }
    setActiveNav(activeId) {
        ["navHome", "navCatalog"].forEach((id) => {
            const link = document.getElementById(id);
            if (link)
                link.classList.remove("active");
        });
        const target = document.getElementById(activeId);
        if (target)
            target.classList.add("active");
    }
    /** Стартова сторінка — стаття-привітання */
    showHome() {
        this.root.innerHTML = `
            <section class="av-hero">
                <h1>ArtVault</h1>
                <p>
                    Цифрова галерея авторського мистецтва: живопис, скульптура,
                    фотографія та digital art. Натисніть «Catalog», щоб
                    переглянути наші колекції — все завантажується миттєво,
                    без перезавантаження сторінки.
                </p>
            </section>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="av-category-card">
                        <h3>Жива колекція</h3>
                        <p>Понад 20 робіт у 4 категоріях, що оновлюються щомісяця.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="av-category-card">
                        <h3>Ajax + TypeScript</h3>
                        <p>Дані завантажуються асинхронно з JSON через fetch API.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="av-category-card">
                        <h3>Specials</h3>
                        <p>Випадкова добірка робіт із усього каталогу — щоразу нова.</p>
                    </div>
                </div>
            </div>
        `;
    }
    /** Каталог: завантажує JSON з категоріями та рендерить їх */
    async showCatalog() {
        this.showLoader("Завантаження каталогу...");
        try {
            const data = await fetchJson(this.dataUrl);
            this.renderCategories(data.categories);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Невідома помилка";
            this.showError(`Не вдалося завантажити каталог. ${message}`);
        }
    }
    /** Малює перелік категорій + кнопку Specials */
    renderCategories(categories) {
        const cards = categories
            .map((c) => `
                <div class="col-md-6 col-lg-4">
                    <div class="av-category-card" data-cat-id="${c.id}">
                        <h3>${c.name}</h3>
                        <div class="av-shortname">${c.shortname}</div>
                        <p>${c.notes}</p>
                    </div>
                </div>`)
            .join("");
        this.root.innerHTML = `
            <h2 class="av-section-title">Каталог категорій</h2>
            <div class="row g-4">
                ${cards}
                <div class="col-md-6 col-lg-4">
                    <div class="av-category-card" id="specialsCard">
                        <h3>Specials <span class="av-specials-badge">Random</span></h3>
                        <div class="av-shortname">випадкова добірка</div>
                        <p>Натисніть, щоб переглянути випадково обрану категорію з усього каталогу.</p>
                    </div>
                </div>
            </div>
        `;
        // Обробники кліків — Ajax-завантаження товарів категорії
        this.root.querySelectorAll("[data-cat-id]").forEach((el) => {
            el.addEventListener("click", () => {
                const id = Number(el.dataset.catId);
                const cat = categories.find((c) => c.id === id);
                if (cat)
                    void this.showProducts(cat, false);
            });
        });
        const specials = document.getElementById("specialsCard");
        specials.addEventListener("click", () => {
            // Випадково обираємо одну з категорій
            const randomIndex = Math.floor(Math.random() * categories.length);
            const randomCat = categories[randomIndex];
            void this.showProducts(randomCat, true);
        });
    }
    /** Завантаження та відображення товарів вибраної категорії */
    async showProducts(category, isSpecials) {
        this.showLoader(`Завантаження категорії «${category.name}»...`);
        try {
            const url = `./data/products/${category.shortname}.json`;
            const data = await fetchJson(url);
            this.renderProducts(category, data.products, isSpecials);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Невідома помилка";
            this.showError(`Не вдалося завантажити товари категорії «${category.name}». ${message}`);
        }
    }
    /** Малює перелік товарів обраної категорії */
    renderProducts(category, products, isSpecials) {
        const badge = isSpecials
            ? `<span class="av-specials-badge">Specials</span>`
            : "";
        const cards = products
            .map((p) => `
                <div class="col-md-6 col-lg-4">
                    <div class="av-product-card">
                        <div class="av-product-img-wrap">
                            <img src="${p.image}" alt="${p.name}" loading="lazy" />
                        </div>
                        <div class="av-product-body">
                            <h4>${p.name}</h4>
                            <div class="av-product-shortname">${p.shortname}</div>
                            <div class="av-desc">${p.description}</div>
                            <div class="av-price">${p.price.toLocaleString("uk-UA")} ₴</div>
                        </div>
                    </div>
                </div>`)
            .join("");
        this.root.innerHTML = `
            <button class="av-back-btn" id="backBtn">← Назад до каталогу</button>
            <h2 class="av-section-title">${category.name} ${badge}</h2>
            <p class="text-muted mb-4">${category.notes}</p>
            <div class="row g-4">${cards}</div>
        `;
        const backBtn = document.getElementById("backBtn");
        backBtn.addEventListener("click", () => void this.showCatalog());
    }
}
// Запуск після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
    const app = new ArtVaultApp();
    app.init();
});
//# sourceMappingURL=app.js.map