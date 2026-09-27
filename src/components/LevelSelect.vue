<script setup>
import { ref, computed } from 'vue'
import { isLevelSolved } from '../game/storage.js'

const props = defineProps({
  levels: { type: Array, required: true },
  initialPack: { type: String, default: '' },
})
const emit = defineEmits(['back', 'play'])

const packs = [...new Set(props.levels.map((l) => l.pack))]
const pack = ref(props.initialPack || packs[0])

const visible = computed(() =>
  props.levels
    .map((level, index) => ({ level, index }))
    .filter(({ level }) => level.pack === pack.value),
)

const packProgress = (p) => {
  const all = props.levels.filter((l) => l.pack === p)
  return `${all.filter((l) => isLevelSolved(l.id)).length}/${all.length}`
}
</script>

<template>
  <section class="screen">
    <header class="bar">
      <button class="icon-btn" aria-label="Back to menu" @click="emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="title"><strong>Choose a puzzle</strong></div>
      <span class="spacer" />
    </header>

    <div class="tabs" role="tablist">
      <button
        v-for="p in packs"
        :key="p"
        role="tab"
        :aria-selected="p === pack"
        :class="{ active: p === pack }"
        @click="pack = p"
      >
        {{ p }}<small>{{ packProgress(p) }}</small>
      </button>
    </div>

    <div class="grid">
      <button
        v-for="({ level, index }, k) in visible"
        :key="level.id"
        class="lvl"
        :class="{ solved: isLevelSolved(level.id) }"
        :aria-label="`${level.pack} ${k + 1}${isLevelSolved(level.id) ? ', solved' : ''}`"
        @click="emit('play', index)"
      >
        {{ k + 1 }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 4px;
  background: var(--surface-2);
  border-radius: 14px;
}
.tabs button {
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tabs button small {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
}
.tabs button.active {
  background: var(--surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
}
.grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 8px;
  align-content: start;
  padding-bottom: 8px;
}
.lvl {
  aspect-ratio: 1;
  padding: 0;
  font-size: 17px;
}
.lvl.solved {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
</style>
