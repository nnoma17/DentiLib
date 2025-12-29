import { loadUserInfo, getUserById } from '../userInfo.js';

const userTableBody = document.getElementById("userTableBody");
const disconnectBtn = document.getElementById("disconnect");
const listProcedureBtn = document.getElementById("listProcedure");

// Filtres
const professionalFilter = document.getElementById("professional-value");
const nameFilter = document.getElementById("filter-name");

// Modal
const modalModifyUser = document.getElementById("modalModifyUser");
const spanCloseModalModify = document.getElementById("close-modal-modifyUser");

// Champs modal
const formModifyUser = document.getElementById("modifyUser-form");
const inputFirstName = document.getElementById("firstName-modifyUser");
const inputLastName = document.getElementById("lastName-modifyUser");
const inputEmail = document.getElementById("email-modifyUser");
const inputRole = document.getElementById("role-modifyUser");
const listDentisteSelect = document.getElementById("listDentiste-modifyUser");
const inputSiret = document.getElementById("siret-modifyUser");
const inputPassword = document.getElementById("password-modifyUser");
const divListDentisteModify = document.getElementById("div-list-dentiste-modifyUser");

// Variable
let userToEditId = null; //Pour la modification
let confirmTimeout; //Pour la suppression
let allUsers = []; //Pour les filtre

export async function getUsers() {
    try {
        const response = await fetch("/api/admin/get_All_Users_Not_Admin", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des utilisateurs");
        }

        const data = await response.json();
        allUsers = data.users;
        applyFilters(); // 🔹 applique filtres par défaut

    } catch (error) {
        console.error(error);
    }
}

//------------------------
//        FILTRES
//------------------------
function applyFilters() {
    const selectedRole = professionalFilter.value; // ALL | DENTISTE | PROTHESISTE
    const search = nameFilter.value.toLowerCase().trim();

    const filteredUsers = allUsers.filter(user => {

        // Filtre rôle
        if (selectedRole !== "ALL" && user.role !== selectedRole) {
            return false;
        }

        // Filtre nom + prénom
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
        if (search && !fullName.includes(search)) {
            return false;
        }

        return true;
    });

    displayUsers(filteredUsers);
}

professionalFilter.addEventListener("change", applyFilters);
nameFilter.addEventListener("input", applyFilters);

//------------------------
//     AFFICHAGE TABLE
//------------------------
async function displayUsers(users) {
    userTableBody.innerHTML = "";

    for (const user of users) {

        let associatedUser = "-";

        if (user.associatedUser) {
            try {
                const result = await getUserById(user.associatedUser);
                associatedUser = result ? result : "-";
            } catch (e) {
                associatedUser = "-";
            }
        }
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.lastName || ""}</td>
            <td>${user.firstName || ""}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${associatedUser}</td>
            <td>
                <div class="div-button inline-fields" data-user-id="${user._id}">
                    <div class="inline">
                        <button class="btn-action modify modify-user" data-tooltip="Modifier"></button>
                        <button class="btn-action delete delete-user" data-tooltip="Supprimer"></button>
                    </div>
                </div>
            </td>
        `;

        // ------ Suppression -----
        // ------------------------
        const deleteBtn = row.querySelector(".delete-user");
        deleteBtn.addEventListener("click", () => {
            if (!deleteBtn.classList.contains("btn-confirm")) {
                deleteBtn.classList.add("btn-confirm");
                clearTimeout(confirmTimeout);
                confirmTimeout = setTimeout(() => {
                    deleteBtn.classList.remove("btn-confirm");
                }, 2000);
            } else {
                deleteUser(user._id);
            }
        });

        // ----- Modification -----
        // ------------------------
        const modifyBtn = row.querySelector(".modify-user");
        modifyBtn.addEventListener("click", () => {

            inputFirstName.value = user.firstName || "";
            inputLastName.value = user.lastName || "";
            inputEmail.value = user.email;
            inputPassword.value = "******";
            inputRole.value = user.role;
            inputSiret.value = user.siret || "";

            // Gestion affichage dentiste
            if (user.role === "PROTHESISTE") {
                divListDentisteModify.style.display = "none";
            } else {
                divListDentisteModify.style.display = "block";
                listDentisteSelect.innerHTML = "";

                if (user.associatedUser) {
                    const option = document.createElement("option");
                    option.value = user.associatedUser;
                    option.textContent = associatedUser;
                    listDentisteSelect.appendChild(option);
                    listDentisteSelect.value = user.associatedUser;
                }
            }

            userToEditId = user._id;
            modalModifyUser.style.display = "flex";
        });

        userTableBody.appendChild(row);
    }
}

//--------------------
//    Suppression
//--------------------
async function deleteUser(id) {
    try {
        const response = await fetch(`/api/admin/delete_User/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            throw new Error("Erreur suppression");
        }

        // Mise à jour locale
        allUsers = allUsers.filter(user => user._id !== id);
        applyFilters();

    } catch (error) {
        console.error(error);
    }
}

//--------------------
//    Modification
//--------------------
async function modifyUser(idUser) {

    const updatedUser = {
        firstName: inputFirstName.value.trim(),
        lastName: inputLastName.value.trim(),
        email: inputEmail.value.trim(),
        role: inputRole.value,
        siret: inputSiret.value.trim(),
        password: inputPassword.value === "******" ? undefined : inputPassword.value,
        associatedUser: inputRole.value === "PROTHESISTE"
            ? null
            : listDentisteSelect.value
    };

    try {
        const response = await fetch(`/api/admin/update_User/${idUser}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(updatedUser)
        });

        if (!response.ok) {
            throw new Error("Erreur modification");
        }

        modalModifyUser.style.display = "none";
        formModifyUser.reset();
        getUsers();

    } catch (error) {
        console.error(error);
        alert("Impossible de modifier l'utilisateur");
    }
}

//---------------
//   addEvent
//---------------
document.addEventListener("DOMContentLoaded", () => {
    getUsers();
    loadUserInfo();
});

disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
});

listProcedureBtn.addEventListener("click", () => {
    window.location.href = "./procedure.html";
});

spanCloseModalModify.onclick = () => {
    modalModifyUser.style.display = "none";
};

window.addEventListener("click", (event) => {
    if (event.target === modalModifyUser) {
        modalModifyUser.style.display = "none";
        formModifyUser.reset();
    }
});

formModifyUser.addEventListener("submit", (e) => {
    e.preventDefault();
    modifyUser(userToEditId);
});
