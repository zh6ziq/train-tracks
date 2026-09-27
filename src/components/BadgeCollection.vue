<script setup>
// Badges earned by solving puzzles. Unearned slots all look the same so nothing is given away.
import { computed } from 'vue'
import { BREEDS } from '../data/breeds.js'
import CatSprite from './CatSprite.js'

const props = defineProps({
  counts: { type: Object, default: () => ({}) },
})

const collected = computed(() => BREEDS.filter((b) => props.counts[b.id]).length)
</script>

<template>
  <section class="badges" aria-labelledby="badges-title">
    <p id="badges-title" class="summary">{{ collected }} / {{ BREEDS.length }} collected</p>
    <ul class="grid">
      <li v-for="breed in BREEDS" :key="breed.id" class="badge" :class="{ locked: !counts[breed.id] }">
        <template v-if="counts[breed.id]">
          <div class="medal">
            <svg viewBox="-22 -25 44 44" aria-hidden="true"><CatSprite :breed="breed" /></svg>
            <span class="count">×{{ counts[breed.id] }}</span>
          </div>
          <span class="name">{{ breed.name }}</span>
        </template>
        <template v-else>
          <div class="medal" aria-label="Locked badge">?</div>
          <span class="name blank" aria-hidden="true" />
        </template>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.badges {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.summary {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}
.grid {
  list-style: none;
  margin: 0;
  padding: 2px 2px 8px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 12px 8px;
  align-content: start;
}
.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.medal {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fbf3df;
  border: 3px solid var(--accent);
  display: grid;
  place-items: center;
}
.medal svg {
  width: 58px;
  height: 58px;
}
.count {
  position: absolute;
  right: -6px;
  bottom: -4px;
  min-width: 26px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 12px;
  font-weight: 700;
}
.name {
  font-size: 12px;
  line-height: 1.25;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.locked .medal {
  background: var(--surface-2);
  border: 3px dashed var(--grid);
  color: var(--muted);
  font-size: 26px;
  font-weight: 700;
}
.name.blank {
  width: 48px;
  height: 10px;
  border-radius: 5px;
  background: var(--surface-2);
}
</style>
