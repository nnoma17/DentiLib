import { getProcedures } from './procedure.js';

const modalCreation = document.getElementById("modalCreateProcedure");
const spanCloseModalCreation = document.getElementById("close-modal-createProcedure");
const btnCreateProcedure = document.getElementById("createProcedure");

const formCreateProcedure = document.getElementById("createProcedure-form");

// Champs formulaire
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const errorMessage = document.getElementById("errorMessage");

async function createProcedure() {
    try {
        const response = await fetch("/api/admin/gestionProcedure/create_Procedure", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameInput.value.trim(),
                description: descriptionInput.value.trim()
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            console.error("Réponse non JSON :", await response.text());
            throw new Error("Le serveur n'a pas renvoyé un JSON valide");
        }

        if (!response.ok) {
            errorMessage.style.display = "block";
            errorMessage.textContent = data.message || "Erreur lors de la création";
            return;
        }

        // Succès
        getProcedures();
        resetForm();
        modalCreation.style.display = "none";

    } catch (error) {
        console.error("Erreur createProcedure :", error);
        errorMessage.style.display = "block";
        errorMessage.textContent = error.message;
    }
}


function resetForm() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    formCreateProcedure.reset();
}

// Ouvrir la modal
btnCreateProcedure.addEventListener("click", () => {
    resetForm();
    modalCreation.style.display = "flex";
});

// Fermer via la croix
spanCloseModalCreation.addEventListener("click", () => {
    modalCreation.style.display = "none";
    resetForm();
});

// Fermer en cliquant hors modal
window.addEventListener("click", (event) => {
    if (event.target === modalCreation) {
        modalCreation.style.display = "none";
        resetForm();
    }
});

// Soumission formulaire
formCreateProcedure.addEventListener("submit", (e) => {
    e.preventDefault();
    createProcedure();
});
