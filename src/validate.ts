/**
 * Build-time check for src/data/modules.yaml.
 * Run with: npm run validate
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { load } from "js-yaml";
import { validateModules, requesterFor, type ModuleData } from "./modules.js";

const here = dirname(fileURLToPath(import.meta.url));
const path = resolve(here, "data/modules.yaml");

const data = load(readFileSync(path, "utf8")) as ModuleData;
validateModules(data);

const staged = data.modules.filter((m) => m.kind === "staged");
const binary = data.modules.filter((m) => m.kind === "binary");

console.log(`modules.yaml OK — ${data.modules.length} modules (${staged.length} staged, ${binary.length} binary)\n`);
console.log("  #  module                 group                office  kind    requester");
for (const m of [...data.modules].sort((a, b) => a.order - b.order)) {
  const r = requesterFor(m) ?? "—";
  console.log(
    `  ${String(m.order).padEnd(2)} ${m.name.padEnd(22)} ${m.group.padEnd(20)} ${m.office.padEnd(6)}  ${m.kind.padEnd(6)}  ${r}`,
  );
}

const byGroup = new Map<string, number>();
for (const m of data.modules) byGroup.set(m.group, (byGroup.get(m.group) ?? 0) + 1);
console.log(
  "\n  groups:",
  [...byGroup].map(([g, n]) => `${g}=${n}`).join(" "),
  "| office:",
  `front=${data.modules.filter((m) => m.office === "front").length}`,
  `back=${data.modules.filter((m) => m.office === "back").length}`,
);
