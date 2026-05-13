/**
 * Типи даних для додатка ArtVault.
 * Інтерфейси описують структуру JSON, який повертається сервером
 * (тут — статичні JSON-файли, що завантажуються через Ajax).
 */

/** Категорія каталогу */
export interface Category {
    id: number;
    name: string;
    shortname: string;
    notes: string;
}

/** Окремий товар (мистецький твір) */
export interface Product {
    id: number;
    name: string;
    shortname: string;
    description: string;
    price: number;
    image: string;
}

/** Кореневий JSON списку категорій */
export interface CategoriesResponse {
    categories: Category[];
}

/** Кореневий JSON списку товарів у категорії */
export interface ProductsResponse {
    categoryId: number;
    products: Product[];
}
