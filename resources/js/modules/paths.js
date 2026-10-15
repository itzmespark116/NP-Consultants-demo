// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── modules/paths.js ────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Utility / Loader
// Loads /resources/data/paths.json and resolves all paths using the "prefix".
// Handles nested objects (e.g. brand: { dark, light }) recursively.

export function resolvePath(path, prefix = "") {
  if (!path || typeof path !== "string") return path;
  if (!prefix) return path;

  if (path.startsWith("/")) {
    return prefix.endsWith("/") ? prefix + path.slice(1) : prefix + path;
  }
  return prefix.endsWith("/") ? prefix + path : prefix + "/" + path;
}

function resolveObject(obj, prefix) {
  if (typeof obj === "string") return resolvePath(obj, prefix);
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = resolveObject(v, prefix);
    }
    return out;
  }
  return obj;
}

let cachedPathsPromise = null;

export async function getPaths() {
  if (!cachedPathsPromise) {
    cachedPathsPromise = (async () => {
      let data;

      // Node.js test environment support
      if (typeof process !== "undefined" && process?.versions?.node && typeof window === "undefined") {
        const { readFileSync } = await import("fs");
        const { fileURLToPath } = await import("url");
        const filePath = fileURLToPath(new URL("../../data/paths.json", import.meta.url));
        data = JSON.parse(readFileSync(filePath, "utf-8"));
      } else {
        // Browser: resolve paths.json relative to this module's URL
        let res;
        try {
          const primaryUrl = new URL("../../data/paths.json", import.meta.url);
          res = await fetch(primaryUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch {
          try {
            res = await fetch("/resources/data/paths.json");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
          } catch {
            res = await fetch("./resources/data/paths.json");
          }
        }
        data = await res.json();
      }

      const prefix = data?.prefix ?? "";
      const resolved = { prefix };

      for (const [key, value] of Object.entries(data || {})) {
        if (key === "prefix") continue;
        resolved[key] = resolveObject(value, prefix);
      }

      return resolved;
    })();
  }
  return cachedPathsPromise;
}

export async function getPath(key) {
  const paths = await getPaths();
  return paths[key];
}

if (typeof window !== "undefined") {
  window.getPaths = getPaths;
  window.getPath = getPath;
  window.resolvePath = resolvePath;
}

export default getPaths;
