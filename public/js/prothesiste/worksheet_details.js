import { loadUserInfo } from "../userInfo.js";
import { createCell, createRow, clearElement } from "../domUtils.js";

const btnAccueil = document.getElementById("homePage");

const firstNameInput = document.getElementById("firstNamePatient");
const lastNameInput = document.getElementById("lastNamePatient");
const emailInput = document.getElementById("emailNamePatient");
const numSecuInput = document.getElementById("numSecuPatient");
const commentInput = document.getElementById("commentProcedure");
const procedureTableBody = document.getElementById("worksheetTableBody");
const statusSelect = document.getElementById("statusSelect");
const saveStatusBtn = document.getElementById("saveStatusBtn");

const urlParams = new URLSearchParams(window.location.search);
const worksheetId = urlParams.get("id");


// Afiche les informations de la fiche
async function loadWorksheet(id) {
    try {
        const response = await fetch(`/api/prothesiste/get_worksheet_by_id/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();
        if (!data.success) return;

        const ws = data.worksheet;
        

        // Remplir infos patient (readonly)
        firstNameInput.value = ws.firstNamePatient || "";
        lastNameInput.value = ws.lastNamePatient || "";
        emailInput.value = ws.emailNamePatient || "";
        numSecuInput.value = ws.numSecuPatient || "";
        commentInput.value = ws.comment || "";

        // Remplir procédures (readonly, cases cochées selon la worksheet)
        clearElement(procedureTableBody);
        (ws.procedure || []).forEach(proc => {
            // Injection en textContent : neutralise les injections de script (XSS).
            const checkCell = createCell("");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.disabled = true;
            checkbox.checked = Boolean(proc);
            checkCell.appendChild(checkbox);

            const tr = createRow([
                checkCell,
                createCell(proc.name),
                createCell(proc.description),
                createCell(proc.price || 0)
            ]);
            procedureTableBody.appendChild(tr);
        });

        // Status
        statusSelect.value = ws.status;

    } catch (err) {
        console.error("Erreur loadWorksheet :", err);
    }
}

//---------------------------
//  Mise à jour de la fiche
//---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    loadUserInfo();
    if (worksheetId) await loadWorksheet(worksheetId);
});

// Mise à jour du statut
saveStatusBtn.addEventListener("click", async () => {
    const updatedData = {
        status: statusSelect.value
    };

    try {
        const response = await fetch(`/api/prothesiste/gestionWorksheet/update_status/${worksheetId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Erreur lors de la mise à jour du statut");
            return;
        }

        alert("Statut mis à jour avec succès !");

    } catch (err) {
        console.error("Erreur updateStatus :", err);
        alert("Erreur serveur lors de la mise à jour");
    }
});

btnAccueil.addEventListener("click", () => {
    window.location.href = "dashboard_prothesiste.html";
});