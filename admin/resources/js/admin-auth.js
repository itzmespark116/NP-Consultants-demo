// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────── admin/resources/js/admin-auth.js ───────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Authentication Guard
// Validates session credentials against admin/credentials.json and redirects unauthorized users.

(() => {
    "use strict";

    const adminRoot = new URL("../../", document.currentScript.src).pathname;
    const loginPath = `${adminRoot}login/`;
    document.documentElement.style.visibility = "hidden";

    let isAuthenticated = false;
    try {
        isAuthenticated = window.sessionStorage.getItem("np-admin-authenticated") === "1";
    } catch (error) {
        console.warn("Admin session storage is unavailable in this browser.", error);
    }

    if (window.location.pathname.startsWith(loginPath)) {
        document.documentElement.style.visibility = "";
        return;
    }

    if (!isAuthenticated) {
        const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
        return;
    }

    document.documentElement.style.visibility = "";
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-admin-logout]").forEach((button) => {
            button.addEventListener("click", () => {
                try {
                    window.sessionStorage.removeItem("np-admin-authenticated");
                } catch (error) {
                    console.warn("Admin session could not be cleared in this browser.", error);
                }
                window.location.replace(loginPath);
            });
        });
    });
})();
