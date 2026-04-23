import { c as createComponent } from './astro-component_B9QXdNd9.mjs';
import 'piccolore';
import { n as createRenderInstruction, r as renderTemplate, o as renderSlot, p as renderHead } from './entrypoint_a4CxbHHH.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "API Client - Mini Postman" } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Interactive API Client like Mini Postman"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"><title>', '</title><script>\n      (function () {\n        const stored = localStorage.getItem("theme");\n        const prefersDark = window.matchMedia(\n          "(prefers-color-scheme: dark)",\n        ).matches;\n        // Default to dark mode for Cyber-Glass aesthetic\n        const isDark = stored === "dark" || (!stored && true);\n        if (isDark) document.documentElement.classList.add("dark");\n      })();\n    <\/script>', '</head> <body class="min-h-screen flex flex-col font-sans bg-gray-50 bg-mesh-light text-gray-900 dark:bg-cyber-dark dark:bg-mesh-dark dark:text-gray-100 transition-colors duration-300"> <header class="sticky top-0 z-50 bg-white/70 dark:bg-cyber-surface/70 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 py-4 shadow-sm dark:shadow-none"> <nav class="flex items-center justify-between max-w-7xl mx-auto w-full"> <a href="/" class="text-xl font-bold bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"> <circle cx="12" cy="12" r="10" opacity="0.3"></circle> <path d="M7 12h10"></path> <path d="M7 12l3-3"></path> <path d="M7 12l3 3"></path> <path d="M17 12l-3-3"></path> <path d="M17 12l-3 3"></path> <circle cx="12" cy="7" r="1.5" fill="currentColor"></circle> <circle cx="12" cy="17" r="1.5" fill="currentColor"></circle> </svg>\nAPI Client\n</a> <div class="flex gap-6 items-center"> <a href="/" class="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-all">Home</a> <a href="/collections" class="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-all">Collections</a> <a href="/environments" class="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-all">Envs</a> <a href="/settings" class="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-all">Settings</a> </div> </nav> </header> <main class="flex-1 w-full max-w-[1600px] mx-auto flex flex-col"> ', ' </main> <footer class="bg-white/50 dark:bg-cyber-surface/50 backdrop-blur-sm border-t border-gray-200 dark:border-white/5 px-6 py-4 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors"> <p class="flex items-center justify-center gap-2">\nAPI Client v0.0.1\n<span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>\nCreado por Ignacio Ledesma\n<span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>\n&copy; 2026\n</p> </footer> ', " </body> </html>"])), title, renderHead(), renderSlot($$result, $$slots["default"]), renderScript($$result, "D:/a/iconos/Programacion/Proyectos/api-client/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"));
}, "D:/a/iconos/Programacion/Proyectos/api-client/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
