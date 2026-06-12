import { loadUserInfo } from "../userInfo.js";

const worksheetTableBody = document.getElementById("worksheetTableBody");
const disconnectBtn = document.getElementById("disconnect");
const btnCreateWorksheet = document.getElementById("createWorksheet");

let confirmTimeout = null;

//-----------------------------
//  Affichage des fiches de travaux
//-----------------------------
async function displayWorksheets(worksheets) {
    worksheetTableBody.innerHTML = "";

    for (const worksheet of worksheets) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${worksheet.numWorkSheet}</td>
            <td>${worksheet.firstNamePatient} ${worksheet.lastNamePatient}</td>
            <td>${worksheet.emailNamePatient}</td>
            <td>${worksheet.numSecuPatient}</td>
            <td>${worksheet.status}</td>
            <td>
                <div class="div-button inline-fields" data-worksheet-id="${worksheet.idWorkSheet}">
                    <button class="btn-action detail-worksheet">Détail</button>
                    <button class="btn-action delete delete-worksheet icon-action"></button>
                </div>
            </td>
        `;

        const status = worksheet.status;
        const canDelete = status === "A valider" || status === "Termine";

        const deleteBtn = row.querySelector(".delete-worksheet");

        

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
        const detailBtn = row.querySelector(".detail-worksheet");
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
        worksheetTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Erreur lors du chargement des worksheets</td></tr>`;
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
