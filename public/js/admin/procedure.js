const prodecureTableBody = document.getElementById("procedureTableBody");
const btnAcceuil = document.getElementById("homePage");
const modalModifyProcedure = document.getElementById("modalModifyProcedure");
const spanCloseModalModify = document.getElementById("close-modal-modifyPocedure");

//Modal
const formModifyProcedure = document.getElementById("modifyProcedure-form");
const inputName = document.getElementById("modifyName");
const inputDescription = document.getElementById("modifyDescription");

//Variable globale pour garder l'ID de la dépense à modifier
let procedureToEditId = null;

async function getProcedures() {
    try {
        const response = await fetch("/api/admin/gestionProcedure/get_All_Procedures", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!response.ok) 
            throw new Error("Erreur lors de la récupération des utilisateurs");
        
        let data = await response.json(); // on stocke les users
        console.log(data);
        displayProcedures(data.procedures); // affiche tout au départ
    } catch (error) {
        //print dans la console
        console.error(error);
    }
}

async function displayProcedures(procedures) {
    prodecureTableBody.innerHTML = "";
    for(let procedure of procedures){
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${procedure.name || ""}</td>
            <td>${procedure.description || ""}</td>
            <td><div class="div-button inline-fields" data-user-id="${procedure._id}">
                <div class = "inline">
                    <button class ="btn-action modify modify-Prodecure">🖊️</button>
                    <button class ="btn-action delete delete-Prodecure">🗑️</button>
                </div>
            </div></td>
        `;
        
		const deleteBtn = row.querySelector(".delete-Prodecure");
		deleteBtn.addEventListener("click", () => {
			deleteProcedure(procedure._id);
		});

		const modifyBtn = row.querySelector(".modify-Prodecure");
		modifyBtn.addEventListener("click", () => {
			inputName.value = procedure.name;
			inputDescription.value = procedure.description;
            modalModifyProcedure.style.display = "flex";

            procedureToEditId = procedure._id;
            
		});

        prodecureTableBody.appendChild(row);
    }
}

async function deleteProcedure(id){
	await fetch(`/api/admin/gestionProcedure/delete_Procedure/${id}`, {
		method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
	});

    getProcedures();
}

async function modifyProcedure(id) {
    try {
        const response = await fetch(`/api/admin/gestionProcedure/modify_Procedure/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: inputName.value,
                description: inputDescription.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erreur lors de la modification de l'acte");
        } else {
            // Masquer la modal
            modalModifyProcedure.style.display = "none";
            // Recharger la liste des procédures
            getProcedures();
        }
    } catch (error) {
        console.error("Erreur modifyProcedure :", error);
    }
}

//Chargement données 1ere fois
document.addEventListener("DOMContentLoaded", () => {
    getProcedures();
    //loadUserInfo();
});

btnAcceuil.addEventListener("click", () => {
    window.location.href = "./dashboard_Admin.html";
});

// Fermer via la croix
spanCloseModalModify.onclick = function () {
    modalModifyProcedure.style.display = "none";
};

// Fermer en cliquant hors modal
window.addEventListener("click", (event) => {
    if (event.target === modalModifyProcedure) {
        modalModifyProcedure.style.display = "none";
        formModifyProcedure.reset();
    }
});

//Validation formulaire
formModifyProcedure.addEventListener("submit", (e) => {
    e.preventDefault();
    modifyProcedure(procedureToEditId);
})