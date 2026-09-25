/**
 * Derives the stage-placement result from an assessment.
 *
 * Every rule here traces to THI-74:
 *   - the spread is an OBSERVATION (range + extremes), never a number
 *   - the per-Module summary reuses THI-11's next-stage-up text
 *   - the top stage has no next rung, so it uses `holding` instead
 *   - the three absence signals collect into one "what isn't there" section
 *   - "not assessed" is never conflated with any real answer
 *
 * Deliberately absent: Grades, per-Principle readings, roll-ups, scores, and
 * any notion of a target stage. No Module "should" be anywhere.
 */
import type { Module, Stage, ModuleData } from "./modules";
import { stageTextFor } from "./modules";
import type { Answer, Assessment } from "./storage";

/** What a single Module resolved to. Mutually exclusive by construction. */
export type Placement =
  | { state: "placed"; module: Module; stage: Stage; next: Stage | null; holding: string | null }
  | { state: "absent"; module: Module }
  | { state: "present"; module: Module } // binary: dedicated person/team exists
  | { state: "missing"; module: Module } // binary: none exists
  | { state: "unanswered"; module: Module };

export interface Spread {
  /** Lowest and highest stage NUMBERS actually observed. Never averaged. */
  low: number;
  high: number;
  /** Modules sitting at those stages — named, because the gap is the finding. */
  lowest: Module[];
  highest: Module[];
  /** True when every placed Module sits at the same stage. */
  level: boolean;
}

export interface Result {
  assessment: Assessment;
  placements: Placement[];
  /** null when fewer than two Modules are placed — nothing to compare. */
  spread: Spread | null;
  /** Absent staged Modules and binary Modules answered "no", in one list. */
  notThere: Placement[];
  answered: number;
  total: number;
  complete: boolean;
}

function stageOf(data: ModuleData, id: string): Stage | undefined {
  return data.stages.find((s) => s.id === id);
}

/** The next rung up, or null at the top. */
export function nextStage(data: ModuleData, current: Stage): Stage | null {
  return data.stages.find((s) => s.stage === current.stage + 1) ?? null;
}

function placeOne(data: ModuleData, m: Module, a: Answer | undefined): Placement {
  if (!a) return { state: "unanswered", module: m };

  if (a.kind === "binary") {
    return a.dedicated ? { state: "present", module: m } : { state: "missing", module: m };
  }
  if ("absent" in a) return { state: "absent", module: m };

  const stage = stageOf(data, a.stage);
  if (!stage) return { state: "unanswered", module: m }; // unknown id: treat as unanswered, never guess
  const next = nextStage(data, stage);
  return { state: "placed", module: m, stage, next, holding: next ? null : (stage.holding ?? null) };
}

export function computeSpread(placements: Placement[]): Spread | null {
  const placed = placements.filter(
    (p): p is Extract<Placement, { state: "placed" }> => p.state === "placed",
  );
  if (placed.length < 2) return null;

  const stages = placed.map((p) => p.stage.stage);
  const low = Math.min(...stages);
  const high = Math.max(...stages);
  return {
    low,
    high,
    lowest: placed.filter((p) => p.stage.stage === low).map((p) => p.module),
    highest: placed.filter((p) => p.stage.stage === high).map((p) => p.module),
    level: low === high,
  };
}

export function computeResult(
  data: ModuleData,
  modules: Module[],
  assessment: Assessment,
): Result {
  const placements = modules.map((m) => placeOne(data, m, assessment.answers[m.id]));
  const answered = placements.filter((p) => p.state !== "unanswered").length;

  return {
    assessment,
    placements,
    spread: computeSpread(placements),
    // THI-74: absent staged Modules and binary "no" are the same signal in
    // different clothes, so they are collected rather than scattered.
    notThere: placements.filter((p) => p.state === "absent" || p.state === "missing"),
    answered,
    total: modules.length,
    complete: answered === modules.length,
  };
}

/**
 * The one sentence about the organisation as a whole.
 * States the range and names the extremes. No average, no ranking, no score.
 */
export function spreadSentence(data: ModuleData, s: Spread | null): string | null {
  if (!s) return null;
  const name = (n: number) => data.stages.find((x) => x.stage === n)?.name ?? `stage ${n}`;
  const list = (ms: Module[]) => ms.map((m) => m.name).join(" and ");

  if (s.level) {
    return `Every assessed part of the organisation sits at the same stage: ${s.low} (${name(s.low)}).`;
  }
  return (
    `The assessed parts of the organisation sit between stage ${s.low} (${name(s.low)}) ` +
    `and stage ${s.high} (${name(s.high)}). ` +
    `Furthest along: ${list(s.highest)}. Least far: ${list(s.lowest)}.`
  );
}

/** Per-Module context line: the next rung up, or what holding the top requires. */
export function contextFor(p: Placement, m: Module): string | null {
  if (p.state !== "placed") return null;
  if (p.next) return stageTextFor(p.next, m);
  return p.holding;
}

/**
 * Label for the context line. The top stage has no next rung, so labelling its
 * holding text "Next" would contradict the sentence that follows it.
 */
export function contextLabel(p: Placement): string | null {
  if (p.state !== "placed") return null;
  return p.next ? "Next" : "Holding";
}
