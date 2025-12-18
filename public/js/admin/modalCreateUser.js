const btnCreateUser = document.getElementById("createUser");
const modal = document.getElementById("modalCreateUser");
const spanCloseModal = document.getElementById("close-modal-createUser");
const expenseFormElement = document.getElementById("createUser-form");

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