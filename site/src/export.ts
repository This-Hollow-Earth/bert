/**
 * The four v1 delivery formats (THI-73): print, self-contained .html download,
 * copy-paste text, and a .json answers export. No PDF library — every OS prints
 * to PDF for free, so the print stylesheet covers it.
 */
import type { ModuleData, Module } from "./modules";
import { exportJSON } from "./storage";
import { contextFor, contextLabel, spreadSentence, type Result, type Placement } from "./results";

const DATE = (iso: string) => iso.slice(0, 10);

function stateLabel(p: Placement): string {
  switch (p.state) {
    case "placed":
      return `Stage ${p.stage.stage} — ${p.stage.name}`;
    case "absent":
      return "This function doesn't exist here";
    case "present":
      return "Dedicated person or team";
    case "missing":
      return "No dedicated person or team";
    case "unanswered":
      return "Not assessed";
  }
}

/** Plain-text rendering, used for copy-paste. */
export function toText(data: ModuleData, r: Result): string {
  const L: string[] = [];
  L.push(`BERT — stage placement`);
  L.push(`${r.assessment.name}`);
  L.push(`Assessed ${DATE(r.assessment.updated)}`);
  if (!r.complete) L.push(`Partial: ${r.answered} of ${r.total} parts assessed.`);
  L.push("");

  const spread = spreadSentence(data, r.spread);
  if (spread) {
    L.push(spread);
    L.push("");
  }

  for (const p of r.placements) {
    L.push(`${p.module.name}`);
    L.push(`  ${stateLabel(p)}`);
    const ctx = contextFor(p, p.module);
    if (ctx) L.push(`  ${contextLabel(p)}: ${ctx}`);
    L.push("");
  }

  if (r.notThere.length) {
    L.push(`What isn't there`);
    for (const p of r.notThere) L.push(`  ${p.module.name} — ${stateLabel(p)}`);
    L.push("");
  }

  L.push(`Not included in this assessment: graded checklists across the three`);
  L.push(`Principles — Tested, Documented, Automated. That is the next step.`);
  L.push("");
  L.push(`BERT — by This Hollow Earth`);
  return L.join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * A self-contained .html file: styles inlined, no scripts, no external refs.
 * Opens and prints anywhere, years from now, with no BERT install.
 */
export function toHTML(data: ModuleData, r: Result): string {
  const spread = spreadSentence(data, r.spread);
  const rows = r.placements
    .map((p) => {
      const ctx = contextFor(p, p.module);
      return `  <section class="m ${p.state}">
    <h2>${esc(p.module.name)}</h2>
    <p class="state">${esc(stateLabel(p))}</p>
    ${ctx ? `<p class="next"><span>${esc(contextLabel(p) ?? "")}</span> ${esc(ctx)}</p>` : ""}
  </section>`;
    })
    .join("\n");

  const notThere = r.notThere.length
    ? `  <section class="notthere">
    <h2>What isn't there</h2>
    <ul>${r.notThere.map((p) => `<li>${esc(p.module.name)} — ${esc(stateLabel(p))}</li>`).join("")}</ul>
  </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>BERT — ${esc(r.assessment.name)}</title>
<style>
  :root { --paper:#f5f5f5; --ink:#434343; --soft:rgba(67,67,67,.55); --line:1px solid rgba(67,67,67,.25); }
  * { box-sizing:border-box; }
  body { background:var(--paper); color:var(--ink); font:15px/1.6 Helvetica,Arial,sans-serif;
         max-width:44rem; margin:0 auto; padding:48px 24px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  header { border-bottom:var(--line); padding-bottom:12px; margin-bottom:24px; }
  h1 { font-size:20px; margin:0; letter-spacing:.02em; }
  .meta { font:12px/1.5 ui-monospace,Menlo,Consolas,monospace; color:var(--soft); margin-top:4px; }
  .spread { border:var(--line); padding:14px 16px; margin-bottom:28px; }
  .m { border-top:1px dashed rgba(67,67,67,.35); padding:14px 0; }
  .m h2 { font-size:15px; margin:0 0 4px; }
  .state { margin:0; }
  .m.unanswered .state { color:var(--soft); font-style:italic; }
  .m.absent .state, .m.missing .state { font-weight:bold; }
  .next { margin:6px 0 0; color:var(--soft); font-size:14px; }
  .next span { font:11px/1 ui-monospace,monospace; text-transform:uppercase; letter-spacing:.08em;
                border:var(--line); padding:2px 5px; margin-right:6px; }
  .notthere { border:var(--line); padding:14px 16px; margin-top:28px; }
  .notthere h2 { font-size:15px; margin:0 0 8px; }
  .notthere ul { margin:0; padding-left:18px; }
  .v2 { margin-top:28px; padding:14px 16px; border:1px dashed rgba(67,67,67,.35); color:var(--soft); font-size:14px; }
  footer { margin-top:32px; border-top:var(--line); padding-top:10px;
           font:12px/1.5 ui-monospace,monospace; color:var(--soft); }
  @page { margin:18mm; }
  @media print { body { padding:0; max-width:none; } .m { break-inside:avoid; } }
</style>
</head>
<body>
<header>
  <h1>BERT — stage placement</h1>
  <p class="meta">${esc(r.assessment.name)} · assessed ${DATE(r.assessment.updated)}${
    r.complete ? "" : ` · partial: ${r.answered}/${r.total} assessed`
  }</p>
</header>
${spread ? `<p class="spread">${esc(spread)}</p>` : ""}
${rows}
${notThere}
<p class="v2">Not included in this assessment: graded checklists across the three Principles — Tested, Documented, Automated. That is the next step.</p>
<footer>BERT — by This Hollow Earth</footer>
</body>
</html>
`;
}

export function toJSON(r: Result): string {
  return exportJSON(r.assessment);
}

/** Triggers a browser download without any library. */
export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "assessment"
  );
}

export const labelFor = stateLabel;
export type { Module };
