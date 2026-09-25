import { defineConfig, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { validateModules, type ModuleData } from "./src/modules.js";

/**
 * Fail the build on invalid Module content.
 *
 * THI-73 requires Module definitions to be "YAML data under a typed schema,
 * validated at build" — this plugin is what makes that true rather than
 * aspirational. A malformed content edit breaks `npm run build` instead of
 * shipping a broken assessment.
 */
function validateModuleData(): Plugin {
  const file = "src/data/modules.yaml";
  return {
    name: "bert-validate-modules",
    buildStart() {
      const data = load(readFileSync(file, "utf8")) as ModuleData;
      validateModules(data);
      const staged = data.modules.filter((m) => m.kind === "staged").length;
      const binary = data.modules.length - staged;
      this.info(`${file}: ${data.modules.length} modules (${staged} staged, ${binary} binary)`);
    },
    handleHotUpdate({ file: changed }) {
      if (changed.endsWith("modules.yaml")) {
        const data = load(readFileSync(file, "utf8")) as ModuleData;
        validateModules(data); // throws into the dev overlay on a bad edit
      }
    },
  };
}

export default defineConfig({
  plugins: [svelte(), validateModuleData()],
  build: {
    // v1 is a static site: no backend, no SSR. Output is deployed as-is.
    outDir: "dist",
    emptyOutDir: true,
  },
});
