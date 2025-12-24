const titleNameUser = document.getElementById("TitleNameUser");

function parseJwt (token) {
    try {
        console.log(token.split('.'));
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export async function loadUserInfo(){
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload || !payload.id) return;

    const fullName = await getUserById(payload.id);
    titleNameUser.textContent = fullName || "Utilisateur";
}


export async function getUserById(idUser) {
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