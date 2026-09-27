<script setup>
import { ref } from 'vue'
import { installHintDismissed, dismissInstallHint } from '../game/storage.js'

// iPhone/iPad never show an install prompt, so we explain Add to Home Screen ourselves.
const ua = navigator.userAgent
const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
const isInstalled = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches

const show = ref(isIOS && !isInstalled && !installHintDismissed())

function close() {
  show.value = false
  dismissInstallHint()
}
</script>

<template>
  <aside v-if="show" class="install">
    <p>
      <b>Play offline:</b> tap
      <svg viewBox="0 0 24 24" width="18" height="18" aria-label="Share" role="img">
        <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M6 11H5v10h14V11h-1" />
      </svg>
      <b>Share</b>, then <b>Add to Home Screen</b>.
    </p>
    <button class="icon-btn" aria-label="Dismiss" @click="close">
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </aside>
</template>

<style scoped>
.install {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--grid);
  border-radius: 14px;
  padding: 10px 10px 10px 14px;
  font-size: 14px;
}
.install p {
  margin: 0;
  flex: 1;
}
.install p svg {
  vertical-align: -3px;
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
