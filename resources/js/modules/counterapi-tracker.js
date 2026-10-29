// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────── resources/js/modules/counterapi-tracker.js ──────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Analytics Tracker
// Records page visit metrics via CounterAPI for privacy-focused site statistics.

(() => {
    "use strict";

    const CONFIG_URL = new URL("../../data/analytics.json", import.meta.url);
    const COUNTER_API_URL = "https://api.counterapi.dev/v2/";
    const ADMIN_PATH = new URL("../../../admin/", import.meta.url).pathname;
    let requestSequence = 0;

    function normalizePath(path) {
        const segments = path.split("/").filter(Boolean);
        if (segments[segments.length - 1]?.toLowerCase() === "index.html") segments.pop();
        return segments.length ? `/${segments.join("/")}/` : "/";
    }

    async function incrementCounter(workspace, name) {
        const url = new URL(
            `${encodeURIComponent(workspace)}/${encodeURIComponent(name)}/up`,
            COUNTER_API_URL
        );
        url.searchParams.set("_", `${Date.now()}-${requestSequence++}`);
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not increment counter "${name}" (HTTP ${response.status}).`);
        const result = await response.json();
        if (!result || result.code !== "200") {
            throw new Error(`CounterAPI could not increment counter "${name}".`);
        }
    }

    async function startTracking() {
        const response = await fetch(CONFIG_URL);
        if (!response.ok) throw new Error(`Could not load analytics settings (HTTP ${response.status}).`);

        const config = await response.json();
        if (config.enabled !== true || typeof config.workspace !== "string" || !config.workspace.trim()) return;
        if (!config.counters || typeof config.counters.pageViewsTotal !== "string" ||
            !config.counters.pageViewsTotal.trim() ||
            typeof config.counters.adminPageViews !== "string" ||
            !config.counters.adminPageViews.trim() || !Array.isArray(config.pages) ||
            config.pages.some((page) => !page || typeof page.path !== "string" ||
                typeof page.counter !== "string" || !page.counter.trim())) {
            throw new Error("Analytics settings are missing the total, admin, or per-page counter names.");
        }

        const isAdminPage = window.location.pathname.startsWith(ADMIN_PATH);
        const page = config.pages.find((entry) => entry.path === normalizePath(window.location.pathname));
        if (!isAdminPage && !page) return;

        const workspace = config.workspace.trim();
        const trackedCounters = isAdminPage
            ? [config.counters.adminPageViews]
            : [config.counters.pageViewsTotal, page.counter];
        const results = await Promise.allSettled(
            trackedCounters.map((name) => incrementCounter(workspace, name))
        );

        const failures = results.filter((result) => result.status === "rejected");
        if (failures.length) {
            for (const failure of failures) {
                console.error("CounterAPI tracking request failed.", failure.reason);
            }
        }
    }

    startTracking().catch((error) => {
        console.error("CounterAPI analytics could not start.", error);
    });
})();
