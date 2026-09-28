// Saved progress lives in localStorage. Every access is wrapped in try/catch
// because private browsing or cleared site data can make storage unavailable.
// It's reactive so screens update when a cloud sync (sync.js) brings in progress.
import { reactive } from 'vue'
import { merge } from './merge.js'

const KEY = 'train-tracks-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const data = reactive(
  Object.assign({ solved: {}, boards: {}, cats: {}, hintDismissed: false, sync: { code: '', dirty: false } }, load()),
)

let onChange = () => {}
// sync.js registers here to hear about every change that should reach the cloud.
export function onProgressChange(fn) {
  onChange = fn
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage full or blocked: the game still works, progress just isn't kept.
  }
}

function save() {
  data.sync.dirty = true
  write()
  onChange()
}

export function isLevelSolved(id) {
  return !!data.solved[id]
}

export function markSolved(id) {
  data.solved[id] = true
  delete data.boards[id]
  save()
}

export function solvedCount() {
  return Object.keys(data.solved).length
}

// In-progress board for a level: { m: masks as hex string, x: marks as "0120..." (0 none, 1 X, 2 maybe track), t: saved at }
// A board with no `m` marks a reset, so an older copy from another device can't bring it back.
export function loadBoard(id) {
  const board = data.boards[id]
  return board && board.m ? board : null
}

export function saveBoard(id, board) {
  data.boards[id] = { ...board, t: Date.now() }
  save()
}

export function clearBoard(id) {
  data.boards[id] = { t: Date.now() }
  save()
}

export function installHintDismissed() {
  return data.hintDismissed
}

export function dismissInstallHint() {
  data.hintDismissed = true
  save()
}

// Cat badges: how many times each breed has ridden a finished track.
export function catCounts() {
  return { ...data.cats }
}

export function recordCat(id) {
  data.cats[id] = (data.cats[id] || 0) + 1
  save()
}

// ---- Cloud sync support ----
export const syncState = data.sync

export function setSyncCode(code) {
  data.sync.code = code
  data.sync.dirty = true
  write()
}

// The progress itself, without the sync bookkeeping, as sent to the server.
export function exportProgress() {
  const { solved, boards, cats, hintDismissed } = data
  return JSON.parse(JSON.stringify({ solved, boards, cats, hintDismissed }))
}

// Take progress back from the server, merged with what's here now so moves made
// while the request was in flight are kept.
export function importProgress(remote, stillDirty) {
  const merged = merge(exportProgress(), remote)
  data.solved = merged.solved
  data.boards = merged.boards
  data.cats = merged.cats
  data.hintDismissed = merged.hintDismissed
  data.sync.dirty = stillDirty
  data.sync.last = Date.now()
  write()
}
