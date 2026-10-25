import { loadUserInfo } from "../userInfo.js";
import { createCell, createRow, clearElement, createErrorRow } from "../domUtils.js";
import { guardPage } from "../guard.js";
import { exportMyData, deleteMyAccount } from "../rgpd.js";

guardPage("DENTISTE");

const worksheetTableBody = document.getElementById("worksheetTableBody");
const disconnectBtn = document.getElementById("disconnect");
const btnCreateWorksheet = document.getElementById("createWorksheet");

let confirmTimeout = null;

//-----------------------------
//  Affichage des fiches de travaux
//-----------------------------
async function displayWorksheets(worksheets) {
    // Les donnees du serveur sont injectees en textContent (pas innerHTML)
    // afin de neutraliser toute injection de script (XSS).
    clearElement(worksheetTableBody);

    for (const worksheet of worksheets) {
        const row = createRow([
            createCell(worksheet.numWorkSheet),
            createCell(`${worksheet.firstNamePatient} ${worksheet.lastNamePatient}`),
            createCell(worksheet.emailNamePatient),
            createCell(worksheet.numSecuPatient),
            createCell(worksheet.status)
        ], ["Numéro", "Patient", "Email", "Numéro sécurité", "Statut"]);

        // --- Colonne actions ---
        const actionsCell = createCell("", "", "Actions");
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "div-button inline-fields";
        actionsDiv.dataset.worksheetId = worksheet.idWorkSheet;

        const detailBtn = document.createElement("button");
        detailBtn.className = "btn-action detail-worksheet";
        detailBtn.type = "button";
        detailBtn.textContent = "Détail";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-action delete delete-worksheet icon-action";
        deleteBtn.type = "button";
        deleteBtn.setAttribute("aria-label", `Supprimer la fiche ${worksheet.numWorkSheet}`);

        actionsDiv.appendChild(detailBtn);
        actionsDiv.appendChild(deleteBtn);
        actionsCell.appendChild(actionsDiv);
        row.appendChild(actionsCell);

        const status = worksheet.status;
        const canDelete = status === "A valider" || status === "Termine";

        /* ----- Btn Suppression ----- */
        deleteBtn.addEventListener("click", () => {
            if (!deleteBtn.classList.contains("btn-confirm")) {
                deleteBtn.classList.add("btn-confirm");
                clearTimeout(confirmTimeout);
                confirmTimeout = setTimeout(() => {
                    deleteBtn.classList.remove("btn-confirm");
                }, 2000);
            } else {
                deleteWorksheet(worksheet.idWorkSheet);
            }
        });

        if (!canDelete) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = "0.3";
            deleteBtn.style.cursor = "not-allowed";
        }

        /* ----- Btn Détail ----- */
        detailBtn.addEventListener("click", () => {
            window.location.href = `worksheet_detail.html?id=${worksheet.idWorkSheet}`;
        });

        worksheetTableBody.appendChild(row);
    }
}

//-------------------------------
//  Récupérer la liste des fiches du dentiste
//------------------------------
async function fetchAndDisplayWorksheets() {
    try {
        const response = await fetch("/api/admin/gestionWorksheet/get_all_worksheet_by_dentiste", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Erreur récupération worksheets");

        const data = await response.json();
        if (data.success) {
            displayWorksheets(data.worksheets);
        }
    } catch (error) {
        console.error("Erreur fetchAndDisplayWorksheets :", error);
        clearElement(worksheetTableBody);
        worksheetTableBody.appendChild(
            createErrorRow(6, "Erreur lors du chargement des worksheets", "text-align:center;color:red;")
        );
    }
}

//--------------------------
//  Suppression de fiches
//--------------------------
async function deleteWorksheet(worksheetId) {
    try {
        const response = await fetch(`/api/admin/gestionWorksheet/delete_worksheet/${worksheetId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression de la worksheet");

        const data = await response.json();

        if (data.success) {
            // Recharger la liste après suppression
            fetchAndDisplayWorksheets();
        } else {
            console.error("Suppression refusée : ", data.message);
        }
    } catch (error) {
        console.error("Erreur deleteWorksheet : ", error);
    }
}

//----------------------
//  EventListener
//----------------------
//Création -> redirection
btnCreateWorksheet.addEventListener("click", () => {
    window.location.href = "/html/dentiste/worksheet.html";
});

//A l'initialisation
document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    fetchAndDisplayWorksheets();
});

//Deconnextion
disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
});

//RGPD
document.getElementById("exportData").addEventListener("click", exportMyData);
document.getElementById("deleteAccount").addEventListener("click", deleteMyAccount);