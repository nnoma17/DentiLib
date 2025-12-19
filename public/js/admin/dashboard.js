const userTableBody = document.getElementById("userTableBody");
const disconnectBtn = document.getElementById("disconnect");
const listProcedureBtn = document.getElementById("listProcedure");


async function getUsers() {
    try {
        const response = await fetch("/api/admin/get_All_Users", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) 
            throw new Error("Erreur lors de la récupération des utilisateurs");
        
        let data = await response.json(); // on stocke les users
        displayUsers(data.users); // affiche tout au départ
    } catch (error) {
        //print dans la console
        console.error(error);
    }
}

async function getUserById(idUser) {
    try {
        const response = await fetch(`/api/admin/get_User_ById/${idUser}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) 
            throw new Error("Erreur lors de la récupération des utilisateurs");
        
        let data = await response.json(); // on stocke les users
        return `${data.user.firstName} ${data.user.lastName}`;
    } catch (error) {
        //print dans la console
        console.error(error);
    }
}

async function displayUsers(users) {
    userTableBody.innerHTML = "";
    console.log("users");
    console.log(users);
    for(let user of users){
        const statusClass = user.status === "active" ? "status-active" : "status-inactive";

        const associatedUser = user.associatedUser
            ? await getUserById(user._id)
            : "";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.firstName || ""}</td>
            <td>${user.lastName || ""}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${associatedUser}</td>
            <td><div class="div-button" data-user-id="${user._id}"><span class="status-circle ${statusClass}"></span></div></td>
        `;

        userTableBody.appendChild(row);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    getUsers();
});

disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
});


listProcedureBtn.addEventListener("click", () => {
    window.location.href = "./procedure.html";
});