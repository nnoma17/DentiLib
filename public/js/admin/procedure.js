// ==========================
//  ELEMENTS DOM
// ==========================
const procedureTableBody = document.getElementById("procedureTableBody");
const btnAccueil = document.getElementById("homePage");

const modalModifyProcedure = document.getElementById("modalModifyProcedure");
const spanCloseModalModify = document.getElementById("close-modal-modifyPocedure");

// Formulaire modification
const formModifyProcedure = document.getElementById("modifyProcedure-form");
const inputName = document.getElementById("modifyName");
const inputDescription = document.getElementById("modifyDescription");

// ==========================
//  VARIABLES
// ==========================
let procedureToEditId = null;

// ==========================
//  RECUPERATION DES ACTES
// ==========================
export async function getProcedures() {
    try {
        const response = await fetch(
            "/api/admin/gestionProcedure/get_All_Procedures",
            {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des actes");
        }

        const data = await response.json();
        displayProcedures(data.procedures);

    } catch (error) {
        console.error("Erreur getProcedures :", error);
    }
}

// ==========================
//  AFFICHAGE TABLE
// ==========================
function displayProcedures(procedures) {
    if (!procedureTableBody) return;

    procedureTableBody.innerHTML = "";

    for (const procedure of procedures) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${procedure.name || ""}</td>
            <td>${procedure.description || ""}</td>
            <td>
                <div class="div-button inline-fields">
                    <div class="inline">
                        <button class="btn-action modify modify-procedure"></button>
                        <button class="btn-action delete delete-procedure"></button>
                    </div>
                </div>
            </td>
        `;

        // --- SUPPRESSION ---
        const deleteBtn = row.querySelector(".delete-procedure");
        deleteBtn.addEventListener("click", () => {

            if (!deleteBtn.classList.contains("btn-confirm")) {
                deleteBtn.classList.add("btn-confirm");
                clearTimeout(confirmTimeout);
                confirmTimeout = setTimeout(() => {
                    deleteBtn.classList.remove("btn-confirm");
                }, 2000);
            } else {
                deleteProcedure(procedure._id);
            }
        });

        // --- MODIFICATION ---
        const modifyBtn = row.querySelector(".modify-procedure");
        modifyBtn.addEventListener("click", () => {
            inputName.value = procedure.name;
            inputDescription.value = procedure.description;

            procedureToEditId = procedure._id;
            modalModifyProcedure.style.display = "flex";
        });

        procedureTableBody.appendChild(row);
    }
}

// ==========================
//  SUPPRESSION
// ==========================
async function deleteProcedure(id) {
    try {
        await fetch(
            `/api/admin/gestionProcedure/delete_Procedure/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );

        getProcedures();

    } catch (error) {
        console.error("Erreur deleteProcedure :", error);
    }
}

// ==========================
//  MODIFICATION
// ==========================
async function modifyProcedure(id) {
    try {
        const response = await fetch(
            `/api/admin/gestionProcedure/modify_Procedure/${id}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: inputName.value.trim(),
                    description: inputDescription.value.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erreur lors de la modification de l'acte");
            return;
        }

        modalModifyProcedure.style.display = "none";
        formModifyProcedure.reset();
        getProcedures();

    } catch (error) {
        console.error("Erreur modifyProcedure :", error);
    }
}

// ==========================
//  EVENTS
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    getProcedures();
});

if (btnAccueil) {
    btnAccueil.addEventListener("click", () => {
        window.location.href = "./dashboard_Admin.html";
    });
}

spanCloseModalModify.onclick = () => {
    modalModifyProcedure.style.display = "none";
};

window.addEventListener("click", (event) => {
    if (event.target === modalModifyProcedure) {
        modalModifyProcedure.style.display = "none";
        formModifyProcedure.reset();
    }
});

formModifyProcedure.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!procedureToEditId) return;

    modifyProcedure(procedureToEditId);
});
