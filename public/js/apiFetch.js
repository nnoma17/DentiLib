export async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/html/login.html";
        return new Promise(() => {}); // stoppe l'exécution pendant la redirection
    }
    if (response.status === 403) {
        const err = await response.json().catch(() => ({}));
        window.location.href = `/html/403.html?message=${encodeURIComponent(err.message || "Accès non autorisé")}`;
        return new Promise(() => {});
    }
    return response;
}