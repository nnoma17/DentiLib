const loginForm = document.getElementById("loginForm");
const emailLogin = document.getElementById("email");
const passwordLogin = document.getElementById("password");
const errorLogin = document.querySelector(".error");

const params = new URLSearchParams(window.location.search)
token = params.get('token')
if (token){
  localStorage.setItem("token",token)
  window.location.href = 'home.html' 
}

/**
 * Affiche un message d'erreur a l'utilisateur.
 * @param {string} message
 */
function showError(message) {
    errorLogin.textContent = message;
    errorLogin.style.display = "block";
}

/**
 * Valide le formulaire cote client avant l'envoi au serveur.
 * @returns {boolean} true si le formulaire est valide
 */
function validateLoginForm() {
    const email = emailLogin.value.trim();
    const password = passwordLogin.value;

    if (!email || !password) {
        showError("Veuillez remplir tous les champs");
        return false;
    }

    //Le format de l'email est incorrect
    //expliquation de la regex :
    //^[^\s@]+      : commence par un ou plusieurs caractères qui ne sont pas des espaces ou des @
    //@             : suivi d'un @
    //[^\s@]+       : suivi d'un ou plusieurs caractères qui ne sont pas des espaces ou des @
    //\.            : suivi d'un point littéral
    //[^\s@]+$      : se termine par un ou plusieurs caractères qui ne sont pas des espaces ou des @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Le format de l'email est incorrect");
        emailLogin.focus();
        return false;
    }

    return true;
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Nettoyage des champs
        const email = emailLogin.value.trim();
        const password = passwordLogin.value;

        // Validation client (la validation serveur reste systematique)
        if (!validateLoginForm()) {
            return;
        }

        try {
            const API_BASE_URL = window.location.hostname.includes("localhost")
                ? "http://localhost:3000"
                : "https://dentilib-5sk3.onrender.com";

            const res = await fetch(`${API_BASE_URL}/api/user/login_User`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email : email, 
                    password : password 
                }),
            });

            const responseData = await res.json();

            if (res.ok && responseData.token) {
                // Stockage du token
                localStorage.setItem("token", responseData.token);

                // Vérification sécurisée du rôle (avec gestion des majuscules)
                const role = responseData.role;
                switch(role) {
                    case "ADMIN": window.location.href = "/html/admin/dashboard_admin.html"; break;
                    case "DENTISTE": window.location.href = "/html/dentiste/dashboard_dentiste.html"; break;
                    case "PROTHESISTE": window.location.href = "/html/prothesiste/dashboard_prothesiste.html"; break;
                }
                
            } else {
                showError(responseData.message || "Connexion impossible");
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);
            showError("Une erreur est survenue. Veuillez réessayer.");
        }
    });
}