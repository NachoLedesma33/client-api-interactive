import { $ as $$BaseLayout } from './BaseLayout_CDTvAxEA.mjs';
import { c as createComponent } from './astro-component_B9QXdNd9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_a4CxbHHH.mjs';

const $$Environments = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Environments - API Client" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto"> <h1 class="text-2xl font-bold mb-6">Environments</h1> ${renderComponent($$result2, "EnvironmentsManager", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/EnvironmentsManager.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/environments.astro", void 0);

const $$file = "D:/a/iconos/Programacion/Proyectos/api-client/src/pages/environments.astro";
const $$url = "/environments";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Environments,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
