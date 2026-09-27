// Saved progress lives in localStorage. Every access is wrapped in try/catch
// because private browsing or cleared site data can make storage unavailable.
const KEY = 'train-tracks-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const data = Object.assign({ solved: {}, boards: {}, cats: {}, hintDismissed: false }, load())

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage full or blocked: the game still works, progress just isn't kept.
  }
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

// In-progress board for a level: { m: masks as hex string, x: X marks as "0101..." }
export function loadBoard(id) {
  return data.boards[id] || null
}

export function saveBoard(id, board) {
  data.boards[id] = board
  save()
}

export function clearBoard(id) {
  delete data.boards[id]
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
