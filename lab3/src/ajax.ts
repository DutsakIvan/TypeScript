/**
 * Узагальнена обгортка над fetch() для Ajax-запитів за JSON.
 * Використовує Generics, щоб типізувати відповідь.
 */
export async function fetchJson<T>(url: string): Promise<T> {
    const response: Response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Ajax-запит до ${url} завершився помилкою: ${response.status} ${response.statusText}`
        );
    }

    const data: T = (await response.json()) as T;
    return data;
}
