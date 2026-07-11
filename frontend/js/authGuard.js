// js/authGuard.js

(function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
    }
})();
