import { loadUserInfo } from "../userInfo.js";

//--------------------
//   Elements du dom
//--------------------
const firstNameInput = document.getElementById("firstNamePatient");
const lastNameInput = document.getElementById("lastNamePatient");
const emailInput = document.getElementById("emailNamePatient");
const numSecuInput = document.getElementById("numSecuPatient");
const commentInput = document.getElementById("commentProcedure");
const procedureTableBody = document.getElementById("worksheetTableBody");

const btnAccueil = document.getElementById("homePage");
const btnValidate = document.getElementById("validationWorksheet");
const modifyBtn = document.getElementById("modifyWorksheet");

const errorForm = document.getElementById("errorForm");

const urlParams = new URLSearchParams(window.location.search);
const worksheetId = urlParams.get("id");

//----------------------
//  Gestion des erreurs
//----------------------
function updateError(message) {
    errorForm.textContent = message;
    errorForm.style.display = "block";
}

function clearError() {
    errorForm.textContent = "";
    errorForm.style.display = "none";
}

//-----------------------
//   Création de la fiche
//-------------------------
function validateWorksheetFields() {
    clearError();

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const numSecu = numSecuInput.value.trim();

    if (!firstName || !lastName || !email || !numSecu) {
        updateError("Veuillez remplir tous les champs obligatoires");
        return false;
    }

    if (!/^\d+$/.test(numSecu)) {
        updateError("Le numéro de sécurité sociale doit contenir uniquement des chiffres");
        return false;
    }

    return true;
}

//--------------------
//   EventListener
//--------------------
document.addEventListener("DOMContentLoaded", async () => {
    loadUserInfo();
    if (worksheetId) {
        await loadWorksheet(worksheetId);
    }
});

//Charger les info de la fiche
async function loadWorksheet(id) {
    try {
        const response = await fetch(`/api/admin/get_worksheet_by_id/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            updateError(data.message || "Impossible de charger la fiche");
            return;
        }

        const ws = data.worksheet;

        firstNameInput.value = ws.firstNamePatient || "";
        lastNameInput.value = ws.lastNamePatient || "";
        emailInput.value = ws.emailNamePatient || "";
        numSecuInput.value = ws.numSecuPatient || "";
        commentInput.value = ws.comment || "";

        const worksheetActeNames = (ws.procedure || []).map(p =>
            (p.name || "").trim().toLowerCase()
        );

        const procResponse = await fetch("/api/dentiste/getAssociatedProthesist", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const procData = await procResponse.json();
        if (!procResponse.ok) {
            updateError(procData.message || "Erreur chargement des actes");
            return;
        }

        const allProcedures = procData.prothesist?.listeActes || [];
        procedureTableBody.innerHTML = "";

        allProcedures.forEach(procItem => {
            const procDoc = procItem.acte;
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
                        data-price="${procItem.price || 0}"
                        ${isChecked ? "checked" : ""}
                    >
                </td>
                <td>${procDoc.name}</td>
                <td>${procDoc.description}</td>
                <td>${procItem.price || 0}</td>
            `;

            procedureTableBody.appendChild(tr);
        });

    } catch (err) {
        console.error("Erreur loadWorksheet :", err);
        updateError("Erreur serveur lors du chargement");
    }
}

function getSelectedProcedures() {
    return [...procedureTableBody.querySelectorAll("input[type='checkbox']:checked")]
        .map(cb => ({
            acteId: cb.dataset.id,
            name: cb.dataset.name,
            description: cb.dataset.description,
            price: Number(cb.dataset.price)
        }));
}

//Moficiation fiche
modifyBtn.addEventListener("click", async e => {
    e.preventDefault();

    if (!validateWorksheetFields()) return;

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
            updateError(data.message || "Erreur lors de la modification");
            return;
        }

        window.location.href = "dashboard_dentiste.html";

    } catch (err) {
        console.error("Erreur updateWorksheet :", err);
        updateError("Erreur serveur lors de la modification");
    }
});

//Création
btnValidate.addEventListener("click", async e => {
    e.preventDefault();

    if (!validateWorksheetFields()) return;

    try {
        const response = await fetch(
            `/api/admin/gestionWorksheet/update_status/${worksheetId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "En attente" })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            updateError(data.message || "Erreur lors de la validation");
            return;
        }

        window.location.href = "dashboard_dentiste.html";

    } catch (err) {
        console.error("Erreur validateAndSendWorksheet :", err);
        updateError("Erreur serveur lors de l'envoi");
    }
});


btnAccueil.addEventListener("click", () => {
    window.location.href = "dashboard_dentiste.html";
});