import { loadUserInfo } from "../userInfo.js";

const formCreateWorksheet = document.getElementById("worksheetCreateForm");
const btnAccueil = document.getElementById("homePage");

const firstNameInput = document.getElementById("firstNamePatient");
const lastNameInput = document.getElementById("lastNamePatient");
const emailInput = document.getElementById("emailNamePatient");
const numSecuInput = document.getElementById("numSecuPatient");
const commentInput = document.getElementById("commentProcedure");
const procedureTableBody = document.getElementById("worksheetTableBody");

const btnValidate = document.getElementById("validationWorksheet");

// ===========================
// Charger les procédures du prothésiste associé
// ===========================
async function loadProthesistProcedure() {
    try {
        const response = await fetch("/api/dentiste/getAssociatedProthesist", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();

        console.log("Réponse brute du serveur :", data); // <- IMPORTANT pour debug

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de la récupération du prothésiste");
        }

        const procedures = data.prothesist.listeActes || [];
        procedureTableBody.innerHTML = "";

        if (procedures.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="4" style="text-align:center;">Aucune procédure disponible</td>`;
            procedureTableBody.appendChild(tr);
            return;
        }

        procedures.forEach(actItem => {
            const procDoc = actItem.acte || {};
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td><input type="checkbox"
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
        console.error("Erreur loadProthesistProcedure :", err);
        procedureTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Erreur lors du chargement des procédures</td></tr>`;
    }
}


// ===========================
// Récupérer les procédures sélectionnées
// ===========================
function getSelectedProcedures() {
    const procedures = [];
    const rows = procedureTableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox && checkbox.checked) {
            procedures.push({
                name: checkbox.dataset.name,
                description: checkbox.dataset.description,
                price: Number(checkbox.dataset.price)
            });
        }
    });

    return procedures;
}

// ===========================
// Créer la fiche worksheet
// ===========================
async function createWorksheet() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const numSecu = numSecuInput.value.trim();
    const comment = commentInput.value.trim();
    const selectedProcedures = getSelectedProcedures();

    if (!firstName || !lastName || !email || !numSecu) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const worksheetData = {
        numWorkSheet: Date.now(),
        firstNamePatient: firstName,
        lastNamePatient: lastName,
        emailNamePatient: email,
        numSecuPatient: numSecu,
        comment,
        procedure: selectedProcedures
    };

    try {
        const response = await fetch("/api/admin/gestionWorksheet/create_worksheet", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(worksheetData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erreur lors de la création du worksheet");
            return;
        }

        sessionStorage.setItem("newWorksheet", JSON.stringify(data.worksheet));
        window.location.href = "dashboard_dentiste.html";
        return data.worksheet;

    } catch (err) {
        console.error("Erreur lors de la création du worksheet :", err);
        alert("Erreur serveur lors de la création du worksheet");
    }
}


// ===========================
// Événements
// ===========================
formCreateWorksheet.addEventListener("submit", e => {
    e.preventDefault();
    createWorksheet();
});

btnAccueil.addEventListener("click", () => {
    window.location.href = "dashboard_dentiste.html";
});

document.addEventListener("DOMContentLoaded", () => {
    loadProthesistProcedure();
    loadUserInfo();
});

btnValidate.addEventListener("click", async e => {
    e.preventDefault();

    const worksheet = await createWorksheet(); // option pour ne pas modifier le status

    try {
        const response = await fetch(`/api/admin/gestionWorksheet/update_status/${worksheet._id}`, {
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

        alert("Worksheet créée et envoyée au prothésiste !");
        window.location.href = "dashboard_dentiste.html";

    } catch (err) {
        console.error("Erreur validateAndSendWorksheet:", err);
        alert("Erreur serveur lors de l'envoi");
    }
});