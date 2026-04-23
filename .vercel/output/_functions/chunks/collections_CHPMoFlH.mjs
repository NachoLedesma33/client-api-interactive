import { $ as $$BaseLayout } from './BaseLayout_Bb2y5Eli.mjs';
import { c as createComponent } from './astro-component_DH3y3ISD.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_C0SiE1cg.mjs';

const $$Collections = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Collections - API Client" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto"> <h1 class="text-2xl font-bold mb-6">Collections</h1> ${renderComponent($$result2, "CollectionsManager", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/CollectionsManager.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/collections.astro", void 0);

const $$file = "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/collections.astro";
const $$url = "/collections";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Collections,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
