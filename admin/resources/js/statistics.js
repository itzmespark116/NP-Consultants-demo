(() => {
    "use strict";

    const CONFIG_URL = "../../resources/data/analytics.json";
    const COUNTER_CLIENT_URL = "https://cdn.jsdelivr.net/npm/counterapi@3.1.0/+esm";
    const SVG_NS = "http://www.w3.org/2000/svg";
    const elements = {
        message: document.getElementById("statistics-message"),
        setup: document.getElementById("configuration-state"),
        content: document.getElementById("statistics-content"),
        refresh: document.getElementById("refresh-statistics"),
        range: document.getElementById("date-range"),
        totalViews: document.getElementById("metric-total-views"),
        totalSessions: document.getElementById("metric-total-sessions"),
        adminViews: document.getElementById("metric-admin-views"),
        todayViews: document.getElementById("metric-today-views"),
        todayDate: document.getElementById("metric-today-date"),
        averageViews: document.getElementById("metric-average-views"),
        averagePeriod: document.getElementById("metric-average-period"),
        chart: document.getElementById("traffic-chart"),
        chartDescription: document.getElementById("chart-description"),
        hoursChart: document.getElementById("counter-hours-chart"),
        weekdaysChart: document.getElementById("counter-weekdays-chart"),
        quartersChart: document.getElementById("counter-quarters-chart"),
        pagePerformance: document.getElementById("page-performance")
    };
    const numberFormat = new Intl.NumberFormat();
    let config;
    let counter;
    let temporalCharts = [];
    let loadInProgress = false;
    let rangeInitialized = false;

    function setMessage(message, kind = "info") {
        elements.message.textContent = message;
        elements.message.dataset.kind = kind;
        elements.message.hidden = !message;
    }

    function getUtcDate(date = new Date()) {
        return date.toISOString().slice(0, 10);
    }

    function offsetDate(dateString, offset) {
        const date = new Date(`${dateString}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() + offset);
        return getUtcDate(date);
    }

    function formatDate(dateString, options = { month: "short", day: "numeric" }) {
        return new Intl.DateTimeFormat(undefined, { ...options, timeZone: "UTC" })
            .format(new Date(`${dateString}T00:00:00.000Z`));
    }

    function appendSvg(parent, name, attributes = {}, text = "") {
        const element = document.createElementNS(SVG_NS, name);
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, String(value));
        }
        if (text) element.textContent = text;
        parent.append(element);
        return element;
    }

    function clearChart() {
        for (const child of [...elements.chart.children]) {
            if (child.id !== "chart-title" && child.id !== "chart-description") child.remove();
        }
    }

    function drawChart(rows) {
        clearChart();
        const width = 900;
        const height = 330;
        const margin = { top: 18, right: 24, bottom: 48, left: 60 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const highest = Math.max(1, ...rows.flatMap((row) => [row.views, row.sessions]));
        const scale = Math.ceil(highest / 4) * 4 || 1;
        const x = (index) => margin.left + (rows.length < 2 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth);
        const y = (value) => margin.top + plotHeight - (value / scale) * plotHeight;

        elements.chartDescription.textContent =
            `Daily page views and browser sessions from ${formatDate(rows[0].date, { year: "numeric", month: "long", day: "numeric" })} through ${formatDate(rows[rows.length - 1].date, { year: "numeric", month: "long", day: "numeric" })}, UTC.`;

        for (let tick = 0; tick <= 4; tick += 1) {
            const value = (scale / 4) * tick;
            const tickY = y(value);
            appendSvg(elements.chart, "line", {
                class: "statistics-grid-line",
                x1: margin.left,
                x2: width - margin.right,
                y1: tickY,
                y2: tickY
            });
            appendSvg(elements.chart, "text", {
                class: "statistics-axis-label",
                x: margin.left - 10,
                y: tickY + 4,
                "text-anchor": "end"
            }, numberFormat.format(value));
        }

        const labelCount = Math.min(7, rows.length);
        for (let index = 0; index < labelCount; index += 1) {
            const rowIndex = Math.round((index / Math.max(1, labelCount - 1)) * (rows.length - 1));
            const labelX = x(rowIndex);
            appendSvg(elements.chart, "text", {
                class: "statistics-axis-label",
                x: labelX,
                y: height - 16,
                "text-anchor": index === 0 ? "start" : index === labelCount - 1 ? "end" : "middle"
            }, formatDate(rows[rowIndex].date));
        }

        for (const series of [
            { key: "views", line: "statistics-line-views", point: "statistics-point-views", label: "Page views" },
            { key: "sessions", line: "statistics-line-sessions", point: "statistics-point-sessions", label: "Sessions" }
        ]) {
            const points = rows.map((row, index) => `${x(index)},${y(row[series.key])}`).join(" ");
            appendSvg(elements.chart, "polyline", { class: series.line, points });
            rows.forEach((row, index) => {
                const point = appendSvg(elements.chart, "circle", {
                    class: series.point,
                    cx: x(index),
                    cy: y(row[series.key]),
                    r: rows.length > 45 ? 2.5 : 3.5
                });
                appendSvg(point, "title", {}, `${formatDate(row.date, { year: "numeric", month: "long", day: "numeric" })}: ${numberFormat.format(row[series.key])} ${series.label.toLowerCase()}`);
            });
        }

        if (rows.every((row) => row.views === 0 && row.sessions === 0)) {
            appendSvg(elements.chart, "text", {
                class: "statistics-chart-empty",
                x: width / 2,
                y: margin.top + plotHeight / 2,
                "text-anchor": "middle"
            }, "No daily counts yet. The daily counters need to exist and receive visits.");
        }
    }

    function renderTemporalCharts(temporal) {
        if (typeof window.Chart !== "function") {
            throw new Error("The CounterAPI charts could not load. Check your connection and refresh.");
        }
        if (!temporal || !temporal.hours || !temporal.weekdays || !temporal.quarters) {
            throw new Error("CounterAPI did not return the activity breakdown for the page-views counter.");
        }

        temporalCharts.forEach((chart) => chart.destroy());
        temporalCharts = [];

        const color = getComputedStyle(document.documentElement);
        const textColor = color.getPropertyValue("--color-mute").trim();
        const gridColor = color.getPropertyValue("--border").trim();
        const viewsColor = color.getPropertyValue("--accent").trim();
        const datasets = (values) => [
            {
                label: "Up counts",
                data: values.map((entry) => Number(entry && entry.up) || 0),
                backgroundColor: viewsColor,
                borderRadius: 4
            },
            {
                label: "Down counts",
                data: values.map((entry) => Number(entry && entry.down) || 0),
                backgroundColor: color.getPropertyValue("--success").trim(),
                borderRadius: 4
            }
        ];
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    labels: { color: textColor, usePointStyle: true, boxWidth: 8 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, maxRotation: 0, autoSkip: true }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, precision: 0 }
                }
            }
        };
        const createChart = (canvas, labels, values) => {
            temporalCharts.push(new window.Chart(canvas, {
                type: "bar",
                data: { labels, datasets: datasets(values) },
                options
            }));
        };
        const hourKeys = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
        const weekdayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const quarterKeys = ["q1", "q2", "q3", "q4"];

        createChart(elements.hoursChart, hourKeys.map((hour) => `${hour}:00`), hourKeys.map((hour) => temporal.hours[hour]));
        createChart(elements.weekdaysChart, weekdayKeys.map((day) => day[0].toUpperCase() + day.slice(1)), weekdayKeys.map((day) => temporal.weekdays[day]));
        createChart(elements.quartersChart, quarterKeys.map((quarter) => quarter.toUpperCase()), quarterKeys.map((quarter) => temporal.quarters[quarter]));
    }

    async function getCount(name, missingIsZero = false) {
        let result;
        try {
            result = await counter.get(name);
        } catch (error) {
            if (missingIsZero && error && error.status === 404) return 0;
            throw error;
        }
        const value = result && Number(result.data && result.data.up_count);
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`CounterAPI returned an invalid count for "${name}".`);
        }
        return value;
    }

    async function getRows(days) {
        const today = getUtcDate();
        const dates = Array.from({ length: days }, (_, index) => offsetDate(today, index - days + 1));
        const rows = [];
        for (let index = 0; index < dates.length; index += 6) {
            const batch = dates.slice(index, index + 6);
            const result = await Promise.all(batch.map(async (date) => {
                const [views, sessions] = await Promise.all([
                    getCount(`${config.counters.pageViewsDailyPrefix}-${date}`, true),
                    getCount(`${config.counters.sessionsDailyPrefix}-${date}`, true)
                ]);
                return { date, views, sessions };
            }));
            rows.push(...result);
        }
        return rows;
    }

    function renderPages(pages, values) {
        elements.pagePerformance.replaceChildren();
        const peak = Math.max(1, ...values);
        if (!pages.length) {
            const empty = document.createElement("p");
            empty.className = "statistics-empty-pages";
            empty.textContent = "No pages are configured for tracking.";
            elements.pagePerformance.append(empty);
            return;
        }

        pages.forEach((page, index) => {
            const row = document.createElement("div");
            row.className = "statistics-page-row";

            const name = document.createElement("span");
            name.className = "statistics-page-row__name";
            name.textContent = page.name;
            name.title = page.path;

            const track = document.createElement("span");
            track.className = "statistics-page-row__track";
            track.setAttribute("aria-hidden", "true");
            const bar = document.createElement("span");
            bar.className = "statistics-page-row__bar";
            bar.style.width = `${(values[index] / peak) * 100}%`;
            track.append(bar);

            const count = document.createElement("span");
            count.className = "statistics-page-row__value";
            count.textContent = numberFormat.format(values[index]);

            row.append(name, track, count);
            elements.pagePerformance.append(row);
        });
    }

    function validateConfig(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error("The analytics configuration must be a JSON object.");
        }
        if (value.enabled !== true || typeof value.workspace !== "string" || !value.workspace.trim()) {
            return false;
        }
        const counters = value.counters;
        const requiredNames = [
            "pageViewsTotal",
            "sessionsTotal",
            "pageViewsDailyPrefix",
            "sessionsDailyPrefix",
            "pageViewsPerPagePrefix",
            "adminPageViews"
        ];
        if (!counters || requiredNames.some((name) => typeof counters[name] !== "string" || !counters[name].trim())) {
            throw new Error("The analytics configuration is missing one or more CounterAPI counter names.");
        }
        if (!Array.isArray(value.pages) || value.pages.some((page) =>
            !page || typeof page.name !== "string" || typeof page.path !== "string" || typeof page.key !== "string"
        )) {
            throw new Error("The analytics pages setting must be a list of pages with name, path, and key values.");
        }
        return true;
    }

    async function loadDashboard() {
        if (loadInProgress) return;
        loadInProgress = true;
        elements.refresh.disabled = true;
        elements.range.disabled = true;
        setMessage("");
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

            if (!rangeInitialized) {
                const defaultRange = Number(config.defaultRangeDays);
                elements.range.value = String([7, 30, 90].includes(defaultRange) ? defaultRange : 30);
                rangeInitialized = true;
            }

            if (!counter) {
                setMessage("Connecting to CounterAPI…");
                const { Counter } = await import(COUNTER_CLIENT_URL);
                counter = new Counter({ workspace: config.workspace.trim() });
            }

            elements.setup.hidden = true;
            elements.content.hidden = false;
            const selectedDays = Number(elements.range.value || config.defaultRangeDays || 30);
            const rangeDays = [7, 30, 90].includes(selectedDays) ? selectedDays : 30;
            elements.range.value = String(rangeDays);
            const today = getUtcDate();
            const [totalStats, totalSessions, adminViews, rows, pageValues] = await Promise.all([
                counter.stats(config.counters.pageViewsTotal),
                getCount(config.counters.sessionsTotal, true),
                getCount(config.counters.adminPageViews, true),
                getRows(rangeDays),
                Promise.all(config.pages.map((page) => getCount(`${config.counters.pageViewsPerPagePrefix}-${page.key}`, true)))
            ]);
            const totalViews = Number(totalStats && totalStats.data && totalStats.data.up_count);
            const todayViews = Number(totalStats && totalStats.data && totalStats.data.stats &&
                totalStats.data.stats.today && totalStats.data.stats.today.up);
            if (!Number.isFinite(totalViews) || totalViews < 0 || !Number.isFinite(todayViews) || todayViews < 0) {
                throw new Error("CounterAPI returned invalid page-views statistics.");
            }

            elements.totalViews.textContent = numberFormat.format(totalViews);
            elements.totalSessions.textContent = numberFormat.format(totalSessions);
            elements.adminViews.textContent = numberFormat.format(adminViews);
            elements.todayViews.textContent = numberFormat.format(todayViews);
            elements.todayDate.textContent = `${formatDate(today, { year: "numeric", month: "long", day: "numeric" })} (UTC)`;
            const average = rows.reduce((sum, row) => sum + row.views, 0) / rows.length;
            elements.averageViews.textContent = numberFormat.format(Math.round(average * 10) / 10);
            elements.averagePeriod.textContent = `Page views per day · last ${rangeDays} days`;

            drawChart(rows);
            renderTemporalCharts(totalStats.data.stats.temporal);
            renderPages(config.pages, pageValues);
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
            elements.range.disabled = false;
        }
    }

    elements.refresh.addEventListener("click", () => {
        config = undefined;
        counter = undefined;
        rangeInitialized = true;
        void loadDashboard();
    });
    elements.range.addEventListener("change", () => void loadDashboard());
    void loadDashboard();
})();
