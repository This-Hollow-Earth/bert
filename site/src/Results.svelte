<script lang="ts">
  import { data, modules } from "./content";
  import { computeResult, contextFor, contextLabel, spreadSentence } from "./results";
  import { toText, toHTML, toJSON, download, slug, labelFor } from "./export";
  import type { Assessment } from "./storage";

  interface Props {
    assessment: Assessment;
    onback: () => void;
  }
  const { assessment, onback }: Props = $props();

  const result = $derived(computeResult(data, modules, assessment));
  const spread = $derived(spreadSentence(data, result.spread));
  const date = $derived(assessment.updated.slice(0, 10));

  let copied = $state(false);

  async function copy() {
    await navigator.clipboard.writeText(toText(data, result));
    copied = true;
    setTimeout(() => (copied = false), 1600);
  }

  const base = $derived(`bert-${slug(assessment.name)}-${date}`);
</script>

<div class="results">
  <div class="actions no-print">
    <button onclick={onback}>← Back to questions</button>
    <span class="spacer"></span>
    <button onclick={() => window.print()}>Print</button>
    <button onclick={() => download(`${base}.html`, toHTML(data, result), "text/html")}>
      Download .html
    </button>
    <button onclick={copy}>{copied ? "Copied" : "Copy"}</button>
    <button onclick={() => download(`${base}.json`, toJSON(result), "application/json")}>
      .json
    </button>
  </div>

  <header class="result-head">
    <h2>Stage placement</h2>
    <p class="meta">
      {assessment.name} · assessed {date}
      {#if !result.complete}
        · <strong>partial: {result.answered} of {result.total} assessed</strong>
      {/if}
    </p>
  </header>

  {#if spread}
    <p class="spread">{spread}</p>
  {/if}

  {#each result.placements as p (p.module.id)}
    <section class="m {p.state}">
      <h3>{p.module.name}</h3>
      <p class="state">{labelFor(p)}</p>
      {#if contextFor(p, p.module)}
        <p class="next"><span class="tag">{contextLabel(p)}</span> {contextFor(p, p.module)}</p>
      {/if}
    </section>
  {/each}

  {#if result.notThere.length}
    <section class="notthere">
      <h3>What isn't there</h3>
      <ul>
        {#each result.notThere as p (p.module.id)}
          <li>{p.module.name} — {labelFor(p)}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="placeholder">
    Not included in this assessment: graded checklists across the three Principles
    — Tested, Documented, Automated. That is the next step.
  </div>
</div>

<style>
  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 24px;
  }
  .spacer { flex: 1; }

  .result-head { border-bottom: var(--line); padding-bottom: 10px; }
  .result-head h2 { margin: 0; }
  .meta {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    color: var(--ink-soft);
    margin: 4px 0 0;
  }

  .spread {
    border: var(--line);
    padding: 14px 16px;
    margin: 20px 0 28px;
  }

  .m {
    border-top: var(--dash);
    padding: 14px 0;
  }
  .m h3 { margin: 0 0 4px; font-size: 15px; }
  .state { margin: 0; }

  /* Not assessed must never look like a real answer. */
  .m.unanswered .state {
    color: var(--ink-soft);
    font-style: italic;
  }
  /* Absent is a finding, not a blank — distinct from both. */
  .m.absent .state,
  .m.missing .state {
    font-weight: bold;
  }

  .next {
    margin: 6px 0 0;
    color: var(--ink-soft);
    font-size: 14px;
  }

  .notthere {
    border: var(--line);
    padding: 14px 16px;
    margin-top: 28px;
  }
  .notthere h3 { margin: 0 0 8px; font-size: 15px; }
  .notthere ul { margin: 0; padding-left: 18px; }

  @media print {
    .no-print { display: none !important; }
    .m { break-inside: avoid; }
  }
</style>
