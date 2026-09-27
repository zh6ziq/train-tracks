<script setup>
import { ref } from 'vue'
import InstallHint from './InstallHint.vue'

defineProps({
  solved: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})
const emit = defineEmits(['continue', 'badges', 'levels'])
const showRules = ref(false)
</script>

<template>
  <section class="screen menu">
    <div class="hero">
      <svg class="logo" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="4" y="4" width="112" height="112" rx="26" class="logo-bg" />
        <path d="M20 44H52Q76 44 76 68V100" class="logo-sleepers" />
        <path d="M20 44H52Q76 44 76 68V100" class="logo-rail" />
      </svg>
      <h1>Train Tracks</h1>
      <p class="progress">{{ solved }} of {{ total }} puzzles solved</p>
    </div>

    <div class="actions">
      <button class="primary big" @click="emit('continue')">{{ solved ? 'Continue' : 'Play' }}</button>
      <button class="big" @click="emit('badges')">Badges</button>
      <button class="big" @click="emit('levels')">Choose puzzle</button>
      <button class="link" @click="showRules = !showRules">{{ showRules ? 'Hide rules' : 'How to play' }}</button>
    </div>

    <div v-if="showRules" class="rules">
      <p>Lay one unbroken track from <b>A</b> to <b>B</b>.</p>
      <ul>
        <li>The numbers show how many cells in that row or column hold track.</li>
        <li><b>Drag</b> across cells to lay track. Drag over existing track to remove it.</li>
        <li><b>Tap</b> an empty cell to mark it ✕ (no track). Tap your track to remove it.</li>
        <li>Shaded cells are given and can't be changed.</li>
        <li>No loops, no branches and no dead ends.</li>
      </ul>
    </div>

    <InstallHint />
  </section>
</template>

<style scoped>
.menu {
  justify-content: center;
  gap: 28px;
}
.hero {
  text-align: center;
}
.logo {
  width: 104px;
  height: 104px;
}
.logo-bg {
  fill: var(--surface);
  stroke: var(--grid);
}
.logo-sleepers,
.logo-rail {
  fill: none;
}
.logo-sleepers {
  stroke: var(--sleeper);
  stroke-width: 24;
  stroke-dasharray: 4 7;
}
.logo-rail {
  stroke: var(--accent);
  stroke-width: 6;
  stroke-linecap: round;
}
h1 {
  margin: 12px 0 4px;
  font-size: 34px;
  letter-spacing: -0.02em;
}
.progress {
  margin: 0;
  color: var(--muted);
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(320px, 100%);
  margin: 0 auto;
}
.rules {
  background: var(--surface);
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.5;
}
.rules p {
  margin: 0 0 6px;
}
.rules ul {
  margin: 0;
  padding-left: 18px;
}
</style>
