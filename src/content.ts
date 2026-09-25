/**
 * Loads and validates the Module definitions at build time.
 *
 * The YAML is imported as a raw string and parsed here, so the data ships in
 * the bundle with no runtime fetch — v1 is a static site with no backend.
 */
import { load } from "js-yaml";
import raw from "./data/modules.yaml?raw";
import { validateModules, type ModuleData, type Module, type StagedModule } from "./modules";

export const data: ModuleData = validateModules(load(raw) as ModuleData);

/** Modules in their declared narrative order. */
export const modules: Module[] = [...data.modules].sort((a, b) => a.order - b.order);

export const stagedModules = modules.filter((m): m is StagedModule => m.kind === "staged");

export const groupName = (id: string): string =>
  data.groups.find((g) => g.id === id)?.name ?? id;
