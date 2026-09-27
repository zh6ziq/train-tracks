<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

// A new version waits in the background until the player chooses to reload.
// Progress is in localStorage, so reloading never loses it.
const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

<template>
  <aside v-if="needRefresh" class="update" role="status">
    <p>A new version is ready.</p>
    <button class="primary" @click="updateServiceWorker(true)">Reload</button>
    <button class="icon-btn" aria-label="Later" @click="needRefresh = false">
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </aside>
</template>

<style scoped>
.update {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + 16px);
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 528px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--grid);
  border-radius: 14px;
  padding: 8px 6px 8px 14px;
  font-size: 14px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
  z-index: 5; /* below dialogs (10) */
}
.update p {
  margin: 0;
  flex: 1;
}
.update .primary {
  padding: 8px 14px;
  font-size: 15px;
}
</style>
