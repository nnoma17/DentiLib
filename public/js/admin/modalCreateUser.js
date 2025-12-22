
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

async function createUser() {
    try {
        const response = await fetch("/api/admin/create_User", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                role: roleSelect.value,
                siret: siretInput.value,
                password: passwordInput.value,
                dentisteId: listDentisteSelect.value
            })
        });
        const data = await response.json();
        if (!response.ok){ 
            errorMessage.style.display = "block";
            errorMessage.textContent = data.message;
        } else{
            getUsers();
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
    console.log(users);

    for(let user of users){
        if(!user.associatedUser){
            console.log(user.associatedUser);
            const option = document.createElement("option");
            option.value = user._id;
            option.textContent = `${user.firstName} ${user.lastName}`;
            listDentisteSelect.appendChild(option);
        }
    }
}

// Ouvrir la modal
btnCreateUser.onclick = function () {
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