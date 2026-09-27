<script setup>
// Shared popup: dimmed backdrop, card with a round icon badge, title, message and buttons.
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  tone: { type: String, default: 'accent' }, // 'accent' (green) or 'warn' (red)
})
const emit = defineEmits(['close'])

const onKey = (e) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div class="badge" :class="tone" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30"><slot name="icon" /></svg>
      </div>
      <h2 id="dialog-title">{{ title }}</h2>
      <p v-if="message">{{ message }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: grid;
  place-items: center;
  padding: 16px;
  animation: fade 0.25s;
  z-index: 10;
}
.dialog {
  width: min(320px, 100%);
  background: var(--surface);
  border-radius: 20px;
  padding: 28px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
  animation: pop 0.3s cubic-bezier(0.2, 1.4, 0.4, 1);
}
.badge {
  margin: 0 auto 4px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--accent);
}
.badge.warn {
  background: var(--bad);
}
.badge :slotted(path) {
  fill: none;
  stroke: var(--on-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
h2 {
  margin: 0;
  font-size: 24px;
}
p {
  margin: 0 0 8px;
  color: var(--muted);
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
@keyframes pop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
}
</style>
