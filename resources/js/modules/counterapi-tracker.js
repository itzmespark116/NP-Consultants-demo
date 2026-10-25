(() => {
    "use strict";

    const CONFIG_URL = "../resources/data/analytics.json";
    const COUNTER_CLIENT_URL = "https://cdn.jsdelivr.net/npm/counterapi@3.1.0/+esm";
    const SESSION_KEY = "np-counterapi-session-started";

    function getUtcDate() {
        return new Date().toISOString().slice(0, 10);
    }

    function normalizePath(path) {
        const segments = path.split("/").filter(Boolean);
        if (segments[segments.length - 1]?.toLowerCase() === "index.html") segments.pop();
        return segments.length ? `/${segments.join("/")}/` : "/";
    }

    async function startTracking() {
        const response = await fetch(CONFIG_URL);
        if (!response.ok) throw new Error(`Could not load analytics settings (HTTP ${response.status}).`);

        const config = await response.json();
        if (config.enabled !== true || typeof config.workspace !== "string" || !config.workspace.trim()) return;
        const requiredCounters = [
            "pageViewsTotal",
            "sessionsTotal",
            "pageViewsDailyPrefix",
            "sessionsDailyPrefix",
            "pageViewsPerPagePrefix"
        ];
        if (!config.counters || requiredCounters.some((name) =>
            typeof config.counters[name] !== "string" || !config.counters[name].trim()
        ) || !Array.isArray(config.pages) || config.pages.some((page) =>
            !page || typeof page.path !== "string" || typeof page.key !== "string"
        )) {
            throw new Error("Analytics settings are missing counter names or tracked pages.");
        }

        const { Counter } = await import(COUNTER_CLIENT_URL);
        const counter = new Counter({ workspace: config.workspace.trim() });
        const date = getUtcDate();
        const page = config.pages.find((entry) => entry.path === normalizePath(window.location.pathname));
        const requests = [
            counter.up(config.counters.pageViewsTotal),
            counter.up(`${config.counters.pageViewsDailyPrefix}-${date}`)
        ];

        if (page) {
            requests.push(counter.up(`${config.counters.pageViewsPerPagePrefix}-${page.key}`));
        }

        let isNewSession = false;
        try {
            isNewSession = window.sessionStorage.getItem(SESSION_KEY) !== "1";
            if (isNewSession) window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch (error) {
            console.warn("CounterAPI session tracking is unavailable in this browser.", error);
        }

        if (isNewSession) {
            requests.push(
                counter.up(config.counters.sessionsTotal),
                counter.up(`${config.counters.sessionsDailyPrefix}-${date}`)
            );
        }

        const results = await Promise.allSettled(requests);
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
