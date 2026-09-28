<script setup>
// Shows this device's sync code and lets the player bring in progress from another device.
import { ref, computed } from 'vue'
import { syncState } from '../game/storage.js'
import { syncStatus, formatCode, normalizeCode, useCode } from '../game/sync.js'

const code = computed(() => formatCode(syncState.code))
const copied = ref(false)
const entry = ref('')
const busy = ref(false)
const error = ref('')
const done = ref(false)

const status = computed(() => {
  if (syncStatus.value === 'syncing') return 'Syncing…'
  if (syncStatus.value === 'offline') return 'Not backed up right now. It’ll retry automatically.'
  if (syncState.last) return `Backed up ${new Date(syncState.last).toLocaleString()}`
  return 'Not backed up yet.'
})

async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard blocked: the code is still on screen to copy by hand.
  }
}

async function submit() {
  error.value = ''
  done.value = false
  if (!normalizeCode(entry.value)) {
    error.value = 'That code doesn’t look right.'
    return
  }
  busy.value = true
  try {
    await useCode(entry.value)
    entry.value = ''
    done.value = true
  } catch (e) {
    error.value = e.message.startsWith('sync') || e instanceof TypeError ? 'Couldn’t reach the server. Try again later.' : e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="sync">
    <p class="label">Your sync code</p>
    <div class="code-row">
      <code>{{ code }}</code>
      <button @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button>
    </div>
    <p class="hint">Keep this code. Enter it on another device, or after reinstalling, to get your progress back.</p>
    <p class="status">{{ status }}</p>

    <form class="enter" @submit.prevent="submit">
      <label for="sync-code" class="label">Have a code from another device?</label>
      <div class="code-row">
        <input
          id="sync-code"
          v-model="entry"
          placeholder="TRK-XXXX-XXXX-XXXX"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
        />
        <button type="submit" :disabled="busy || !entry">{{ busy ? '…' : 'Use code' }}</button>
      </div>
      <p class="hint">Progress on this device is combined with that code’s. Nothing is lost.</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="done" class="ok">Progress combined. This device now uses that code.</p>
    </form>
  </div>
</template>

<style scoped>
.sync {
  background: var(--surface);
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.5;
}
p {
  margin: 0;
}
.label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}
.code-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
code {
  flex: 1;
  font: 600 17px ui-monospace, 'SF Mono', Menlo, monospace;
  letter-spacing: 0.04em;
  color: var(--maybe);
}
input {
  flex: 1;
  min-width: 0;
  font: 600 16px ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--ink);
  background: var(--surface-2);
  border: 1px solid var(--grid);
  border-radius: 12px;
  padding: 11px 12px;
  text-transform: uppercase;
}
input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 1px;
}
.code-row button {
  padding: 10px 14px;
  font-size: 15px;
  flex-shrink: 0;
}
.hint,
.status {
  color: var(--muted);
  font-size: 13px;
  margin-top: 6px;
}
.enter {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--grid);
}
.error {
  color: var(--bad);
  margin-top: 6px;
}
.ok {
  color: var(--ok);
  margin-top: 6px;
}
</style>
