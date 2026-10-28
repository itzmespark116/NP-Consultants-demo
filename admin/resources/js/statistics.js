// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────── admin/resources/js/statistics.js ───────────────────────
// ────────────────────────────────────────────────────────────────────────────────
(() => {
    "use strict";

    const CONFIG_URL = new URL("resources/data/analytics.json", document.baseURI);
    const COUNTER_API_URL = "https://api.counterapi.dev/v2/";
    const elements = {
        message: document.getElementById("statistics-message"),
        setup: document.getElementById("configuration-state"),
        content: document.getElementById("statistics-content"),
        refresh: document.getElementById("refresh-statistics"),
        totalViews: document.getElementById("metric-total-views"),
        adminViews: document.getElementById("metric-admin-views"),
        todayViews: document.getElementById("metric-today-views"),
        todayDate: document.getElementById("metric-today-date"),
        weekViews: document.getElementById("metric-week-views"),
        weekStart: document.getElementById("metric-week-start"),
        hoursChart: document.getElementById("counter-hours-chart"),
        weekdaysChart: document.getElementById("counter-weekdays-chart"),
        quartersChart: document.getElementById("counter-quarters-chart"),
        pageList: document.getElementById("page-performance-list")
    };
    const numberFormat = new Intl.NumberFormat();
    let config;
    let charts = [];
    let loadInProgress = false;
    let requestSequence = 0;

    function setMessage(message, kind = "info") {
        elements.message.textContent = message;
        elements.message.dataset.kind = kind;
        elements.message.hidden = !message;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) throw new Error("CounterAPI returned an invalid statistics date.");
        return new Intl.DateTimeFormat(undefined, {
            timeZone: "UTC",
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    }

    function getUtcWeekStart() {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
        return date.toISOString();
    }

    function readCount(value, description) {
        const count = Number(value);
        if (!Number.isFinite(count) || count < 0) {
            throw new Error(`CounterAPI returned an invalid count for ${description}.`);
        }
        return count;
    }

    async function getStats(name) {
        const url = new URL(
            `${encodeURIComponent(config.workspace.trim())}/${encodeURIComponent(name)}/stats`,
            COUNTER_API_URL
        );
        url.searchParams.set("_", `${Date.now()}-${requestSequence++}`);
        const response = await fetch(url, { cache: "no-store" });
        if (response.status === 404) {
            throw new Error(`CounterAPI counter "${name}" was not found. Create it in the configured workspace.`);
        }
        if (!response.ok) throw new Error(`Could not load counter "${name}" (HTTP ${response.status}).`);
        const result = await response.json();
        if (!result || result.code !== "200" || !result.data) {
            throw new Error(`CounterAPI returned invalid statistics for "${name}".`);
        }
        return result.data;
    }

    async function getCount(name) {
        const result = await getStats(name);
        return readCount(result.up_count, `"${name}"`);
    }

    function destroyCharts() {
        charts.forEach((chart) => chart.destroy());
        charts = [];
    }

    function chartOptions() {
        const styles = getComputedStyle(document.documentElement);
        const textColor = styles.getPropertyValue("--color-mute").trim();
        const gridColor = styles.getPropertyValue("--border").trim();
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: "#10131a",
                    titleColor: "#f8fafc",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: { label: (context) => `${numberFormat.format(context.parsed.y)} views` }
                }
            },
            scales: {
                x: {
                    grid: { color: "transparent", drawBorder: false },
                    border: { display: false },
                    ticks: { color: textColor, precision: 0, autoSkip: true, font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor, drawBorder: false },
                    border: { display: false },
                    ticks: { color: textColor, precision: 0, autoSkip: true, font: { size: 11 } }
                }
            },
            elements: {
                line: { borderWidth: 2.5, tension: 0.3 },
                point: { radius: 3, hoverRadius: 5, hitRadius: 8 }
            }
        };
    }

    function renderChart(canvas, labels, values) {
        if (typeof window.Chart !== "function") {
            throw new Error("The statistics charts could not load. Check your connection and refresh.");
        }
        charts.push(new window.Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Page views",
                    data: values,
                    borderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue("--accent").trim(),
                    backgroundColor: "transparent",
                    pointBackgroundColor: getComputedStyle(document.documentElement)
                        .getPropertyValue("--accent").trim(),
                    pointBorderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue("--background").trim(),
                    pointBorderWidth: 2,
                    fill: false
                }]
            },
            options: chartOptions()
        }));
    }

    function readTemporalValues(temporal, group, keys) {
        if (!temporal || !temporal[group]) {
            throw new Error(`CounterAPI did not return the ${group} page-view breakdown.`);
        }

        const dataset = temporal[group];
        return keys.map((key) => {
            const direct = dataset[key];
            const candidates = [
                key,
                String(key),
                String(Number(key)),
                String(Number(key)).padStart(2, "0"),
                String(key).replace(/^0+/, "")
            ];
            const match = candidates.find((candidate) => Object.prototype.hasOwnProperty.call(dataset, candidate))
                ?? Object.keys(dataset).find((candidate) => candidate.toLowerCase() === String(key).toLowerCase());
            const value = match ? dataset[match] : direct;
            const raw = value && typeof value === "object" ? value.up : value;
            if (!Number.isFinite(Number(raw))) return 0;
            return readCount(raw, `${group}.${key}`);
        });
    }

    function renderTemporalCharts(temporal) {
        const hourKeys = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
        const weekdayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const quarterKeys = ["q1", "q2", "q3", "q4"];

        renderChart(elements.hoursChart, hourKeys.map((hour) => `${hour}:00`),
            readTemporalValues(temporal, "hours", hourKeys));
        renderChart(elements.weekdaysChart, weekdayKeys.map((day) => day[0].toUpperCase() + day.slice(1)),
            readTemporalValues(temporal, "weekdays", weekdayKeys));
        renderChart(elements.quartersChart, quarterKeys.map((quarter) => quarter.toUpperCase()),
            readTemporalValues(temporal, "quarters", quarterKeys));
    }

    function renderPagePerformance(pages, values, adminViews) {
        const rows = [
            ...pages.map((page, index) => ({ name: page.name, path: page.path, count: values[index] })),
            { name: "Admin area", path: "/admin/", count: adminViews }
        ];
        elements.pageList.replaceChildren();
        const peak = Math.max(1, ...rows.map((row) => row.count));
        rows.forEach((entry) => {
            const row = document.createElement("div");
            row.className = "statistics-page-row";
            if (entry.path === "/admin/") row.classList.add("statistics-page-row--admin");

            const name = document.createElement("span");
            name.className = "statistics-page-row__name";
            name.textContent = entry.name;
            name.title = entry.path;

            const track = document.createElement("span");
            track.className = "statistics-page-row__track";
            track.setAttribute("aria-hidden", "true");
            const bar = document.createElement("span");
            bar.className = "statistics-page-row__bar";
            bar.style.width = `${(entry.count / peak) * 100}%`;
            track.append(bar);

            const count = document.createElement("span");
            count.className = "statistics-page-row__value";
            count.textContent = numberFormat.format(entry.count);

            row.append(name, track, count);
            elements.pageList.append(row);
        });
    }

    function validateConfig(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error("The analytics configuration must be a JSON object.");
        }
        if (value.enabled !== true || typeof value.workspace !== "string" || !value.workspace.trim()) {
            return false;
        }
        if (!value.counters || typeof value.counters.pageViewsTotal !== "string" ||
            !value.counters.pageViewsTotal.trim() || typeof value.counters.adminPageViews !== "string" ||
            !value.counters.adminPageViews.trim() || !Array.isArray(value.pages) ||
            value.pages.length === 0 || value.pages.some((page) =>
                !page || typeof page.name !== "string" || typeof page.path !== "string" ||
                typeof page.counter !== "string" || !page.counter.trim()
            )) {
            throw new Error("The analytics configuration must define total, admin, and per-page counters.");
        }
        return true;
    }

    async function loadDashboard() {
        if (loadInProgress) return;
        loadInProgress = true;
        elements.refresh.disabled = true;
        setMessage("");
        destroyCharts();
        try {
            if (!config) {
                const response = await fetch(CONFIG_URL, { cache: "no-store" });
                if (!response.ok) throw new Error(`Could not load analytics settings (HTTP ${response.status}).`);
                config = await response.json();
            }
            if (!validateConfig(config)) {
                elements.setup.hidden = false;
                elements.content.hidden = true;
                return;
            }

            elements.setup.hidden = true;
            elements.content.hidden = false;
            const [totalStats, adminViews, pageValues] = await Promise.all([
                getStats(config.counters.pageViewsTotal),
                getCount(config.counters.adminPageViews),
                Promise.all(config.pages.map((page) => getCount(page.counter)))
            ]);

            const stats = totalStats.stats;
            if (!stats || !stats.today || !stats.this_week || !stats.temporal) {
                throw new Error("CounterAPI returned incomplete page-view statistics.");
            }
            const totalViews = readCount(totalStats.up_count, "the total page-view counter");
            const todayViews = readCount(stats.today.up, "today's page views");
            const weekViews = readCount(stats.this_week.up, "this week's page views");

            elements.totalViews.textContent = numberFormat.format(totalViews);
            elements.adminViews.textContent = numberFormat.format(adminViews);
            elements.todayViews.textContent = numberFormat.format(todayViews);
            elements.todayDate.textContent = `${formatDate(stats.today.started_at || new Date().toISOString())} (UTC)`;
            elements.weekViews.textContent = numberFormat.format(weekViews);
            elements.weekStart.textContent = `Since ${formatDate(stats.this_week.started_at || getUtcWeekStart())} (UTC)`;

            renderTemporalCharts(stats.temporal);
            renderPagePerformance(config.pages, pageValues, adminViews);
            setMessage("");
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : error && typeof error.message === "string"
                    ? error.message
                    : "Could not load analytics.";
            setMessage(message, "error");
        } finally {
            loadInProgress = false;
            elements.refresh.disabled = false;
        }
    }

    elements.refresh.addEventListener("click", () => {
        config = undefined;
        void loadDashboard();
    });
    void loadDashboard();
})();
