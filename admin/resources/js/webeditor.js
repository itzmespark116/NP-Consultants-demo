(() => {
    "use strict";

    const FILES = [
        { name: "homepage-banner.json", title: "Homepage banner", group: "Homepage", description: "The homepage headline, call-to-action, and background video." },
        { name: "homepage-services.json", title: "Homepage services", group: "Homepage", description: "The homepage services introduction, image, and service cards." },
        { name: "homepage-projects.json", title: "Homepage projects", group: "Homepage", description: "The homepage projects heading and action button." },
        { name: "homepage-contact.json", title: "Homepage contact", group: "Homepage", description: "The homepage contact call-to-action." },
        { name: "about.json", title: "About", group: "Homepage", description: "The about section copy and showcase cards." },
        { name: "staff.json", title: "Staff", group: "Homepage", description: "Team introduction, role groups, and staff profiles." },
        { name: "services.json", title: "Services page", group: "Pages", description: "The services page copy, service descriptions, and bullet lists." },
        { name: "projects.json", title: "Projects page", group: "Pages", description: "Project records, categories, filters, and gallery settings." },
        { name: "contact-page.json", title: "Contact page", group: "Pages", description: "The contact page banner content." },
        { name: "contact.json", title: "Contact details", group: "Contact", description: "Contact methods, map coordinates, and location details." },
        { name: "contact-form.json", title: "Contact form", group: "Contact", description: "Form fields, button style, and confirmation messages." },
        { name: "nav.json", title: "Navigation", group: "Site-wide", description: "Main site navigation labels and destinations." },
        { name: "footer.json", title: "Footer", group: "Site-wide", description: "Footer branding, navigation, and copyright text." },
        { name: "placeholders.json", title: "Placeholders", group: "Site-wide", description: "Fallback image paths used when site media is unavailable." },
        { name: "paths.json", title: "Path registry", group: "Site-wide", description: "Shared JSON, image, icon, and page route mappings." },
        { name: "analytics.json", title: "Analytics", group: "Site-wide", description: "CounterAPI workspace, counter names, and tracked public pages." }
    ];

    const ROLE_OPTIONS = ["Managing Director", "Managing Partner", "Draftsman"];
    const BUTTON_TYPES = ["primary", "secondary", "disabled"];
    const INPUT_TYPES = ["text", "email", "tel", "number", "url", "search"];
    const INPUT_MODES = ["text", "email", "tel", "numeric", "decimal", "search", "url"];
    const STORAGE_PREFIX = "np-admin-webeditor:";

    const elements = {
        fileList: document.getElementById("file-list"),
        fileSearch: document.getElementById("file-search"),
        fileEmpty: document.getElementById("file-empty"),
        fileCount: document.getElementById("file-count"),
        notice: document.getElementById("notice"),
        noticeText: document.getElementById("notice-text"),
        noticeDismiss: document.getElementById("notice-dismiss"),
        loading: document.getElementById("loading-state"),
        error: document.getElementById("error-state"),
        errorMessage: document.getElementById("error-message"),
        retry: document.getElementById("retry-load"),
        workspace: document.getElementById("editor-workspace"),
        fileTitle: document.getElementById("file-title"),
        filePath: document.getElementById("file-path"),
        fileDescription: document.getElementById("file-description"),
        modifiedPill: document.getElementById("modified-pill"),
        saveStatus: document.getElementById("save-status"),
        visualTab: document.getElementById("visual-tab"),
        jsonTab: document.getElementById("json-tab"),
        visualPanel: document.getElementById("visual-panel"),
        jsonPanel: document.getElementById("json-panel"),
        visualEditor: document.getElementById("visual-editor"),
        jsonSource: document.getElementById("json-source"),
        jsonError: document.getElementById("json-error"),
        applyJson: document.getElementById("apply-json"),
        reset: document.getElementById("reset-file"),
        importTrigger: document.getElementById("import-trigger"),
        importFile: document.getElementById("import-file"),
        copy: document.getElementById("copy-json"),
        download: document.getElementById("download-json")
    };

    const state = {
        activeName: null,
        models: new Map(),
        requestId: 0,
        sourceDirty: false,
        fieldId: 0,
        noticeTimeout: 0,
        mediaPreviewTimers: new WeakMap()
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function humanize(value) {
        return String(value)
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function getAtPath(value, path) {
        return path.reduce((current, part) => current[part], value);
    }

    function setAtPath(value, path, nextValue) {
        const parent = getAtPath(value, path.slice(0, -1));
        parent[path[path.length - 1]] = nextValue;
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function getCurrentModel() {
        return state.activeName ? state.models.get(state.activeName) : null;
    }

    function isModified(model) {
        return JSON.stringify(model.data) !== JSON.stringify(model.originalData);
    }

    function setStatus(message, isError = false) {
        elements.saveStatus.textContent = message;
        elements.saveStatus.classList.toggle("admin-save-status--error", isError);
    }

    function showNotice(message, kind = "success") {
        window.clearTimeout(state.noticeTimeout);
        elements.noticeText.textContent = message;
        elements.notice.className = `admin-notice admin-notice--${kind}`;
        elements.notice.hidden = false;
        state.noticeTimeout = window.setTimeout(() => {
            elements.notice.hidden = true;
        }, 6500);
    }

    function hideNotice() {
        window.clearTimeout(state.noticeTimeout);
        elements.notice.hidden = true;
    }

    function updateModifiedIndicators() {
        for (const button of elements.fileList.querySelectorAll("[data-file]")) {
            const model = state.models.get(button.dataset.file);
            const modified = Boolean(model && isModified(model));
            const file = FILES.find((entry) => entry.name === button.dataset.file);
            button.classList.toggle("is-modified", modified);
            button.setAttribute("aria-label", `${file ? `${file.title} (${file.name})` : button.dataset.file}${modified ? ", draft changes" : ""}`);
        }

        const model = getCurrentModel();
        const modified = Boolean(model && isModified(model));
        elements.modifiedPill.hidden = !modified;
        if (model && !state.sourceDirty) {
            setStatus(modified ? "Draft saved in this browser" : "Original file loaded");
        }
    }

    function renderFileList() {
        const filter = elements.fileSearch.value.trim().toLowerCase();
        elements.fileList.replaceChildren();

        const groups = new Map();
        for (const file of FILES) {
            if (!`${file.title} ${file.name} ${file.group}`.toLowerCase().includes(filter)) {
                continue;
            }
            if (!groups.has(file.group)) {
                groups.set(file.group, []);
            }
            groups.get(file.group).push(file);
        }

        for (const [groupName, files] of groups) {
            const group = document.createElement("section");
            group.className = "admin-file-group";
            const heading = document.createElement("h2");
            heading.textContent = groupName;
            group.append(heading);

            for (const file of files) {
                const button = document.createElement("button");
                button.className = "admin-file-link";
                button.type = "button";
                button.dataset.file = file.name;
                button.setAttribute("aria-current", state.activeName === file.name ? "page" : "false");

                const icon = document.createElement("span");
                icon.className = "admin-file-link__icon";
                icon.setAttribute("aria-hidden", "true");
                icon.textContent = "{}";

                const name = document.createElement("span");
                name.className = "admin-file-link__name";
                name.textContent = file.title;

                const dot = document.createElement("span");
                dot.className = "admin-file-link__dot";
                dot.setAttribute("aria-hidden", "true");

                button.append(icon, name, dot);
                button.addEventListener("click", () => selectFile(file.name));
                group.append(button);
            }
            elements.fileList.append(group);
        }

        elements.fileEmpty.hidden = elements.fileList.childElementCount !== 0;
        elements.fileCount.textContent = String(FILES.length);
        updateModifiedIndicators();
    }

    function setView(mode) {
        const visual = mode === "visual";
        elements.visualTab.classList.toggle("is-active", visual);
        elements.visualTab.setAttribute("aria-selected", String(visual));
        elements.jsonTab.classList.toggle("is-active", !visual);
        elements.jsonTab.setAttribute("aria-selected", String(!visual));
        elements.visualPanel.hidden = !visual;
        elements.jsonPanel.hidden = visual;
    }

    function getStorageKey(fileName) {
        return `${STORAGE_PREFIX}${fileName}`;
    }

    function validateDocument(value, expectedValue) {
        if (!isObject(value) || !isObject(expectedValue)) {
            throw new Error("The JSON file must contain an object at its root.");
        }
    }

    async function loadModel(file) {
        const response = await fetch(new URL(`../../resources/data/${encodeURIComponent(file.name)}`, window.location.href), {
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`The server returned ${response.status} ${response.statusText} while loading ${file.name}.`);
        }

        let originalData;
        try {
            originalData = await response.json();
        } catch (error) {
            throw new Error(`Could not parse ${file.name}: ${error.message}`);
        }
        if (!isObject(originalData)) {
            throw new Error(`${file.name} must contain a JSON object at its root.`);
        }

        const model = {
            originalData: clone(originalData),
            data: clone(originalData)
        };

        try {
            const stored = window.localStorage.getItem(getStorageKey(file.name));
            if (stored !== null) {
                const savedDraft = JSON.parse(stored);
                validateDocument(savedDraft, originalData);
                model.data = savedDraft;
            }
        } catch (error) {
            showNotice(`Could not restore the browser draft for ${file.name}: ${error.message}`, "error");
        }

        return model;
    }

    async function selectFile(fileName) {
        const file = FILES.find((entry) => entry.name === fileName);
        if (!file) {
            showNotice(`Unknown JSON file: ${fileName}`, "error");
            return;
        }

        if (state.sourceDirty && !applySourceChanges()) {
            return;
        }

        state.activeName = file.name;
        state.sourceDirty = false;
        const requestId = ++state.requestId;
        renderFileList();
        hideNotice();
        elements.workspace.hidden = true;
        elements.error.hidden = true;
        elements.loading.hidden = false;

        try {
            let model = state.models.get(file.name);
            if (!model) {
                model = await loadModel(file);
                state.models.set(file.name, model);
            }
            if (requestId !== state.requestId) {
                return;
            }
            elements.loading.hidden = true;
            renderCurrentFile(file, model);
        } catch (error) {
            if (requestId !== state.requestId) {
                return;
            }
            elements.loading.hidden = true;
            elements.error.hidden = false;
            elements.errorMessage.textContent = error.message;
            setStatus("File could not be loaded", true);
        }
    }

    function renderCurrentFile(file, model) {
        elements.workspace.hidden = false;
        elements.fileTitle.textContent = file.title;
        elements.filePath.textContent = `resources/data/${file.name}`;
        elements.fileDescription.textContent = file.description;
        elements.jsonError.hidden = true;
        elements.jsonSource.value = JSON.stringify(model.data, null, 2);
        setView("visual");
        renderVisualEditor();
        updateModifiedIndicators();
    }

    function renderVisualEditor() {
        const model = getCurrentModel();
        elements.visualEditor.replaceChildren();
        if (!model || !isObject(model.data)) {
            return;
        }

        for (const [key, value] of Object.entries(model.data)) {
            elements.visualEditor.append(renderNode(key, value, [key], 0));
        }
    }

    function renderNode(key, value, path, depth) {
        if (Array.isArray(value)) {
            return renderArray(key, value, path);
        }
        if (isObject(value)) {
            return renderObject(key, value, path, depth);
        }
        return renderField(key, value, path);
    }

    function renderObject(key, value, path, depth) {
        const isRootField = depth === 0;
        const container = isRootField
            ? document.createElement("fieldset")
            : document.createElement("details");
        container.className = isRootField ? "admin-group" : "admin-object";

        if (isRootField) {
            const legend = document.createElement("legend");
            legend.textContent = humanize(key);
            container.append(legend);
        } else {
            container.open = depth < 2;
            const summary = document.createElement("summary");
            summary.textContent = humanize(key);
            container.append(summary);
        }

        const fields = document.createElement("div");
        fields.className = isRootField ? "admin-fields" : "admin-fields admin-object__content";
        for (const [childKey, childValue] of Object.entries(value)) {
            fields.append(renderNode(childKey, childValue, [...path, childKey], depth + 1));
        }
        container.append(fields);
        return container;
    }

    function renderArray(key, value, path) {
        const section = document.createElement("section");
        section.className = "admin-array";

        const header = document.createElement("div");
        header.className = "admin-array__header";
        const title = document.createElement("div");
        title.className = "admin-array__title";
        title.append(document.createTextNode(humanize(key)));

        const count = document.createElement("span");
        count.className = "admin-array__count";
        count.textContent = `${value.length} ${value.length === 1 ? "item" : "items"}`;
        title.append(count);

        const addButton = document.createElement("button");
        addButton.className = "admin-button admin-button--small";
        addButton.type = "button";
        addButton.textContent = "＋ Add item";
        addButton.dataset.action = "add";
        addButton.dataset.path = JSON.stringify(path);
        header.append(title, addButton);
        section.append(header);

        const items = document.createElement("div");
        items.className = "admin-array__items";
        if (value.length === 0) {
            const empty = document.createElement("p");
            empty.className = "admin-array__empty";
            empty.textContent = "No items yet. Add one to continue.";
            items.append(empty);
        }

        value.forEach((item, index) => {
            const itemPath = [...path, index];
            if (isObject(item)) {
                const card = document.createElement("article");
                card.className = "admin-item";

                const cardHeader = document.createElement("div");
                cardHeader.className = "admin-item__header";
                const cardTitle = document.createElement("span");
                cardTitle.className = "admin-item__title";
                cardTitle.textContent = itemTitle(item, index);

                const actions = document.createElement("div");
                actions.className = "admin-item__actions";
                actions.append(
                    createItemAction("↑", "Move item up", "move-up", itemPath, index === 0),
                    createItemAction("↓", "Move item down", "move-down", itemPath, index === value.length - 1),
                    createItemAction("×", "Remove item", "remove", itemPath, false, true)
                );
                cardHeader.append(cardTitle, actions);

                const content = document.createElement("div");
                content.className = "admin-item__content";
                for (const [childKey, childValue] of Object.entries(item)) {
                    content.append(renderNode(childKey, childValue, [...itemPath, childKey], 1));
                }
                card.append(cardHeader, content);
                items.append(card);
            } else {
                const row = document.createElement("div");
                row.className = "admin-item";
                const rowHeader = document.createElement("div");
                rowHeader.className = "admin-item__header";
                const rowTitle = document.createElement("span");
                rowTitle.className = "admin-item__title";
                rowTitle.textContent = `Item ${index + 1}`;
                rowHeader.append(rowTitle, createItemAction("×", "Remove item", "remove", itemPath, false, true));
                row.append(rowHeader, renderNode(key, item, itemPath, 1));
                items.append(row);
            }
        });

        section.append(items);
        return section;
    }

    function itemTitle(item, index) {
        const title = item.name || item.title || item.label || item.text || item.id;
        const text = typeof title === "string" ? title.trim() : "";
        return text ? `${index + 1}. ${text}` : `Item ${index + 1}`;
    }

    function createItemAction(label, description, action, path, disabled, danger = false) {
        const button = document.createElement("button");
        button.className = `admin-button admin-button--small admin-button--icon${danger ? " admin-button--danger" : ""}`;
        button.type = "button";
        button.textContent = label;
        button.title = description;
        button.setAttribute("aria-label", description);
        button.dataset.action = action;
        button.dataset.path = JSON.stringify(path);
        button.disabled = disabled;
        return button;
    }

    function fieldOptions(key, path) {
        const fileName = state.activeName;
        const parentPath = path.slice(0, -1);
        if (key === "type" && (parentPath.includes("buttons") || parentPath.includes("button"))) {
            return BUTTON_TYPES;
        }
        if (key === "type" && fileName === "contact-form.json" && parentPath.includes("fields")) {
            return ["input", "textarea"];
        }
        if (key === "inputType") {
            return INPUT_TYPES;
        }
        if (key === "inputmode") {
            return INPUT_MODES;
        }
        if (key === "category" && fileName === "projects.json") {
            const categories = getCurrentModel()?.data.categories;
            if (Array.isArray(categories)) {
                return categories
                    .map((category) => category.id)
                    .filter((categoryId) => typeof categoryId === "string");
            }
        }
        if (fileName === "staff.json" && (key === "roles" || parentPath.includes("roles") || parentPath.includes("groups"))) {
            return ROLE_OPTIONS;
        }
        return null;
    }

    function mediaDetails(value) {
        if (typeof value !== "string" || value.trim() === "") {
            return null;
        }

        try {
            const url = new URL(value.trim(), `${window.location.origin}/`);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                return null;
            }

            const extension = url.pathname.split(".").pop().toLowerCase();
            if (["avif", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(extension)) {
                return { type: "image", url };
            }
            if (["m4v", "mov", "mp4", "ogv", "webm"].includes(extension)) {
                return { type: "video", url };
            }
            if (["aac", "m4a", "mp3", "oga", "ogg", "wav"].includes(extension)) {
                return { type: "audio", url };
            }
        } catch {
            return null;
        }
        return null;
    }

    function createMediaPreview(value, fieldName) {
        const media = mediaDetails(value);
        if (!media) {
            return null;
        }

        const preview = document.createElement("div");
        preview.className = `admin-media-preview admin-media-preview--${media.type}`;
        const title = document.createElement("span");
        title.className = "admin-media-preview__label";
        title.textContent = `${media.type === "image" ? "Image" : media.type === "video" ? "Video" : "Audio"} preview`;
        preview.append(title);

        if (media.type === "image") {
            const image = document.createElement("img");
            image.className = "admin-media-preview__image";
            image.src = media.url.href;
            image.alt = `${humanize(fieldName)} preview`;
            image.loading = "lazy";
            image.decoding = "async";
            image.addEventListener("error", () => {
                image.hidden = true;
                const unavailable = document.createElement("span");
                unavailable.className = "admin-media-preview__unavailable";
                unavailable.textContent = "Preview unavailable. Check the file path.";
                preview.append(unavailable);
            }, { once: true });
            preview.append(image);
        } else if (media.type === "video") {
            const video = document.createElement("video");
            video.className = "admin-media-preview__video";
            video.src = media.url.href;
            video.controls = true;
            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("aria-label", `${humanize(fieldName)} video preview`);
            preview.append(video);
        } else {
            const audio = document.createElement("audio");
            audio.className = "admin-media-preview__audio";
            audio.src = media.url.href;
            audio.controls = true;
            audio.preload = "metadata";
            audio.setAttribute("aria-label", `${humanize(fieldName)} audio preview`);
            preview.append(audio);
        }

        const openLink = document.createElement("a");
        openLink.className = "admin-media-preview__link";
        openLink.href = media.url.href;
        openLink.target = "_blank";
        openLink.rel = "noreferrer";
        openLink.textContent = "Open asset ↗";
        preview.append(openLink);
        return preview;
    }

    function updateMediaPreview(control, key) {
        const wrapper = control.closest(".admin-field");
        const timer = state.mediaPreviewTimers.get(wrapper);
        window.clearTimeout(timer);
        state.mediaPreviewTimers.set(wrapper, window.setTimeout(() => {
            state.mediaPreviewTimers.delete(wrapper);
            const current = wrapper.querySelector(".admin-media-preview");
            const next = createMediaPreview(control.value, key);
            if (current && next) {
                current.replaceWith(next);
            } else if (current) {
                current.remove();
            } else if (next) {
                wrapper.append(next);
            }
        }, 250));
    }

    function renderField(key, value, path) {
        const wrapper = document.createElement("div");
        wrapper.className = "admin-field";

        const id = `admin-field-${state.fieldId++}`;
        const label = document.createElement("label");
        label.className = "admin-field__label";
        label.htmlFor = id;
        label.textContent = humanize(key);

        let control;
        if (typeof value === "boolean") {
            const toggle = document.createElement("label");
            toggle.className = "admin-toggle";
            control = document.createElement("input");
            control.type = "checkbox";
            control.checked = value;
            control.id = id;
            control.dataset.path = JSON.stringify(path);
            toggle.append(control, document.createTextNode(value ? "Enabled" : "Disabled"));
            wrapper.append(label, toggle);
            control.addEventListener("change", () => {
                toggle.lastChild.textContent = control.checked ? "Enabled" : "Disabled";
            });
            return wrapper;
        }

        if (typeof value === "number") {
            control = document.createElement("input");
            control.type = "number";
            control.step = Number.isInteger(value) ? "1" : "any";
            control.value = String(value);
        } else {
            const options = fieldOptions(key, path);
            if (options) {
                control = document.createElement("select");
                const selectOptions = options.includes(value) ? options : [value, ...options];
                for (const optionValue of selectOptions) {
                    const option = document.createElement("option");
                    option.value = optionValue;
                    option.textContent = humanize(optionValue);
                    control.append(option);
                }
                control.value = value;
            } else if (typeof value === "string" && (value.length > 100 || ["text", "description", "details", "message", "copyright", "icon"].includes(key.toLowerCase()))) {
                control = document.createElement("textarea");
                control.rows = value.length > 350 ? 6 : 3;
                control.value = value;
            } else {
                control = document.createElement("input");
                control.type = "text";
                control.value = value === null ? "" : String(value);
            }
        }

        control.id = id;
        control.dataset.path = JSON.stringify(path);
        if (typeof value === "string" && value.length > 0 && key !== "type" && key !== "inputType" && key !== "inputmode") {
            control.spellcheck = true;
        }
        if (key === "icon") {
            control.spellcheck = false;
        }
        if (control instanceof HTMLTextAreaElement) {
            wrapper.classList.add("admin-field--wide");
        }

        wrapper.append(label, control);
        const preview = createMediaPreview(value, key);
        if (preview) {
            wrapper.classList.add("admin-field--wide");
            wrapper.append(preview);
        }
        return wrapper;
    }

    function emptyItem(value, key) {
        if (Array.isArray(value)) {
            return [];
        }
        if (isObject(value)) {
            const result = {};
            for (const [childKey, childValue] of Object.entries(value)) {
                result[childKey] = childKey === "type" || childKey === "inputType" || childKey === "inputmode" || (childKey === "category" && state.activeName === "projects.json")
                    ? childValue
                    : emptyItem(childValue, childKey);
            }
            return result;
        }
        if (typeof value === "string") {
            return key === "type" || key === "inputType" || key === "inputmode" || (key === "category" && state.activeName === "projects.json")
                ? value
                : "";
        }
        if (typeof value === "boolean") {
            return false;
        }
        if (typeof value === "number") {
            return 0;
        }
        return null;
    }

    function newArrayItem(key, currentArray) {
        if (currentArray.length > 0) {
            return emptyItem(currentArray[0], key);
        }
        const templates = {
            buttons: { text: "", href: "", type: "primary", icon: "" },
            navigation: { label: "", url: "" },
            links: { label: "", href: "" },
            services: { title: "", text: "" },
            cards: { title: "", text: "", image: "", link: "" },
            fields: { name: "", label: "", type: "input", inputType: "text", required: false },
            members: { name: "", roles: [], image: "", details: [] },
            categories: { id: "", label: "" },
            projects: { id: "", name: "", category: "", year: 0, featured: false, ongoing: false, images: [] },
            director: "",
            management: "",
            roles: "",
            description: "",
            details: "",
            bullets: ""
        };
        return Object.prototype.hasOwnProperty.call(templates, key)
            ? clone(templates[key])
            : "";
    }

    function persistCurrentDraft() {
        const model = getCurrentModel();
        if (!model) {
            return;
        }
        let message;
        let isError = false;
        try {
            window.localStorage.setItem(getStorageKey(state.activeName), JSON.stringify(model.data));
            message = isModified(model) ? "Draft saved in this browser" : "Original file loaded";
        } catch (error) {
            message = `Draft is in memory only: ${error.message}`;
            isError = true;
        }
        updateModifiedIndicators();
        renderFileList();
        setStatus(message, isError);
    }

    function updateField(control) {
        const model = getCurrentModel();
        if (!model || !control.dataset.path) {
            return;
        }

        let value;
        if (control.type === "checkbox") {
            value = control.checked;
        } else if (control.type === "number") {
            if (control.value.trim() === "") {
                control.setAttribute("aria-invalid", "true");
                setStatus("Enter a number to keep this field valid.", true);
                return;
            }
            value = Number(control.value);
            if (!Number.isFinite(value)) {
                control.setAttribute("aria-invalid", "true");
                setStatus("Enter a valid number.", true);
                return;
            }
            control.removeAttribute("aria-invalid");
        } else {
            value = control.value;
        }

        const path = JSON.parse(control.dataset.path);
        setAtPath(model.data, path, value);
        updateMediaPreview(control, path[path.length - 1]);
        state.sourceDirty = false;
        persistCurrentDraft();
    }

    function handleArrayAction(button) {
        const model = getCurrentModel();
        if (!model) {
            return;
        }

        const path = JSON.parse(button.dataset.path);
        const action = button.dataset.action;
        if (action === "add") {
            const array = getAtPath(model.data, path);
            array.push(newArrayItem(path[path.length - 1], array));
        } else {
            const index = path[path.length - 1];
            const array = getAtPath(model.data, path.slice(0, -1));
            if (!Array.isArray(array)) {
                showNotice("The selected item is no longer part of an array.", "error");
                return;
            }
            if (action === "remove") {
                array.splice(index, 1);
            } else if (action === "move-up" && index > 0) {
                [array[index - 1], array[index]] = [array[index], array[index - 1]];
            } else if (action === "move-down" && index < array.length - 1) {
                [array[index + 1], array[index]] = [array[index], array[index + 1]];
            }
        }

        renderVisualEditor();
        persistCurrentDraft();
    }

    function setJsonError(message) {
        elements.jsonError.textContent = message;
        elements.jsonError.hidden = !message;
    }

    function applySourceChanges() {
        const model = getCurrentModel();
        if (!model) {
            return false;
        }

        let parsed;
        try {
            parsed = JSON.parse(elements.jsonSource.value);
            validateDocument(parsed, model.originalData);
        } catch (error) {
            setJsonError(error.message);
            setStatus("JSON has not been applied", true);
            return false;
        }

        model.data = parsed;
        state.sourceDirty = false;
        setJsonError("");
        renderVisualEditor();
        persistCurrentDraft();
        showNotice("Valid JSON applied to the editor.", "success");
        return true;
    }

    function prepareForExport() {
        if (state.sourceDirty && !applySourceChanges()) {
            return false;
        }
        return Boolean(getCurrentModel());
    }

    function downloadCurrentFile() {
        if (!prepareForExport()) {
            return;
        }
        let url;
        try {
            const blob = new Blob([`${JSON.stringify(getCurrentModel().data, null, 2)}\n`], {
                type: "application/json;charset=utf-8"
            });
            url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = state.activeName;
            document.body.append(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            showNotice(`${state.activeName} downloaded. Replace the matching file in resources/data/ to publish it.`, "success");
        } catch (error) {
            if (url) {
                URL.revokeObjectURL(url);
            }
            showNotice(`Could not download ${state.activeName}: ${error.message}`, "error");
        }
    }

    async function copyCurrentFile() {
        if (!prepareForExport()) {
            return;
        }
        const text = `${JSON.stringify(getCurrentModel().data, null, 2)}\n`;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                copyWithSelection(text);
            }
            showNotice("Formatted JSON copied to the clipboard.", "success");
        } catch (error) {
            showNotice(`Could not copy JSON to the clipboard: ${error.message}`, "error");
        }
    }

    function copyWithSelection(text) {
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.setAttribute("readonly", "");
        temporary.className = "admin-visually-hidden";
        document.body.append(temporary);
        let copied;
        try {
            temporary.select();
            copied = document.execCommand("copy");
        } finally {
            temporary.remove();
        }
        if (!copied) {
            throw new Error("Clipboard access is unavailable. Try opening the editor over HTTPS or download the file.");
        }
    }

    async function importJsonFile(file) {
        if (!file) {
            return;
        }
        const model = getCurrentModel();
        if (!model) {
            showNotice("Select a JSON file before importing.", "error");
            return;
        }

        try {
            const parsed = JSON.parse(await file.text());
            validateDocument(parsed, model.originalData);
            model.data = parsed;
            state.sourceDirty = false;
            elements.jsonSource.value = JSON.stringify(parsed, null, 2);
            setJsonError("");
            renderVisualEditor();
            persistCurrentDraft();
            showNotice(`${file.name} imported. Review the changes, then download to export them.`, "success");
        } catch (error) {
            showNotice(`Could not import ${file.name}: ${error.message}`, "error");
        } finally {
            elements.importFile.value = "";
        }
    }

    function resetCurrentFile() {
        const model = getCurrentModel();
        if (!model) {
            return;
        }
        if (!window.confirm(`Discard the saved draft and restore ${state.activeName} as it was loaded?`)) {
            return;
        }

        model.data = clone(model.originalData);
        state.sourceDirty = false;
        let clearError = null;
        try {
            window.localStorage.removeItem(getStorageKey(state.activeName));
        } catch (error) {
            clearError = error;
        }
        elements.jsonSource.value = JSON.stringify(model.data, null, 2);
        setJsonError("");
        renderVisualEditor();
        updateModifiedIndicators();
        if (clearError) {
            showNotice(`The original file was restored, but its browser draft could not be cleared: ${clearError.message}`, "error");
        } else {
            showNotice("Draft discarded. The file is back to its originally loaded content.", "success");
        }
    }

    elements.fileSearch.addEventListener("input", renderFileList);
    elements.noticeDismiss.addEventListener("click", hideNotice);
    elements.retry.addEventListener("click", () => {
        if (state.activeName) {
            state.models.delete(state.activeName);
            selectFile(state.activeName);
        }
    });
    elements.visualEditor.addEventListener("input", (event) => {
        if (event.target.matches("[data-path]") && event.target.type !== "checkbox") {
            updateField(event.target);
        }
    });
    elements.visualEditor.addEventListener("change", (event) => {
        if (event.target.matches("[data-path]") && (event.target.type === "checkbox" || event.target.tagName === "SELECT")) {
            updateField(event.target);
        }
    });
    elements.visualEditor.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (button) {
            handleArrayAction(button);
        }
    });
    elements.jsonTab.addEventListener("click", () => {
        const model = getCurrentModel();
        if (!model) {
            return;
        }
        elements.jsonSource.value = JSON.stringify(model.data, null, 2);
        state.sourceDirty = false;
        setJsonError("");
        setView("json");
        elements.jsonSource.focus();
    });
    elements.visualTab.addEventListener("click", () => {
        if (state.sourceDirty && !applySourceChanges()) {
            return;
        }
        setView("visual");
    });
    elements.jsonSource.addEventListener("input", () => {
        state.sourceDirty = true;
        setJsonError("");
        setStatus("JSON source has unapplied edits", true);
    });
    elements.applyJson.addEventListener("click", applySourceChanges);
    elements.reset.addEventListener("click", resetCurrentFile);
    elements.importTrigger.addEventListener("click", () => elements.importFile.click());
    elements.importFile.addEventListener("change", () => importJsonFile(elements.importFile.files[0]));
    elements.copy.addEventListener("click", copyCurrentFile);
    elements.download.addEventListener("click", downloadCurrentFile);

    document.addEventListener("keydown", (event) => {
        if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches("input, textarea, select")) {
            event.preventDefault();
            elements.fileSearch.focus();
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            downloadCurrentFile();
        }
    });

    renderFileList();
    const requestedFile = new URLSearchParams(window.location.search).get("file");
    selectFile(FILES.some((file) => file.name === requestedFile) ? requestedFile : "homepage-banner.json");
})();
