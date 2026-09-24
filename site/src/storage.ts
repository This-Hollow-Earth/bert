/**
 * Assessment state, persisted to localStorage.
 *
 * THI-73: localStorage only in v1 — no backend, no cross-device handoff.
 * Assessments are NAMED and DATED so running BERT across several client
 * engagements on one laptop doesn't clobber earlier ones.
 *
 * The stored shape is deliberately the same shape as the `.json` export, which
 * has no importer in v1: it is forward-compatibility for v2 re-assessment and
 * the eventual results database.
 */

const KEY = "bert.assessments.v1";

/** One Module's answer. */
export type Answer =
  | { kind: "staged"; stage: string } // stage option id, A-E
  | { kind: "staged"; absent: true } // "we don't have this function"
  | { kind: "binary"; dedicated: boolean };

export interface Assessment {
  /** Stable id, generated once. */
  id: string;
  /** User-supplied name — the org or engagement being assessed. */
  name: string;
  /** ISO date the assessment was created. */
  created: string;
  /** ISO date of the last answer change. */
  updated: string;
  /** Keyed by Module id. Absent key = not yet assessed (NOT the same as `absent`). */
  answers: Record<string, Answer>;
}

function read(): Assessment[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Assessment[]) : [];
  } catch {
    return []; // corrupt or unavailable storage must not break the app
  }
}

function write(all: Assessment[]): void {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function list(): Assessment[] {
  return read().sort((a, b) => b.updated.localeCompare(a.updated));
}

export function get(id: string): Assessment | undefined {
  return read().find((a) => a.id === id);
}

export function create(name: string): Assessment {
  const now = new Date().toISOString();
  const a: Assessment = {
    id: crypto.randomUUID(),
    name: name.trim() || "Untitled assessment",
    created: now,
    updated: now,
    answers: {},
  };
  write([...read(), a]);
  return a;
}

export function save(a: Assessment): Assessment {
  const updated = { ...a, updated: new Date().toISOString() };
  write(read().map((x) => (x.id === a.id ? updated : x)));
  return updated;
}

export function answer(a: Assessment, moduleId: string, value: Answer): Assessment {
  return save({ ...a, answers: { ...a.answers, [moduleId]: value } });
}

export function remove(id: string): void {
  write(read().filter((a) => a.id !== id));
}

/** The `.json` export. Same shape as storage, plus provenance. */
export function exportJSON(a: Assessment): string {
  return JSON.stringify({ format: "bert-assessment", version: 1, assessment: a }, null, 2);
}
