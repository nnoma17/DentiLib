const userTableBody = document.getElementById("userTableBody");

document.addEventListener("DOMContentLoaded", () => {
    let allUsers = [];
    
    async function fetchUsers() {
        try {
            const response = await fetch("/api/admin/get_All_Users", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
            
            data = await response.json(); // on stocke les users
            displayUsers(data.users); // affiche tout au départ
        } catch (error) {
            //print dans la console
            console.error(error);
        }
    }

    function displayUsers(users) {
        userTableBody.innerHTML = "";
            console.log("users");
            console.log(users);
            for(let user of users){
                
                const statusClass = user.status === "active" ? "status-active" : "status-inactive";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.firstName || ""}</td>
                    <td>${user.lastName || ""}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td><div class="div-button"><span><a href="detailUser.html?id=${user._id}" class="user-link">Details</a></span><span class="status-circle ${statusClass}"></span></div></td>
                `;
            userTableBody.appendChild(row);
            }
    }

    fetchUsers();
});