const params = new URLSearchParams(window.location.search);
const message = params.get("message") || "Accès non autorisé pour votre rôle.";

document.getElementById("errorDetails").textContent = message;

document.getElementById("loginButton").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/html/login.html";
});