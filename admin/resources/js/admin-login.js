// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────── admin/resources/js/admin-login.js ───────────────────────
// ────────────────────────────────────────────────────────────────────────────────
(() => {
    "use strict";

    const form = document.getElementById("admin-login-form");
    const username = document.getElementById("admin-username");
    const password = document.getElementById("admin-password");
    const message = document.getElementById("admin-login-message");
    const adminRoot = new URL("../", window.location.href).pathname;
    const loginPath = `${adminRoot}login/`;

    function showMessage(text) {
        message.textContent = text;
        message.hidden = false;
    }

    function getDestination() {
        const requested = new URLSearchParams(window.location.search).get("next");
        if (requested && requested.startsWith(adminRoot) && !requested.startsWith(loginPath)) {
            return requested;
        }
        return adminRoot;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.hidden = true;

        let credentials;
        try {
            const response = await fetch(new URL("admin/credentials.json", document.baseURI), { cache: "no-store" });
            if (!response.ok) throw new Error(`Could not load credentials (HTTP ${response.status}).`);
            credentials = await response.json();
        } catch (error) {
            console.error("Admin credentials could not be loaded.", error);
            showMessage("Could not load login settings. Please try again later.");
            return;
        }

        const accounts = Array.isArray(credentials && credentials.accounts)
            ? credentials.accounts
            : credentials && typeof credentials === "object"
                ? [credentials]
                : [];
        const validAccounts = accounts.filter((account) =>
            account &&
            typeof account.username === "string" &&
            account.username.trim() &&
            typeof account.password === "string" &&
            account.password.trim()
        );
        if (!validAccounts.length) {
            showMessage("Add at least one account with a username and password in admin/credentials.json.");
            return;
        }

        const authenticated = validAccounts.some((account) =>
            username.value === account.username && password.value === account.password
        );
        if (!authenticated) {
            showMessage("That username or password was not recognized.");
            password.value = "";
            password.focus();
            return;
        }

        try {
            window.sessionStorage.setItem("np-admin-authenticated", "1");
        } catch (error) {
            console.error("Admin session could not be saved in this browser.", error);
            showMessage("This browser could not save the admin session. Enable session storage and try again.");
            return;
        }

        window.location.replace(getDestination());
    });
})();
