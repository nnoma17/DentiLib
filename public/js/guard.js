export function guardPage(...roles) {
    const goLogin = () => location.replace("/html/login.html");
    const token = localStorage.getItem("token");
    if (!token) return goLogin();

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        if (!roles.includes(payload.role)) {
            const msg = encodeURIComponent("Accès non autorisé pour votre rôle");
            location.replace(`/html/403.html?message=${msg}`);
            return;
        }
        document.documentElement.style.visibility = "visible";
    } catch {
        goLogin();
    }
}