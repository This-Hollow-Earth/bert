<script lang="ts">
  import { modules, stagedModules, groupName, data } from "./content";
  import { requesterFor } from "./modules";
  import * as store from "./storage";
  import type { Assessment } from "./storage";

  let current: Assessment | null = $state(store.list()[0] ?? null);
  let newName = $state("");

  const answered = $derived(current ? Object.keys(current.answers).length : 0);
  const total = modules.length;

  function start() {
    current = store.create(newName);
    newName = "";
  }

  function pickStage(moduleId: string, stageId: string) {
    if (!current) return;
    current = store.answer(current, moduleId, { kind: "staged", stage: stageId });
  }

  function pickAbsent(moduleId: string) {
    if (!current) return;
    current = store.answer(current, moduleId, { kind: "staged", absent: true });
  }

  function pickBinary(moduleId: string, dedicated: boolean) {
    if (!current) return;
    current = store.answer(current, moduleId, { kind: "binary", dedicated });
  }

  function isChosen(moduleId: string, stageId: string): boolean {
    const a = current?.answers[moduleId];
    return !!a && a.kind === "staged" && "stage" in a && a.stage === stageId;
  }

  function isAbsent(moduleId: string): boolean {
    const a = current?.answers[moduleId];
    return !!a && a.kind === "staged" && "absent" in a;
  }

  function isBinary(moduleId: string, v: boolean): boolean {
    const a = current?.answers[moduleId];
    return !!a && a.kind === "binary" && a.dedicated === v;
  }
</script>

<header class="site-header">
  <span class="logo" role="img" aria-label="This Hollow Earth cube logo"></span>
  <div class="title">
    <h1>BERT</h1>
    <span class="tagline">Where each part of your organisation sits, and what's next.</span>
  </div>
  <span class="assessment-meta">
    {#if current}
      {current.name} · {current.created.slice(0, 10)} · {answered}/{total}
    {:else}
      no assessment
    {/if}
  </span>
</header>

<main class="page">
  {#if !current}
    <h2>Start an assessment</h2>
    <p>
      Name it after the organisation or engagement. Assessments are stored in this
      browser only — nothing is sent anywhere.
    </p>
    <p>
      <input type="text" bind:value={newName} placeholder="Organisation or engagement" />
      <button onclick={start}>Start</button>
    </p>
  {:else}
    <h2>Where does each part of the organisation sit?</h2>
    <p>
      Pick the paragraph closest to how each part actually works today — not how you
      wish it worked. {stagedModules.length} questions, plus {modules.length - stagedModules.length} quick ones at the end.
    </p>

    {#each modules as m (m.id)}
      <section>
        <h3>{m.name} <span class="tag">{groupName(m.group)}</span> <span class="tag">{m.office}</span></h3>

        {#if m.kind === "staged"}
          <p><small>Requests come from {requesterFor(m)}.</small></p>
          {#each data.stages as s (s.id)}
            <p>
              <button
                class:chosen={isChosen(m.id, s.id)}
                onclick={() => pickStage(m.id, s.id)}
              >{s.id}</button>
              {s.text}
            </p>
          {/each}
          <p>
            <button class:chosen={isAbsent(m.id)} onclick={() => pickAbsent(m.id)}>
              {data.absent_answer.text}
            </button>
          </p>
        {:else}
          <p>{m.question}</p>
          <p>
            <button class:chosen={isBinary(m.id, true)} onclick={() => pickBinary(m.id, true)}>Yes</button>
            <button class:chosen={isBinary(m.id, false)} onclick={() => pickBinary(m.id, false)}>No</button>
          </p>
        {/if}
      </section>
    {/each}

    <div class="placeholder">
      Deferred to v2: the full graded checklist across the three Principles —
      Tested, Documented, Automated.
    </div>
  {/if}
</main>

<footer class="site-footer">
  <span>BERT — by This Hollow Earth</span>
</footer>

<style>
  section {
    border-top: var(--dash);
    padding: 18px 0;
  }
  h3 {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }
  button.chosen {
    background: var(--ink);
    color: var(--paper);
  }
</style>
