import { loadUserInfo } from "../userInfo.js";
import { createCell, createRow, clearElement, createErrorRow } from "../domUtils.js";
import { guardPage } from "../guard.js";
import { exportMyData, deleteMyAccount } from "../rgpd.js";

guardPage("PROTHESISTE");

const worksheetTableBody = document.getElementById("worksheetTableBody");
const disconnectBtn = document.getElementById("disconnect");
const catalogProcedureBtn = document.getElementById("catalogProcedure");

const filterPatientNameInput = document.getElementById("filter-patient-name");
const filterStatusSelect = document.getElementById("filter-status");

let allWorksheets = [];

//------------------------------------
//  Recuperer la liste de ces fiches
//------------------------------------
async function fetchAndDisplayWorksheets() {
    try {
        const response = await fetch("/api/prothesiste/gestionWorksheet/get_all_worksheets", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/html/login.html";
            return;
        }

        if (response.status === 403) {
            const err = await response.json().catch(() => ({}));
            const msg = encodeURIComponent(err.message || "Accès non autorisé");
            window.location.href = `/html/403.html?message=${msg}`;
            return;
        }

        if (!response.ok) throw new Error("Erreur récupération worksheets");

        const data = await response.json();

        if (!data.success) {
            displayWorksheets([]);
            return;
        }


        allWorksheets = data.worksheets || [];

        populateStatusFilter(allWorksheets);
        displayWorksheets(allWorksheets);

    } catch (error) {
        console.error(error);
        clearElement(worksheetTableBody);
        worksheetTableBody.appendChild(createErrorRow(6, "Erreur récupération worksheets"));
    }
}

//--------------------------
//    Affiche les actes
//--------------------------
function displayWorksheets(worksheets) {
    // Injection en textContent : neutralise les injections de script (XSS).
    clearElement(worksheetTableBody);

    if (!worksheets.length) {
        worksheetTableBody.appendChild(createErrorRow(6, "Aucune fiche disponible"));
        return;
    }

    worksheets.forEach(ws => {
        const tr = createRow([
            createCell(ws.numWorkSheet),
            createCell(`${ws.firstNamePatient} ${ws.lastNamePatient}`),
            createCell(ws.emailNamePatient),
            createCell(ws.numSecuPatient),
            createCell(ws.status)
        ], ["Numéro", "Patient", "Email", "Numéro sécurité", "Statut"]);

        // --- Colonne actions ---
        const actionsCell = createCell("", "", "Actions");
        const detailBtn = document.createElement("button");
        detailBtn.className = "btn-action detail-btn";
        detailBtn.type = "button";
        detailBtn.dataset.id = ws.idWorkSheet;
        detailBtn.textContent = "Détail";
        actionsCell.appendChild(detailBtn);
        tr.appendChild(actionsCell);

        detailBtn.addEventListener("click", () => {
            window.location.href =
                `/html/prothesiste/worksheet_detail.html?id=${ws.idWorkSheet}`;
        });

        worksheetTableBody.appendChild(tr);
    });
}

function applyFilters() {
    const nameFilter = filterPatientNameInput.value.trim().toLowerCase();
    const statusFilter = filterStatusSelect.value;

    const filtered = allWorksheets.filter(ws => {
        const fullName =
            `${ws.firstNamePatient} ${ws.lastNamePatient}`.toLowerCase();

        return (
            fullName.includes(nameFilter) &&
            (statusFilter === "ALL" || ws.status === statusFilter)
        );
    });

    displayWorksheets(filtered);
}


//--------------------------
//   STATUTS
//--------------------------
function populateStatusFilter(worksheets) {
    const statuses = [...new Set(worksheets.map(ws => ws.status))];

    clearElement(filterStatusSelect);

    const defaultOption = document.createElement("option");
    defaultOption.value = "ALL";
    defaultOption.textContent = "Tous";
    filterStatusSelect.appendChild(defaultOption);

    statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        filterStatusSelect.appendChild(option);
    });
}

//--------------------------
//  EventListener
//--------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    fetchAndDisplayWorksheets();
});

catalogProcedureBtn.addEventListener("click", () => {
    window.location.href =
        "/html/prothesiste/catalogue_procedure.html";
});

filterPatientNameInput.addEventListener("input", applyFilters);

filterStatusSelect.addEventListener("change", applyFilters);

disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
});


//RGPD
document.getElementById("exportData").addEventListener("click", exportMyData);
document.getElementById("deleteAccount").addEventListener("click", deleteMyAccount);