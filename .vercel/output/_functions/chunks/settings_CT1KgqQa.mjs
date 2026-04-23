import { $ as $$BaseLayout } from './BaseLayout_Bb2y5Eli.mjs';
import { c as createComponent } from './astro-component_DH3y3ISD.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_C0SiE1cg.mjs';
import { jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

const THEME_KEY = "theme";
function getInitialTheme() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored === "dark" || !stored && prefersDark;
}
function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialTheme);
  useEffect(() => {
    const dark = getInitialTheme();
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const handleToggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem(THEME_KEY, newValue ? "dark" : "light");
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: handleToggle,
      className: "w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors cursor-pointer",
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      children: isDark ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-yellow-500", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" }) })
    }
  );
}

const $$Settings = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Settings;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Settings - API Client" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto"> <h1 class="text-2xl font-bold mb-6">Settings</h1> <div class="space-y-6"> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-lg font-semibold mb-4">Appearance</h2> <div class="flex items-center justify-between"> <div> <p class="font-medium">Theme</p> <p class="text-sm text-gray-500">Toggle between light and dark mode</p> </div> ${renderComponent($$result2, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/ThemeToggle", "client:component-export": "ThemeToggle" })} </div> </div> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-lg font-semibold mb-4">Keyboard Shortcuts</h2> <div class="text-sm text-gray-500">
Press <kbd class="px-1 bg-gray-100 rounded">F1</kbd> to view all shortcuts
</div> </div> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-lg font-semibold mb-4">About</h2> <div class="space-y-2 text-sm"> <p><span class="font-medium">Version:</span> 0.0.1</p> <p><span class="font-medium">Built with:</span> Astro + React + TypeScript</p> <p><span class="font-medium">Storage:</span> IndexedDB (via Dexie)</p> </div> </div> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-lg font-semibold mb-4">Data Management</h2> <div class="space-y-3"> <button id="import-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
Import Data
</button> <button id="export-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
Export All Data
</button> <button id="clear-btn" class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm">
Clear All Data
</button> </div> </div> </div> </div> ` })}`;
}, "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/settings.astro", void 0);

const $$file = "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/settings.astro";
const $$url = "/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
