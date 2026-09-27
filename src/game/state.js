// Game state for one level: the player's track, X marks, undo history, hints.
import { reactive, computed } from 'vue'
import { DIRS, DIR_BY_BIT, bitCount, fixedMasks, lineCounts, isSolved, decodeSolution, encodeMasks } from './rules.js'
import { loadBoard, saveBoard, clearBoard, markSolved, isLevelSolved } from './storage.js'

export function createGame(level) {
  const { n } = level
  const fixed = fixedMasks(level)
  const solution = decodeSolution(level)

  const state = reactive({
    masks: fixed.slice(),
    xs: new Array(n * n).fill(false),
    history: [],
    hintsUsed: 0,
    solved: isLevelSolved(level.id),
  })

  if (state.solved) {
    state.masks = solution.slice()
  } else {
    const saved = loadBoard(level.id)
    if (saved && saved.m.length === n * n) {
      state.masks = Array.from(saved.m, (ch) => parseInt(ch, 16))
      state.xs = Array.from(saved.x, (ch) => ch === '1')
    }
  }

  const counts = computed(() => lineCounts(n, state.masks))

  const neighbour = (i, bit) => {
    const d = DIR_BY_BIT[bit]
    const r = Math.floor(i / n) + d.dr
    const c = (i % n) + d.dc
    return r < 0 || r >= n || c < 0 || c >= n ? -1 : r * n + c
  }

  function snapshot() {
    state.history.push({ masks: state.masks.slice(), xs: state.xs.slice() })
    if (state.history.length > 200) state.history.shift()
  }

  function persist() {
    if (state.solved) return
    if (isSolved(level, state.masks)) {
      state.solved = true
      markSolved(level.id)
      return
    }
    saveBoard(level.id, { m: encodeMasks(state.masks), x: state.xs.map((v) => (v ? '1' : '0')).join('') })
  }

  function hasEdge(i, bit) {
    return (state.masks[i] & bit) !== 0
  }

  // Add or remove the piece of track joining cell i to its neighbour in direction `bit`.
  // Returns false when the move isn't allowed (locked piece, or a cell would get 3 exits).
  function setEdge(i, bit, on) {
    const j = neighbour(i, bit)
    if (j < 0) return false
    const opp = DIR_BY_BIT[bit].opp
    if (on) {
      if (hasEdge(i, bit)) return true
      if (bitCount(state.masks[i]) >= 2 || bitCount(state.masks[j]) >= 2) return false
      state.masks[i] |= bit
      state.masks[j] |= opp
      state.xs[i] = false
      state.xs[j] = false
    } else {
      if (!hasEdge(i, bit)) return true
      if (fixed[i] & bit || fixed[j] & opp) return false
      state.masks[i] &= ~bit
      state.masks[j] &= ~opp
    }
    return true
  }

  // Tap on a cell: empty -> X -> empty. Tapping your own track removes it.
  function tap(i) {
    if (state.solved) return
    const loose = state.masks[i] & ~fixed[i]
    if (loose) {
      snapshot()
      for (const d of DIRS) if (loose & d.bit) setEdge(i, d.bit, false)
    } else if (!state.masks[i]) {
      snapshot()
      state.xs[i] = !state.xs[i]
    } else {
      return
    }
    persist()
  }

  // Drags are applied one edge at a time; `beginStroke` gives the whole drag one undo step.
  function beginStroke() {
    snapshot()
  }

  function strokeEdge(i, bit, on) {
    if (state.solved) return false
    const changed = setEdge(i, bit, on)
    return changed
  }

  function endStroke(changed) {
    if (!changed) state.history.pop()
    else persist()
  }

  function undo() {
    const prev = state.history.pop()
    if (!prev || state.solved) return
    state.masks = prev.masks
    state.xs = prev.xs
    persist()
  }

  function reset() {
    if (state.solved) return
    snapshot()
    state.masks = fixed.slice()
    state.xs = new Array(n * n).fill(false)
    clearBoard(level.id)
  }

  // Hint: first remove one wrong piece; if everything placed is right, add one missing piece.
  function hint() {
    if (state.solved) return null
    for (let i = 0; i < n * n; i++) {
      for (const d of DIRS) {
        if (hasEdge(i, d.bit) && !(solution[i] & d.bit) && neighbour(i, d.bit) >= 0) {
          snapshot()
          setEdge(i, d.bit, false)
          state.hintsUsed++
          persist()
          return { cell: i, kind: 'removed' }
        }
      }
    }
    for (let i = 0; i < n * n; i++) {
      if (state.xs[i] && solution[i]) {
        snapshot()
        state.xs[i] = false
        state.hintsUsed++
        persist()
        return { cell: i, kind: 'unmarked' }
      }
      for (const d of DIRS) {
        if (solution[i] & d.bit && !hasEdge(i, d.bit) && neighbour(i, d.bit) >= 0) {
          snapshot()
          setEdge(i, d.bit, true)
          state.hintsUsed++
          persist()
          return { cell: i, kind: 'added' }
        }
      }
    }
    return null
  }

  return { level, fixed, state, counts, neighbour, hasEdge, tap, beginStroke, strokeEdge, endStroke, undo, reset, hint }
}
