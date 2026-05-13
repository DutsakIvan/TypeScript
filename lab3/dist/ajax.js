/**
 * Узагальнена обгортка над fetch() для Ajax-запитів за JSON.
 * Використовує Generics, щоб типізувати відповідь.
 */
export async function fetchJson(url) {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Ajax-запит до ${url} завершився помилкою: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json());
    return data;
}
//# sourceMappingURL=ajax.js.map