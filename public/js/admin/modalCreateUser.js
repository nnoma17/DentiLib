import { getUsers } from './dashboard.js';
import { guardPage } from "../guard.js";
guardPage("ADMIN");

const modal = document.getElementById("modalCreateUser");
const spanCloseModal = document.getElementById("close-modal-createUser");
const expenseFormElement = document.getElementById("createUser-form");
const btnCreateUser = document.getElementById("createUser");
const btnAddUser = document.getElementById("btnCreate");
const formCreateUser = document.getElementById("createUser-form");

//Champs formulaire
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const roleSelect = document.getElementById("role");
const siretInput = document.getElementById("siret");
const passwordInput = document.getElementById("password");
const divListDentisteSelect = document.getElementById("div-list-dentiste");
const listDentisteSelect = document.getElementById("listDentiste");
const errorMessage = document.getElementById("errorMessage");

/**
 * Valide le formulaire de creation d'utilisateur cote client.
 * @returns {boolean} true si le formulaire est valide
 */
function validateCreateUserForm() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    const password = passwordInput.value;

    if (!firstName || !lastName || !email || !password) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Champs manquants";
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Le format de l'email est incorrect";
        emailInput.focus();
        return false;
    }

    if (password.length < 6) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Mot de passe trop court";
        passwordInput.focus();
        return false;
    }

    if (!role || role === "N/A") {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Veuillez choisir un rôle";
        roleSelect.focus();
        return false;
    }

    // Le prothesiste doit etre rattache a un dentiste.
    if (role === "PROTHESISTE" && !listDentisteSelect.value) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Veuillez sélectionner un dentiste";
        listDentisteSelect.focus();
        return false;
    }

    return true;
}

async function createUser() {
    // Validation client avant l'appel serveur.
    if (!validateCreateUserForm()) {
        return;
    }

    try {
        const response = await fetch("/api/admin/create_User", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                firstName: firstNameInput.value.trim(),
                lastName: lastNameInput.value.trim(),
                email: emailInput.value.trim(),
                role: roleSelect.value,
                siret: siretInput.value.trim(),
                password: passwordInput.value,
                dentisteId: roleSelect.value === "PROTHESISTE"
                    ? listDentisteSelect.value
                    : null
            })
        });
        const data = await response.json();
        
        if (!response.ok){ 
            errorMessage.style.display = "block";
            errorMessage.textContent = data.message;
        } else{
            getUsers();
            resetForm();
        }
        
    } catch (error) {
        console.error(error);
    }
}

function resetForm(){
    // Cacher message d'erreur
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    
    //Choisir un rôle par defaut
    roleSelect.selectedIndex = 0; 

    // Reinitialiser la liste des dentistes
    divListDentisteSelect.style.display = "none";
    listDentisteSelect.required = false;
    listDentisteSelect.innerHTML = '<option value="">-- Sélectionner un dentiste --</option>'; //Evite les Doublons
    formCreateUser.reset();

}

async function fetchDentists() {
    try {
        const response = await fetch("/api/admin/get_All_Dentists", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        
        let data = await response.json();
        displayDentist(data.users);
    } catch (error) {
        console.error(error);
    }    
}

function displayDentist(users){

    for(let user of users){
        if(!user.associatedUser){
            const option = document.createElement("option");
            option.value = user.id_user;
            option.textContent = `${user.firstName} ${user.lastName}`;
            listDentisteSelect.appendChild(option);
        }
    }
}

// Ouvrir la modal
btnCreateUser.onclick = function () {
    
    //Cache le btn Modifier et affiche le btn Ajouter
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    modal.style.display = "flex";
};

// Fermer via la croix
spanCloseModal.onclick = function () {
    modal.style.display = "none";
    expenseFormElement.reset();
};

// Fermer en cliquant hors modal
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
        expenseFormElement.reset();
    }
};

//Validation formulaire
formCreateUser.addEventListener("submit", (e) => {
    e.preventDefault();
    createUser();
    
})

//Selection Role
roleSelect.addEventListener("change", () => {
    const role = roleSelect.value;
    if (role === "PROTHESISTE") { // devient visible
        fetchDentists();
        divListDentisteSelect.style.display = "block";
        listDentisteSelect.required = true;

    } else {
        divListDentisteSelect.style.display = "none";
        //L'élément séléectionné par defaut est le premier qui n'a pas de valeur
        
        // Réinitialise la sélection
        listDentisteSelect.selectedIndex = 0;

        // Retire l’obligation si le champ n’est pas visible
        listDentisteSelect.required = false;
    }

});