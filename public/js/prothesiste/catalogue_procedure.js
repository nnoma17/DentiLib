import { loadUserInfo } from "../userInfo.js";

const procedureTableBody = document.getElementById("procedureTableBody");
const homePageBtn = document.getElementById("homePage");

let allProcedures = [];
let prothesist = null;

//---------------------------------
//   Donne les info du prothésiste
//---------------------------------

async function loadUserInfoAndData() {
    try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        const [proceduresRes, catalogueRes] = await Promise.all([
            fetch("/api/prothesiste/get_all_procedures", { headers }),
            fetch("/api/prothesiste/get_catalogue", { headers })
        ]);

        const [proceduresData, catalogueData] = await Promise.all([
            proceduresRes.json(),
            catalogueRes.json()
        ]);

        if (!proceduresData.success) throw new Error("Impossible de récupérer les procédures");
        if (!catalogueData.success) throw new Error("Impossible de récupérer le catalogue");

        allProcedures = proceduresData.procedures || [];

        // Map idProcedure → price pour lookup O(1)
        const priceMap = {};
        (catalogueData.catalogue || []).forEach(c => {
            priceMap[c.idProcedure] = c.price;
        });

        displayProcedures(allProcedures, priceMap);

    } catch (err) {
        console.error("loadUserInfoAndData:", err);
    }
}

//-----------------------
//   Affichage des actes
//-----------------------
function displayProcedures(procedures, priceMap = {}) {
    procedureTableBody.innerHTML = "";

    if (!procedures.length) {
        procedureTableBody.innerHTML = `<tr><td colspan="4">Aucune procédure disponible</td></tr>`;
        return;
    }

    procedures.forEach(proc => {
        const price = priceMap[proc.idProcedure] ?? 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${proc.name}</td>
            <td>${proc.description}</td>
            <td>
                <input type="number" min="0" value="${price}" data-id="${proc.idProcedure}" class="price-input">
            </td>
            <td>
                <button class="btn-save" data-id="${proc.idProcedure}">Enregistrer</button>
            </td>
        `;
        procedureTableBody.appendChild(tr);
    });

    attachSaveListeners();
}

//-----------------------
//   EventListener
//-----------------------
document.addEventListener("DOMContentLoaded", async () => {
    loadUserInfo();
    await loadUserInfoAndData();
});

//Modification des prix
function attachSaveListeners() {
    const saveButtons = procedureTableBody.querySelectorAll(".btn-save");

    saveButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const procId = btn.dataset.id;
            const input = procedureTableBody.querySelector(`.price-input[data-id="${procId}"]`);
            let price = Number(input.value);

            if (price < 0) price = 0;

            try {
                const response = await fetch(`/api/prothesiste/update_procedure_price/${procId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ price })
                });

                const data = await response.json();
                if (!response.ok) {
                    alert(data.message || "Erreur lors de la mise à jour");
                    return;
                }

                alert("Prix mis à jour !");

            } catch (err) {
                console.error("updateProcedurePrice:", err);
                alert("Erreur serveur lors de la mise à jour");
            }
        });
    });
}

homePageBtn.addEventListener("click", () => {
    window.location.href = "/html/prothesiste/dashboard_prothesiste.html";
});