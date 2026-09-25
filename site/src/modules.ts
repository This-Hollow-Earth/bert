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
  /** May contain the `{requester}` placeholder, filled per Module at render. */
  text: string;
  /**
   * Only on the top stage, which has no next rung. THI-74: the results page
   * says what HOLDING this stage requires rather than inventing a stage 6.
   */
  holding?: string;
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

/**
 * Requester used by staged Modules that don't override it.
 * THI-116: no possessive — the site cannot know whether a consultant or the
 * client is answering, so "clients" rather than "your clients".
 */
export const DEFAULT_REQUESTER = "clients";

export function requesterFor(m: Module): string | null {
  return m.kind === "staged" ? (m.requester ?? DEFAULT_REQUESTER) : null;
}

/** Placeholder in stage text, replaced with the Module's requester. */
export const REQUESTER_TOKEN = "{requester}";

/**
 * Fills `{requester}` in a stage's text for a given Module.
 * Binary Modules have no requester and never render stage text.
 */
export function stageTextFor(stage: Stage, m: Module): string {
  const who = requesterFor(m);
  if (who === null) return stage.text;
  return stage.text.split(REQUESTER_TOKEN).join(who);
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

  // THI-74: the top stage has no next rung, so it must carry `holding` text for
  // the results page to use in place of a next-stage description.
  const top = [...(data.stages ?? [])].sort((a, b) => b.stage - a.stage)[0];
  if (top && !top.holding) {
    errors.push(
      `stage "${top.id}" is the top stage and must define "holding" — it has no next stage up`,
    );
  }
  for (const s of data.stages ?? []) {
    if (s.holding && top && s.stage !== top.stage) {
      errors.push(`stage "${s.id}": only the top stage may define "holding"`);
    }
  }

  // THI-116: the copy is user-agnostic — a consultant may be assessing a client,
  // or the client may be self-assessing. First/second person silently assumes
  // one of those. Caught at build time so the voice cannot quietly regress.
  const VOICE_RE = /\b(we|us|our|ours|your|yours|you)\b/i;
  const voiceCheck: Array<[string, string]> = [
    ...(data.stages ?? []).flatMap(
      (s) =>
        [
          [`stage "${s.id}" text`, s.text],
          ...(s.holding ? [[`stage "${s.id}" holding`, s.holding] as [string, string]] : []),
        ] as Array<[string, string]>,
    ),
    ...(data.absent_answer?.text ? [["absent_answer", data.absent_answer.text] as [string, string]] : []),
    ...data.modules.flatMap((m) => {
      const out: Array<[string, string]> = [];
      if (m.kind === "binary" && m.question) out.push([`module "${m.id}" question`, m.question]);
      if (m.kind === "staged" && m.requester) out.push([`module "${m.id}" requester`, m.requester]);
      return out;
    }),
  ];
  for (const [where, text] of voiceCheck) {
    const hit = VOICE_RE.exec(text);
    if (hit) {
      errors.push(
        `${where}: first/second person "${hit[0]}" — copy must read the same whether a ` +
          `consultant or the client is answering (THI-116)`,
      );
    }
  }

  // Every staged Module resolves {requester}; an unfilled placeholder would
  // otherwise ship to the page verbatim.
  for (const m of data.modules) {
    if (m.kind === "staged" && !requesterFor(m)) {
      errors.push(`module "${m.id}": staged modules must resolve a requester`);
    }
  }

  if (errors.length) {
    throw new Error(`modules.yaml is invalid:\n  - ${errors.join("\n  - ")}`);
  }
  return data;
}
