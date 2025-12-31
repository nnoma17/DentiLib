const procedureTableBody = document.getElementById("procedureTableBody");
const homePageBtn = document.getElementById("homePage");

let allProcedures = [];
let prothesist = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    await loadUserInfoAndData();
});

async function loadUserInfoAndData() {
    // Récupérer info utilisateur complet avec listeActes
    try {
        const response = await fetch("/api/prothesiste/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();
        if (!data.success) throw new Error("Impossible de récupérer les infos utilisateur");

        prothesist = data.user;

        // Récupérer toutes les procédures
        await fetchAndDisplayProcedures();
    } catch (err) {
        console.error("loadUserInfoAndData:", err);
    }
}

/* =========================
   NAVIGATION
========================= */
homePageBtn.addEventListener("click", () => {
    window.location.href = "/html/prothesiste/dashboard_prothesiste.html";
});

/* =========================
   FETCH PROCEDURES
========================= */
async function fetchAndDisplayProcedures() {
    try {
        const response = await fetch("/api/prothesiste/get_all_procedures", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Erreur récupération des procédures");

        const data = await response.json();
        if (!data.success) return;

        allProcedures = data.procedures || [];
        displayProcedures(allProcedures);

    } catch (err) {
        console.error("fetchAndDisplayProcedures:", err);
    }
}

/* =========================
   AFFICHAGE TABLE
========================= */
function displayProcedures(procedures) {
    procedureTableBody.innerHTML = "";

    if (!procedures.length) {
        procedureTableBody.innerHTML = `<tr><td colspan="4">Aucune procédure disponible</td></tr>`;
        return;
    }

    procedures.forEach(proc => {
        // Chercher si le prothésiste a déjà cette procédure
        const existing = prothesist.listeActes?.find(a => String(a.acte._id) === String(proc._id));
        const price = existing ? existing.price : 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${proc.name}</td>
            <td>${proc.description}</td>
            <td>
                <input type="number" min="0" value="${price}" data-id="${proc._id}" class="price-input">
            </td>
            <td>
                <button class="btn-save" data-id="${proc._id}">Enregistrer</button>
            </td>
        `;
        procedureTableBody.appendChild(tr);
    });

    attachSaveListeners();
}

/* =========================
   SAVE PRICE
========================= */
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
