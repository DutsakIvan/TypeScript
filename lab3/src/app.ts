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
import type {
    Category,
    Product,
    CategoriesResponse,
    ProductsResponse,
} from "./types.js";

/** Базовий клас рендера — інкапсулює корінь додатка */
abstract class BaseRenderer {
    protected root: HTMLElement;

    constructor(rootId: string) {
        // Type assertion: ми гарантуємо, що елемент існує в index.html
        this.root = document.getElementById(rootId) as HTMLElement;
        if (!this.root) {
            throw new Error(`Кореневий елемент #${rootId} не знайдено в DOM`);
        }
    }

    protected showLoader(text: string = "Завантаження..."): void {
        this.root.innerHTML = `<div class="av-loader">${text}</div>`;
    }

    protected showError(message: string): void {
        this.root.innerHTML = `<div class="av-error">⚠ ${message}</div>`;
    }
}

/** Основний контролер додатка */
class ArtVaultApp extends BaseRenderer {
    private readonly dataUrl: string = "./data/categories.json";

    constructor() {
        super("appRoot");
    }

    /** Точка входу — викликається після завантаження DOM */
    public init(): void {
        this.bindNavigation();
        this.showHome();
    }

    /** Привʼязка обробників навігації */
    private bindNavigation(): void {
        const navHome = document.getElementById("navHome") as HTMLAnchorElement;
        const navCatalog = document.getElementById(
            "navCatalog"
        ) as HTMLAnchorElement;
        const brand = document.getElementById("brandLink") as HTMLAnchorElement;

        // "Home" — повне перезавантаження сторінки (згідно з вимогами лаб. роботи)
        navHome.addEventListener("click", (e: MouseEvent) => {
            e.preventDefault();
            window.location.reload();
        });

        brand.addEventListener("click", (e: MouseEvent) => {
            e.preventDefault();
            window.location.reload();
        });

        // "Catalog" — Ajax-завантаження без перезавантаження
        navCatalog.addEventListener("click", (e: MouseEvent) => {
            e.preventDefault();
            this.setActiveNav("navCatalog");
            void this.showCatalog();
        });
    }

    private setActiveNav(activeId: string): void {
        ["navHome", "navCatalog"].forEach((id) => {
            const link = document.getElementById(id);
            if (link) link.classList.remove("active");
        });
        const target = document.getElementById(activeId);
        if (target) target.classList.add("active");
    }

    /** Стартова сторінка — стаття-привітання */
    private showHome(): void {
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
    private async showCatalog(): Promise<void> {
        this.showLoader("Завантаження каталогу...");
        try {
            const data = await fetchJson<CategoriesResponse>(this.dataUrl);
            this.renderCategories(data.categories);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Невідома помилка";
            this.showError(`Не вдалося завантажити каталог. ${message}`);
        }
    }

    /** Малює перелік категорій + кнопку Specials */
    private renderCategories(categories: Category[]): void {
        const cards = categories
            .map(
                (c: Category) => `
                <div class="col-md-6 col-lg-4">
                    <div class="av-category-card" data-cat-id="${c.id}">
                        <h3>${c.name}</h3>
                        <div class="av-shortname">${c.shortname}</div>
                        <p>${c.notes}</p>
                    </div>
                </div>`
            )
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
        this.root.querySelectorAll<HTMLElement>("[data-cat-id]").forEach(
            (el: HTMLElement) => {
                el.addEventListener("click", () => {
                    const id = Number(el.dataset.catId);
                    const cat = categories.find((c) => c.id === id);
                    if (cat) void this.showProducts(cat, false);
                });
            }
        );

        const specials = document.getElementById(
            "specialsCard"
        ) as HTMLElement;
        specials.addEventListener("click", () => {
            // Випадково обираємо одну з категорій
            const randomIndex: number = Math.floor(
                Math.random() * categories.length
            );
            const randomCat: Category = categories[randomIndex];
            void this.showProducts(randomCat, true);
        });
    }

    /** Завантаження та відображення товарів вибраної категорії */
    private async showProducts(
        category: Category,
        isSpecials: boolean
    ): Promise<void> {
        this.showLoader(`Завантаження категорії «${category.name}»...`);
        try {
            const url = `./data/products/${category.shortname}.json`;
            const data = await fetchJson<ProductsResponse>(url);
            this.renderProducts(category, data.products, isSpecials);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Невідома помилка";
            this.showError(
                `Не вдалося завантажити товари категорії «${category.name}». ${message}`
            );
        }
    }

    /** Малює перелік товарів обраної категорії */
    private renderProducts(
        category: Category,
        products: Product[],
        isSpecials: boolean
    ): void {
        const badge = isSpecials
            ? `<span class="av-specials-badge">Specials</span>`
            : "";

        const cards = products
            .map(
                (p: Product) => `
                <div class="col-md-6 col-lg-4">
                    <div class="av-product-card">
                        <div class="av-product-img-wrap">
                            <img src="${p.image}" alt="${p.name}" loading="lazy" />
                        </div>
                        <div class="av-product-body">
                            <h4>${p.name}</h4>
                            <div class="av-product-shortname">${p.shortname}</div>
                            <div class="av-desc">${p.description}</div>
                            <div class="av-price">${p.price.toLocaleString(
                                "uk-UA"
                            )} ₴</div>
                        </div>
                    </div>
                </div>`
            )
            .join("");

        this.root.innerHTML = `
            <button class="av-back-btn" id="backBtn">← Назад до каталогу</button>
            <h2 class="av-section-title">${category.name} ${badge}</h2>
            <p class="text-muted mb-4">${category.notes}</p>
            <div class="row g-4">${cards}</div>
        `;

        const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
        backBtn.addEventListener("click", () => void this.showCatalog());
    }
}

// Запуск після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
    const app = new ArtVaultApp();
    app.init();
});
