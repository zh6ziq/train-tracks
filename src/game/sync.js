// Background cloud backup of progress. localStorage stays the source of truth, so the game
// works offline; this just mirrors it to /api/progress under the device's sync code.
// Any failure (offline, no server, server asleep) is ignored and retried on the next trigger.
import { ref } from 'vue'
import { syncState, setSyncCode, exportProgress, importProgress, onProgressChange } from './storage.js'

// Crockford base32: no I, L, O or U, so codes are easy to read and type.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const CODE = /^[0-9A-HJKMNP-TV-Z]{12}$/

export const syncStatus = ref('idle') // 'idle' | 'syncing' | 'ok' | 'offline'

let changes = 0 // bumped on every local change, to tell if one happened mid-request
let timer = 0
let running = null

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => ALPHABET[b & 31]).join('')
}

// "TRK-7Q4M-X2PA-9KDE" -> "7Q4MX2PA9KDE"; also forgives lowercase and O/I/L typos.
export function normalizeCode(input) {
  let s = String(input).toUpperCase().replace(/[^0-9A-Z]/g, '')
  // Only drop "TRK" when it's the prefix, not the start of a code typed without one.
  if (s.length === 15 && s.startsWith('TRK')) s = s.slice(3)
  const fixed = s.replace(/O/g, '0').replace(/[IL]/g, '1')
  return CODE.test(fixed) ? fixed : null
}

export function formatCode(code) {
  return code ? `TRK-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}` : ''
}

async function put(code, body, keepalive = false) {
  const res = await fetch('/api/progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Sync-Code': code },
    body: JSON.stringify(body),
    keepalive,
  })
  if (!res.ok) throw new Error(`sync ${res.status}`)
  return (await res.json()).data
}

// Send local progress (the server merges it with its copy) and take the merged result back.
export function syncNow({ keepalive = false } = {}) {
  if (running || !syncState.code) return running
  const seen = changes
  syncStatus.value = 'syncing'
  running = put(syncState.code, exportProgress(), keepalive)
    .then((merged) => {
      importProgress(merged, changes !== seen)
      syncStatus.value = 'ok'
    })
    .catch(() => {
      syncStatus.value = 'offline'
    })
    .finally(() => {
      running = null
      // Something changed while we were sending: send again soon.
      if (changes !== seen) {
        clearTimeout(timer)
        timer = setTimeout(syncNow, 3000)
      }
    })
  return running
}

// Switch to a code from another device. This device's progress is merged in, never dropped.
export async function useCode(input) {
  const code = normalizeCode(input)
  if (!code) throw new Error('That code doesn’t look right.')
  const merged = await put(code, exportProgress())
  setSyncCode(code)
  importProgress(merged, false)
  syncStatus.value = 'ok'
}

export function startSync() {
  // First run of this version: give the device a code. Its existing progress is marked
  // dirty, so the first sync uploads it and nothing is lost.
  if (!syncState.code) setSyncCode(newCode())

  onProgressChange(() => {
    changes++
    clearTimeout(timer)
    timer = setTimeout(syncNow, 3000)
  })

  document.addEventListener('visibilitychange', () => {
    // Coming back: pick up progress from other devices. Leaving: flush pending changes.
    if (document.visibilityState === 'visible') syncNow()
    else if (syncState.dirty) syncNow({ keepalive: true })
  })

  syncNow()
}
