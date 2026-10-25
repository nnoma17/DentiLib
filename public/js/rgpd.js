import { apiFetch } from "./apiFetch.js";

export async function exportMyData() {
    const response = await apiFetch("/api/user/export_my_data");
    if (!response.ok) {
        alert("Impossible d'exporter vos données");
        return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mes-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
}

export async function deleteMyAccount() {
    if (!confirm("Cette action est définitive. Voulez-vous supprimer votre compte ?")) return;

    const password = prompt("Saisissez votre mot de passe pour confirmer :");
    if (!password) return;

    const response = await apiFetch("/api/user/delete_my_account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        alert(data.message || "Erreur lors de la suppression");
        return;
    }

    localStorage.removeItem("token");
    window.location.href = "/html/login.html";
}