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

/** A Cons2SaaS stage option. */
export interface Stage {
  id: string; // A-E
  stage: 1 | 2 | 3 | 4 | 5;
  name: string;
  /**
   * GENERAL symptoms — true at this stage in any Module. Rendered after the
   * Module's own symptoms, visually secondary, so the five options stay
   * comparable across departments.
   */
  symptoms: string[];
  /**
   * Only on the top stage, which has no next rung. THI-74: the results page
   * says what HOLDING this stage requires rather than inventing a stage 6.
   */
  holding?: string;
}

/** One Module's authored copy for one stage. */
export interface ModuleStage {
  /** ONE sentence naming this stage for this Module. */
  defining: string;
  /** Concrete, Module-specific observations. Capped at MAX_MODULE_SYMPTOMS. */
  symptoms: string[];
}

/** Bullets shown for a Module at a stage: its own, then the general ones. */
export const MAX_MODULE_SYMPTOMS = 3;

interface ModuleBase {
  /** Stable forever, never reused. A split creates new ids and retires the old one. */
  id: string;
  name: string;
  order: number;
  group: GroupId;
  office: Office;
}

/** Placed on the Cons2SaaS curve via the 5-option question. */
export interface StagedModule extends ModuleBase {
  kind: "staged";
  /** Who asks this Module for things. Defaults to DEFAULT_REQUESTER. */
  requester?: string;
  /** Authored copy for all five stages, keyed by stage id (A-E). */
  stages: Record<string, ModuleStage>;
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

/** Placeholder-free since schema v2: copy is authored per Module. */

/** This Module's authored copy for a stage. */
export function moduleStage(m: Module, stage: Stage): ModuleStage | null {
  return m.kind === "staged" ? (m.stages[stage.id] ?? null) : null;
}

/** The one sentence naming this stage for this Module. */
export function definingFor(m: Module, stage: Stage): string | null {
  return moduleStage(m, stage)?.defining ?? null;
}

/**
 * Bullets for a Module at a stage: the Module's own concrete symptoms first,
 * then the stage's general ones. Callers that need to style the general ones
 * differently can use `generalFrom` to find the boundary.
 */
export function symptomsFor(m: Module, stage: Stage): string[] {
  const own = moduleStage(m, stage)?.symptoms ?? [];
  return [...own, ...stage.symptoms];
}

/** Index in symptomsFor() where the general, stage-level symptoms begin. */
export function generalFrom(m: Module, stage: Stage): number {
  return moduleStage(m, stage)?.symptoms.length ?? 0;
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

  if (data.schema_version !== 2) {
    errors.push(`schema_version must be 2, got ${data.schema_version}`);
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

  // Schema v2: every staged Module authors all five stages. A missing entry
  // would render a blank option, so this is a hard error rather than a fallback.
  const stageIds = (data.stages ?? []).map((s) => s.id);
  for (const m of data.modules) {
    if (m.kind !== "staged") continue;
    const authored = m.stages ?? {};

    for (const sid of stageIds) {
      const ms = authored[sid];
      const where = `module "${m.id}" stage "${sid}"`;
      if (!ms) {
        errors.push(`${where}: missing — every staged module must author all 5 stages`);
        continue;
      }
      if (!ms.defining?.trim()) {
        errors.push(`${where}: "defining" is required — one sentence naming the stage`);
      } else {
        // One sentence: the point is a scannable line, not a paragraph.
        const sentences = ms.defining.trim().split(/[.!?]+\s+/).filter(Boolean).length;
        if (sentences > 1) {
          errors.push(`${where}: "defining" must be ONE sentence, found ${sentences}`);
        }
        if (!/[.!?]$/.test(ms.defining.trim())) {
          errors.push(`${where}: "defining" must end with punctuation`);
        }
      }
      if (!Array.isArray(ms.symptoms) || ms.symptoms.length === 0) {
        errors.push(`${where}: at least one symptom is required`);
      } else if (ms.symptoms.length > MAX_MODULE_SYMPTOMS) {
        errors.push(
          `${where}: ${ms.symptoms.length} symptoms exceeds the cap of ${MAX_MODULE_SYMPTOMS} — ` +
            `more than that stops being scannable and breaks the 5-minute budget`,
        );
      }
      for (const sym of ms.symptoms ?? []) {
        // Bullets, not prose: no trailing full stop, and no multi-sentence text.
        if (/[.]$/.test(sym.trim())) {
          errors.push(`${where}: symptom "${sym.slice(0, 40)}…" must not end with a full stop`);
        }
      }
    }

    // Catch copy authored against a stage id that doesn't exist (typo'd key).
    for (const sid of Object.keys(authored)) {
      if (!stageIds.includes(sid)) {
        errors.push(`module "${m.id}": unknown stage id "${sid}" in stages`);
      }
    }
  }

  // Every stage needs at least one general symptom: they are what keeps the
  // five options comparable across Modules.
  for (const s of data.stages ?? []) {
    if (!Array.isArray(s.symptoms) || s.symptoms.length === 0) {
      errors.push(`stage "${s.id}": at least one general symptom is required`);
    }
  }

  // THI-116: the copy is user-agnostic — a consultant may be assessing a client,
  // or the client may be self-assessing. First/second person silently assumes
  // one of those. Caught at build time so the voice cannot quietly regress.
  const VOICE_RE = /\b(we|us|our|ours|your|yours|you)\b/i;
  const voiceCheck: Array<[string, string]> = [
    ...(data.stages ?? []).flatMap((s) => {
      const out: Array<[string, string]> = s.symptoms.map(
        (t, i) => [`stage "${s.id}" general symptom ${i + 1}`, t] as [string, string],
      );
      if (s.holding) out.push([`stage "${s.id}" holding`, s.holding]);
      return out;
    }),
    ...(data.absent_answer?.text ? [["absent_answer", data.absent_answer.text] as [string, string]] : []),
    ...data.modules.flatMap((m) => {
      const out: Array<[string, string]> = [];
      if (m.kind === "binary" && m.question) out.push([`module "${m.id}" question`, m.question]);
      if (m.kind === "staged") {
        if (m.requester) out.push([`module "${m.id}" requester`, m.requester]);
        for (const [sid, ms] of Object.entries(m.stages ?? {})) {
          if (ms?.defining) out.push([`module "${m.id}" stage "${sid}" defining`, ms.defining]);
          (ms?.symptoms ?? []).forEach((t, i) =>
            out.push([`module "${m.id}" stage "${sid}" symptom ${i + 1}`, t]),
          );
        }
      }
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

  // Per-Module copy exists to make each department read differently. Identical
  // defining sentences across Modules mean the authoring silently regressed to
  // the generic wording this schema replaced.
  for (const s of data.stages ?? []) {
    const seen = new Map<string, string[]>();
    for (const m of data.modules) {
      if (m.kind !== "staged") continue;
      const d = m.stages?.[s.id]?.defining?.trim().toLowerCase();
      if (!d) continue;
      seen.set(d, [...(seen.get(d) ?? []), m.id]);
    }
    for (const [text, ids] of seen) {
      if (ids.length > 1) {
        errors.push(
          `stage "${s.id}": modules ${ids.join(", ")} share the same defining sentence ` +
            `("${text.slice(0, 40)}…") — per-module copy must actually differ`,
        );
      }
    }
  }

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
