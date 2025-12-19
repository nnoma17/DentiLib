const loginForm = document.getElementById("loginForm");
const emailLogin = document.getElementById("email");
const passwordLogin = document.getElementById("password");
const errorLogin = document.getElementById("errorLogin");

const params = new URLSearchParams(window.location.search)
token = params.get('token')
if (token){
  localStorage.setItem("token",token)
  window.location.href = 'home.html'
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Nettoyage des champs
        const email = emailLogin.value.trim();
        const password = passwordLogin.value.trim();

        // Vérification des champs vides
        if (!email || !password) {
            errorLogin.textContent = "Veuillez remplir tous les champs";
            errorLogin.style.display = "block";
            return;
        }

        //Le format de l'email est incorrect
        //expliquation de la regex :
        //^[^\s@]+      : commence par un ou plusieurs caractères qui ne sont pas des espaces ou des @
        //@             : suivi d'un @
        //[^\s@]+       : suivi d'un ou plusieurs caractères qui ne sont pas des espaces ou des @
        //\.            : suivi d'un point littéral
        //[^\s@]+$      : se termine par un ou plusieurs caractères qui ne sont pas des espaces ou des @
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            errorLogin.textContent = "Le format de l'email est incorrect";
            errorLogin.style.display = "block";
            return;
        }

        try {
            //On peut ajouter http://localhost:3000 mais ce n'est pas obligatoire si le front et le back sont sur le même serveur 
            const res = await fetch("http://localhost:3000/api/user/login_User", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email : email, 
                    password : password 
                }),
            });

            const responseData = await res.json();
            console.log("Réponse :", responseData); //A SUPPRIMER

            if (res.ok && responseData.token) {
                // Stockage du token
                localStorage.setItem("token", responseData.token);

                // Vérification sécurisée du rôle (avec gestion des majuscules)
                const role = responseData.role;
                switch(role) {
                    case "ADMIN": window.location.href = "/html/admin/dashboard_admin.html"; break;
                    case "DENTISTE": window.location.href = "/html/admin/dashboard_dentiste.html"; break;
                    case "PROTHESISTE": window.location.href = "/html/admin/dashboard_prothesiste.html"; break;
                }
                
            } else {
                errorLogin.textContent = responseData.message;
                errorLogin.style.display = "block";
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);
            errorLogin.textContent = "Une erreur est survenue. Veuillez réessayer.";
            errorLogin.style.display = "block";
        }
    });
}