import { loadUserInfo } from "../userInfo.js";

const formCreateWorksheet = document.getElementById("worksheetCreateForm");
const btnAccueil = document.getElementById("homePage");

const firstNameInput = document.getElementById("firstNamePatient");
const lastNameInput = document.getElementById("lastNamePatient");
const emailInput = document.getElementById("emailNamePatient");
const numSecuInput = document.getElementById("numSecuPatient");
const commentInput = document.getElementById("commentProcedure");
const procedureTableBody = document.getElementById("worksheetTableBody");
const btnValidateCreate = document.getElementById("validationCreateWorksheet");
const errorForm = document.getElementById("errorForm");

//----------------------
// Gestion des erreurs
//----------------------
function updateError(message) {
    if (!errorForm) return;
    errorForm.textContent = message;
    errorForm.style.display = "block";
}

function clearError() {
    if (!errorForm) return;
    errorForm.textContent = "";
    errorForm.style.display = "none";
}

//----------------------------------------------------
//  Afficher la liste des actes du protésiste associé
//----------------------------------------------------
async function loadProthesistProcedure() {
    if (!procedureTableBody) return;

    try {
        const response = await fetch("/api/dentiste/getAssociatedProthesist", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const procedures = data.prothesist?.listeActes || [];
        procedureTableBody.innerHTML = "";

        if (procedures.length === 0) {
            procedureTableBody.innerHTML =
                `<tr><td colspan="4" style="text-align:center;">Aucune procédure disponible</td></tr>`;
            return;
        }

        procedures.forEach(actItem => {
            const procDoc = actItem.acte || {};
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    <input type="checkbox"
                        data-name="${procDoc.name}"
                        data-description="${procDoc.description}"
                        data-price="${actItem.price || 0}">
                </td>
                <td>${procDoc.name}</td>
                <td>${procDoc.description}</td>
                <td>${actItem.price || 0}</td>
            `;

            procedureTableBody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        updateError("Erreur lors du chargement des procédures");
    }
}

//--------------------------
//   Liste des actes choisis
//--------------------------
function getSelectedProcedures() {
    if (!procedureTableBody) return [];
    return [...procedureTableBody.querySelectorAll("input[type='checkbox']:checked")]
        .map(cb => ({
            name: cb.dataset.name,
            description: cb.dataset.description,
            price: Number(cb.dataset.price)
        }));
}

//----------------------
//  Création fiche
//----------------------
async function createWorksheet() {
    clearError();

    const firstName = firstNameInput?.value.trim();
    const lastName = lastNameInput?.value.trim();
    const email = emailInput?.value.trim();
    const numSecu = numSecuInput?.value.trim();
    const comment = commentInput?.value.trim();
    const procedures = getSelectedProcedures();

    if (!firstName || !lastName || !email || !numSecu) {
        updateError("Veuillez remplir tous les champs obligatoires");
        return null;
    }

    if (!/^\d+$/.test(numSecu)) {
        updateError("Le numéro de sécurité sociale doit contenir uniquement des chiffres");
        return null;
    }

    const worksheetData = {
        numWorkSheet: Date.now(),
        firstNamePatient: firstName,
        lastNamePatient: lastName,
        emailNamePatient: email,
        numSecuPatient: numSecu,
        comment,
        procedure: procedures
    };

    try {
        const response = await fetch("/api/admin/gestionWorksheet/create_worksheet", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(worksheetData)
        });

        const data = await response.json();
        if (!response.ok) {
            updateError(data.message || "Erreur lors de la création");
            return null;
        }

        return data.worksheet;

    } catch (err) {
        console.error(err);
        updateError("Erreur serveur lors de la création");
        return null;
    }
}

//-----------------------
//   EventListener
//-----------------------

//Si fiche créée on retourne sur la page d'acceuil
formCreateWorksheet.addEventListener("submit", async e => {
    e.preventDefault();

    const worksheet = await createWorksheet();
    if (!worksheet) return;
    
    window.location.href = "dashboard_dentiste.html";
});


// Bouton VALIDER
if (btnValidateCreate) {
    btnValidateCreate.addEventListener("click", async e => {
        e.preventDefault();

        const worksheet = await createWorksheet();
        if (!worksheet) return;

        try {
            const response = await fetch(
                `/api/admin/gestionWorksheet/update_status/${worksheet._id}`,
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
            console.error(err);
            updateError("Erreur serveur lors de l'envoi");
        }
    });
}

if (btnAccueil) {
    btnAccueil.addEventListener("click", () => {
        window.location.href = "dashboard_dentiste.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    loadProthesistProcedure();
});
