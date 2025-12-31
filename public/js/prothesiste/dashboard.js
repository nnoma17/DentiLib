const worksheetTableBody = document.getElementById("worksheetTableBody");
const disconnectBtn = document.getElementById("disconnect");
const catalogProcedureBtn = document.getElementById("catalogProcedure");

const filterPatientNameInput = document.getElementById("filter-patient-name");
const filterStatusSelect = document.getElementById("filter-status");

let allWorksheets = [];

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    fetchAndDisplayWorksheets();
});

/* =========================
   FETCH WORKSHEETS ASSOCIÉS
========================= */
async function fetchAndDisplayWorksheets() {
    try {
        const response = await fetch("/api/worksheet/associated", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Erreur récupération worksheets");

        const data = await response.json();

        if (!data.success) {
            displayWorksheets([]);
            return;
        }

        console.log("WORKSHEETS =", data.worksheets);

        allWorksheets = data.worksheets || [];

        populateStatusFilter(allWorksheets);
        displayWorksheets(allWorksheets);

    } catch (error) {
        console.error(error);
        worksheetTableBody.innerHTML =
            `<tr><td colspan="6">Erreur récupération worksheets</td></tr>`;
    }
}

/* =========================
   AFFICHAGE TABLE
========================= */
function displayWorksheets(worksheets) {
    worksheetTableBody.innerHTML = "";

    if (!worksheets.length) {
        worksheetTableBody.innerHTML =
            `<tr><td colspan="6">Aucune fiche disponible</td></tr>`;
        return;
    }

    worksheets.forEach(ws => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${ws.numWorkSheet}</td>
            <td>${ws.firstNamePatient} ${ws.lastNamePatient}</td>
            <td>${ws.emailNamePatient}</td>
            <td>${ws.numSecuPatient}</td>
            <td>${ws.status}</td>
            <td>
                <button class="btn-action detail-btn" data-id="${ws._id}">
                    Détail
                </button>
            </td>
        `;

        tr.querySelector(".detail-btn").addEventListener("click", () => {
            window.location.href =
                `/html/prothesiste/worksheet_detail.html?id=${ws._id}`;
        });

        worksheetTableBody.appendChild(tr);
    });
}

/* =========================
   FILTRES
========================= */
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

filterPatientNameInput.addEventListener("input", applyFilters);
filterStatusSelect.addEventListener("change", applyFilters);

/* =========================
   STATUTS
========================= */
function populateStatusFilter(worksheets) {
    const statuses = [...new Set(worksheets.map(ws => ws.status))];

    filterStatusSelect.innerHTML =
        `<option value="ALL">Tous</option>`;

    statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        filterStatusSelect.appendChild(option);
    });
}

/* =========================
   NAVIGATION
========================= */
catalogProcedureBtn.addEventListener("click", () => {
    window.location.href =
        "/html/prothesiste/catalogue_procedure.html";
});

/* =========================
   DÉCONNEXION
========================= */
disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
});
