import { getUsers } from './dashboard.js';

const modalCreation = document.getElementById("modalCreateProcedure");
const spanCloseModalCreation = document.getElementById("close-modal-createProcedure");
const createProcedureFormElement = document.getElementById("createProcedure-form");
const btnCreateProcedure = document.getElementById("createProcedure");
const btnAddProcedure    = document.getElementById("btnCreateProcedure");
const formCreateProcedure = document.getElementById("createProcedure-form");

//Champs formulaire
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const errorMessage = document.getElementById("errorMessage");

async function createProcedure() {
    try {
        const response = await fetch("/api/admin/gestionProcedure/create_Procedure", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                name: nameInput.value,
                description: descriptionInput.value
            })
        });
        const data = await response.json();
        if (!response.ok){ 
            errorMessage.style.display = "block";
            errorMessage.textContent = data.message;
        } else{
            getProcedures();
            resetForm();
            //Reset du formulaire
        }
        
    } catch (error) {
        console.error(error);
    }
}

function resetForm(){
    // Cacher message d'erreur
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    // Reinitialiser la liste des dentistes
    formCreateProcedure.reset();

}

// Ouvrir la modal
btnCreateProcedure.onclick = function () {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    modalCreation.style.display = "flex";
};

// Fermer via la croix
spanCloseModalCreation.onclick = function () {
    modalCreation.style.display = "none";
    formCreateProcedure.reset();
};

// Fermer en cliquant hors modal
window.addEventListener("click", (event) => {
    if (event.target === modalCreation) {
        modalCreation.style.display = "none";
        formCreateProcedure.reset();
    }
});

//Validation formulaire
formCreateProcedure.addEventListener("submit", (e) => {
    e.preventDefault();
    createProcedure();
});