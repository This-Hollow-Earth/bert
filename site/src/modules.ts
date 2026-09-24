/**
 * Types and build-time validation for BERT's Module definitions.
 *
 * The schema is enforced here rather than merely documented in the YAML, per
 * THI-73: "Module/Item definitions in YAML, typed schema, validated at build."
 * validateModules() is called at build time so a malformed content edit fails
 * the build instead of shipping a broken assessment.
 */

export const GROUPS = ["commercial", "delivery", "product-engineering", "corporate"] as const;
export const OFFICES = ["front", "back"] as const;
export const KINDS = ["staged", "binary"] as const;

export type GroupId = (typeof GROUPS)[number];
export type Office = (typeof OFFICES)[number];
export type Kind = (typeof KINDS)[number];

export interface Group {
  id: GroupId;
  name: string;
}

/** A Cons2SaaS stage option, shared across every staged Module in v1. */
export interface Stage {
  id: string; // A-E
  stage: 1 | 2 | 3 | 4 | 5;
  name: string;
  text: string;
}

interface ModuleBase {
  /** Stable forever, never reused. A split creates new ids and retires the old one. */
  id: string;
  name: string;
  order: number;
  group: GroupId;
  office: Office;
}

/** Placed on the Cons2SaaS curve via the shared 5-option question. */
export interface StagedModule extends ModuleBase {
  kind: "staged";
  /** Who asks this Module for things. Defaults to the client when omitted. */
  requester?: string;
}

/**
 * A yes/no on whether a dedicated person or team exists. These sit outside the
 * consultancy-to-SaaS tension — they are presence-signals of a mature
 * organisation, which is why they are not staged.
 */
export interface BinaryModule extends ModuleBase {
  kind: "binary";
  question: string;
}

export type Module = StagedModule | BinaryModule;

export interface ModuleData {
  schema_version: number;
  groups: Group[];
  stages: Stage[];
  absent_answer: { id: string; text: string };
  modules: Module[];
}

/** Requester used by staged Modules that don't override it. */
export const DEFAULT_REQUESTER = "your clients";

export function requesterFor(m: Module): string | null {
  return m.kind === "staged" ? (m.requester ?? DEFAULT_REQUESTER) : null;
}

/** Front/back office is an independent axis, NOT derived from group: marketing
 *  is commercial but back office, a sales engineer is engineering but front. */
export function officeFor(m: Module): Office {
  return m.office;
}

const ID_RE = /^[a-z][a-z0-9-]*$/;

/**
 * Throws on the first structural problem, listing every error found.
 * Call at build time.
 */
export function validateModules(data: ModuleData): ModuleData {
  const errors: string[] = [];

  if (data.schema_version !== 1) {
    errors.push(`schema_version must be 1, got ${data.schema_version}`);
  }

  const groupIds = new Set(data.groups?.map((g) => g.id) ?? []);
  for (const g of data.groups ?? []) {
    if (!(GROUPS as readonly string[]).includes(g.id)) {
      errors.push(`unknown group id "${g.id}"`);
    }
  }

  if (!Array.isArray(data.modules) || data.modules.length === 0) {
    errors.push("modules must be a non-empty array");
    throw new Error(`modules.yaml is invalid:\n  - ${errors.join("\n  - ")}`);
  }

  const seenIds = new Set<string>();
  const orders: number[] = [];

  for (const m of data.modules) {
    const where = `module "${m.id ?? "(missing id)"}"`;

    if (!m.id || !ID_RE.test(m.id)) {
      errors.push(`${where}: id must match ${ID_RE}`);
    }
    if (seenIds.has(m.id)) {
      errors.push(`${where}: duplicate id — ids are stable and unique forever`);
    }
    seenIds.add(m.id);

    if (!m.name) errors.push(`${where}: missing name`);

    if (!Number.isInteger(m.order)) {
      errors.push(`${where}: order must be an integer`);
    } else {
      orders.push(m.order);
    }

    if (!groupIds.has(m.group)) {
      errors.push(`${where}: unknown group "${m.group}" (expected one of ${GROUPS.join(", ")})`);
    }
    if (!(OFFICES as readonly string[]).includes(m.office)) {
      errors.push(`${where}: office must be one of ${OFFICES.join(", ")}, got "${m.office}"`);
    }
    if (!(KINDS as readonly string[]).includes(m.kind)) {
      errors.push(`${where}: kind must be one of ${KINDS.join(", ")}, got "${m.kind}"`);
      continue;
    }

    // kind-specific field rules
    if (m.kind === "binary") {
      if (!m.question) {
        errors.push(`${where}: binary modules require a "question"`);
      }
      if ("requester" in m && (m as unknown as StagedModule).requester !== undefined) {
        errors.push(`${where}: binary modules must not set "requester" — they have no requester`);
      }
    } else {
      if ("question" in m && (m as unknown as BinaryModule).question !== undefined) {
        errors.push(`${where}: staged modules must not set "question" — they use the shared stage options`);
      }
    }
  }

  // order must be unique and contiguous from 1
  const sorted = [...orders].sort((a, b) => a - b);
  const expected = sorted.map((_, i) => i + 1);
  if (sorted.length !== new Set(sorted).size) {
    errors.push(`order values must be unique, got [${orders.join(", ")}]`);
  } else if (sorted.join() !== expected.join()) {
    errors.push(`order values must be contiguous from 1, got [${sorted.join(", ")}]`);
  }

  // v1 ships the stage-placement flow, so staged modules and their options must exist
  if (!data.stages || data.stages.length !== 5) {
    errors.push(`stages must contain exactly 5 options, got ${data.stages?.length ?? 0}`);
  }
  if (!data.absent_answer?.text) {
    errors.push(`absent_answer is required — staged modules offer it instead of a skip`);
  }
  if (!data.modules.some((m) => m.kind === "staged")) {
    errors.push("at least one staged module is required");
  }

  if (errors.length) {
    throw new Error(`modules.yaml is invalid:\n  - ${errors.join("\n  - ")}`);
  }
  return data;
}
