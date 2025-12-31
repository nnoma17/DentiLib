import { loadUserInfo } from "../userInfo.js";

const firstNameInput = document.getElementById("firstNamePatient");
const lastNameInput = document.getElementById("lastNamePatient");
const emailInput = document.getElementById("emailNamePatient");
const numSecuInput = document.getElementById("numSecuPatient");
const commentInput = document.getElementById("commentProcedure");
const procedureTableBody = document.getElementById("worksheetTableBody");

const btnValidate = document.getElementById("validationWorksheet");

const modifyBtn = document.getElementById("modifyWorksheet");

const urlParams = new URLSearchParams(window.location.search);
const worksheetId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    loadUserInfo();
    if (worksheetId) await loadWorksheet(worksheetId);
});

/* =========================
   CHARGEMENT WORKSHEET
========================= */
async function loadWorksheet(id) {
    try {
        const response = await fetch(`/api/admin/get_worksheet_by_id/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();
        if (!data.success) return;

        const ws = data.worksheet;

        // Champs patient
        firstNameInput.value = ws.firstNamePatient || "";
        lastNameInput.value = ws.lastNamePatient || "";
        emailInput.value = ws.emailNamePatient || "";
        numSecuInput.value = ws.numSecuPatient || "";
        commentInput.value = ws.comment || "";

        const worksheetActeNames = (ws.procedure || []).map(p =>
            (p.name || "").trim().toLowerCase()
        );

        // Actes du prothésiste
        const procResponse = await fetch("/api/dentiste/getAssociatedProthesist", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const procData = await procResponse.json();
        if (!procData.success) return;

        const allProcedures = procData.prothesist.listeActes || [];

        procedureTableBody.innerHTML = "";

        allProcedures.forEach(procedure => {
            const procDoc = procedure.acte;

            const isChecked = worksheetActeNames.includes(
                procDoc.name.trim().toLowerCase()
            );

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <input type="checkbox"
                        data-id="${procDoc._id}"
                        data-name="${procDoc.name}"
                        data-description="${procDoc.description}"
                        data-price="${procedure.price || 0}"
                        ${isChecked ? "checked" : ""}
                    >
                </td>
                <td>${procDoc.name}</td>
                <td>${procDoc.description}</td>
                <td>${procedure.price || 0}</td>
            `;

            procedureTableBody.appendChild(tr);
        });

    } catch (err) {
        console.error("Erreur loadWorksheet :", err);
    }
}

/* =========================
   ACTES SÉLECTIONNÉS
========================= */
function getSelectedProcedures() {
    return [...procedureTableBody.querySelectorAll("input[type='checkbox']:checked")]
        .map(cb => ({
            acteId: cb.dataset.id,
            name: cb.dataset.name,
            description: cb.dataset.description,
            price: Number(cb.dataset.price)
        }));
}

/* =========================
   MODIFICATION
========================= */
modifyBtn.addEventListener("click", async e => {
    e.preventDefault();

    const updatedData = {
        firstNamePatient: firstNameInput.value.trim(),
        lastNamePatient: lastNameInput.value.trim(),
        emailNamePatient: emailInput.value.trim(),
        numSecuPatient: numSecuInput.value.trim(),
        comment: commentInput.value.trim(),
        procedure: getSelectedProcedures()
    };

    try {
        const response = await fetch(
            `/api/admin/gestionWorksheet/update_worksheet/${worksheetId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erreur lors de la modification");
            return;
        }

        alert("Worksheet modifié avec succès !");
    } catch (err) {
        console.error("Erreur updateWorksheet :", err);
        alert("Erreur serveur lors de la modification");
    }
});

btnValidate.addEventListener("click", async e => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/admin/gestionWorksheet/update_status/${worksheetId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "En attente" })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erreur lors de la validation");
            return;
        }

        alert("Worksheet créée et envoyée au prothésiste !");l
        window.location.href = "dashboard_dentiste.html";

    } catch (err) {
        console.error("Erreur validateAndSendWorksheet:", err);
        alert("Erreur serveur lors de l'envoi");
    }
});