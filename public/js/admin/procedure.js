import { createCell, createRow, clearElement } from "../domUtils.js";
import { guardPage } from "../guard.js";
guardPage("ADMIN");

const procedureTableBody = document.getElementById("procedureTableBody");
const btnAccueil = document.getElementById("homePage");

const modalModifyProcedure = document.getElementById("modalModifyProcedure");
const spanCloseModalModify = document.getElementById("close-modal-modifyPocedure");

// Formulaire modification
const formModifyProcedure = document.getElementById("modifyProcedure-form");
const inputName = document.getElementById("modifyName");
const inputDescription = document.getElementById("modifyDescription");

let procedureToEditId = null;
let confirmTimeout;

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

function displayProcedures(procedures) {
    if (!procedureTableBody) return;

    // Injection en textContent : neutralise les injections de script (XSS).
    clearElement(procedureTableBody);

    for (const procedure of procedures) {
        const row = createRow([
            createCell(procedure.name || ""),
            createCell(procedure.description || "")
        ], ["Actes", "Descriptions"]);

        // --- Colonne actions ---
        const actionsCell = createCell("", "", "Actions");
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "div-button inline-fields";

        const inlineDiv = document.createElement("div");
        inlineDiv.className = "inline";

        const modifyBtn = document.createElement("button");
        modifyBtn.className = "btn-action modify modify-procedure";
        modifyBtn.type = "button";
        modifyBtn.dataset.tooltip = "Modifier";
        modifyBtn.setAttribute("aria-label", `Modifier l'acte ${procedure.name || ""}`);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-action delete delete-procedure";
        deleteBtn.type = "button";
        deleteBtn.dataset.tooltip = "Supprimer";
        deleteBtn.setAttribute("aria-label", `Supprimer l'acte ${procedure.name || ""}`);

        inlineDiv.appendChild(modifyBtn);
        inlineDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(inlineDiv);
        actionsCell.appendChild(actionsDiv);
        row.appendChild(actionsCell);

        // --- SUPPRESSION ---
        deleteBtn.addEventListener("click", () => {

            if (!deleteBtn.classList.contains("btn-confirm")) {
                deleteBtn.classList.add("btn-confirm");
                clearTimeout(confirmTimeout);
                confirmTimeout = setTimeout(() => {
                    deleteBtn.classList.remove("btn-confirm");
                }, 2000);
            } else {
                deleteProcedure(procedure.idProcedure);
            }
        });

        // --- MODIFICATION ---
        modifyBtn.addEventListener("click", () => {
            inputName.value = procedure.name;
            inputDescription.value = procedure.description;

            procedureToEditId = procedure.idProcedure;
            modalModifyProcedure.style.display = "flex";
        });

        procedureTableBody.appendChild(row);
    }
}

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
