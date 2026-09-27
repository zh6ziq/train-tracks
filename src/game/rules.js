// Shared puzzle rules. Used by the game (browser) and the level generator (Node).
//
// Each cell stores a 4-bit "mask" of which sides the track leaves through:
//   N = 1 (up), E = 2 (right), S = 4 (down), W = 8 (left)
// A track piece always has exactly 2 bits set (straight or curve); 0 = empty.
//
// A level looks like:
//   { id, n, rows: [..], cols: [..], a, b, givens: [[cellIndex, mask], ...], sol: "hexstring" }
// The train enters at A (left edge, row `a`) and leaves at B (bottom edge, column `b`).

export const N = 1
export const E = 2
export const S = 4
export const W = 8

export const DIRS = [
  { bit: N, dr: -1, dc: 0, opp: S },
  { bit: E, dr: 0, dc: 1, opp: W },
  { bit: S, dr: 1, dc: 0, opp: N },
  { bit: W, dr: 0, dc: -1, opp: E },
]

export const DIR_BY_BIT = { [N]: DIRS[0], [E]: DIRS[1], [S]: DIRS[2], [W]: DIRS[3] }

export function bitCount(m) {
  return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1)
}

// Index of A's cell and B's cell in the flat grid array.
export function aIndex(level) {
  return level.a * level.n
}
export function bIndex(level) {
  return (level.n - 1) * level.n + level.b
}

// Bits that can never be removed: A's entry, B's exit, and given pieces.
// A given piece also locks the matching half in each neighbour, so the
// player's track can join up with it.
export function fixedMasks(level) {
  const { n } = level
  const fixed = new Array(n * n).fill(0)
  fixed[aIndex(level)] |= W
  fixed[bIndex(level)] |= S
  for (const [i, m] of level.givens) {
    fixed[i] |= m
    for (const d of DIRS) {
      if (!(m & d.bit)) continue
      const r = Math.floor(i / n) + d.dr
      const c = (i % n) + d.dc
      if (r >= 0 && r < n && c >= 0 && c < n) fixed[r * n + c] |= d.opp
    }
  }
  return fixed
}

export function givenCells(level) {
  return new Set(level.givens.map(([i]) => i))
}

// How many track cells are in each row and column.
export function lineCounts(n, masks) {
  const rows = new Array(n).fill(0)
  const cols = new Array(n).fill(0)
  for (let i = 0; i < n * n; i++) {
    if (masks[i]) {
      rows[Math.floor(i / n)]++
      cols[i % n]++
    }
  }
  return { rows, cols }
}

// True when the masks form one unbroken track from A to B that matches every count.
export function isSolved(level, masks) {
  const { n } = level
  const counts = lineCounts(n, masks)
  for (let k = 0; k < n; k++) {
    if (counts.rows[k] !== level.rows[k] || counts.cols[k] !== level.cols[k]) return false
  }
  const total = masks.reduce((sum, m) => sum + (m ? 1 : 0), 0)

  // Ride the train from A and make sure it reaches B after visiting every track cell.
  let r = level.a
  let c = 0
  let from = W
  let visited = 0
  while (visited <= total) {
    const m = masks[r * n + c]
    if (bitCount(m) !== 2 || !(m & from)) return false
    visited++
    const out = m & ~from
    if (out === S && r === n - 1 && c === level.b) return visited === total
    const d = DIR_BY_BIT[out]
    r += d.dr
    c += d.dc
    if (r < 0 || r >= n || c < 0 || c >= n) return false
    from = d.opp
  }
  return false
}

// The cells of a finished track in riding order, from A to B: [{ i, from, out }, ...].
export function trackRoute(level, masks) {
  const { n } = level
  const route = []
  let r = level.a
  let c = 0
  let from = W
  while (route.length < n * n) {
    const i = r * n + c
    const m = masks[i]
    if (bitCount(m) !== 2 || !(m & from)) break
    const out = m & ~from
    route.push({ i, from, out })
    if (out === S && r === n - 1 && c === level.b) break
    const d = DIR_BY_BIT[out]
    r += d.dr
    c += d.dc
    if (r < 0 || r >= n || c < 0 || c >= n) break
    from = d.opp
  }
  return route
}

export function decodeSolution(level) {
  return Array.from(level.sol, (ch) => parseInt(ch, 16))
}

export function encodeMasks(masks) {
  return masks.map((m) => m.toString(16)).join('')
}
