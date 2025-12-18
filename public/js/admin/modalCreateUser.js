
const modal = document.getElementById("modalCreateUser");
const spanCloseModal = document.getElementById("close-modal-createUser");
const expenseFormElement = document.getElementById("createUser-form");
const btnCreateUser = document.getElementById("createUser");
const btnAddUser = document.getElementById("btnCreate");

//Champs formulaire
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Ouvrir la modal
btnCreateUser.onclick = function () {
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


btnAddUser.addEventListener("click", () => {
    //TODO: si tout est ok
    modal.style.display = "none";
    createUser();
    
})
/*
async function createUser() {
    try {
        const response = await fetch("/api/admin/create_User", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token");
            },
            method: "POST",
            body: JSON.stringify({
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
        
        data = await response.json(); // on stocke les users
        displayUsers(data.users); // affiche tout au départ
    } catch (error) {
        //print dans la console
        console.error(error);
    }
}*/