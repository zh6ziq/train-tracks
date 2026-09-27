// Backtracking solver: fills the grid cell by cell (left→right, top→bottom)
// and returns up to `limit` solutions. Used to make sure every level has exactly one.
import { N, E, S, W, aIndex, bIndex } from '../src/game/rules.js'

// Empty cell plus the six track pieces (every pair of sides).
const PIECES = [0, N | E, N | S, N | W, E | S, E | W, S | W]

export function solve(level, { limit = 2, maxNodes = 3_000_000 } = {}) {
  const { n, rows, cols } = level
  const size = n * n
  const given = new Array(size).fill(-1)
  for (const [i, m] of level.givens) given[i] = m

  const aIdx = aIndex(level)
  const bIdx = bIndex(level)
  const total = rows.reduce((a, b) => a + b, 0)

  const masks = new Array(size).fill(0)
  const rowCnt = new Array(n).fill(0)
  const colCnt = new Array(n).fill(0)

  // Union-find (with undo) tracks which track cells are already joined,
  // so we can reject closed loops as soon as they appear.
  const parent = Array.from({ length: size }, (_, i) => i)
  const compSize = new Array(size).fill(1)
  const history = []
  const find = (x) => {
    while (parent[x] !== x) x = parent[x]
    return x
  }
  const union = (x, y) => {
    x = find(x)
    y = find(y)
    if (x === y) return
    if (compSize[x] < compSize[y]) [x, y] = [y, x]
    parent[y] = x
    compSize[x] += compSize[y]
    history.push(y)
  }
  const rollback = (to) => {
    while (history.length > to) {
      const y = history.pop()
      compSize[parent[y]] -= compSize[y]
      parent[y] = y
    }
  }

  const solutions = []
  let nodes = 0
  let aborted = false

  function place(i, placed) {
    if (solutions.length >= limit || aborted) return
    if (++nodes > maxNodes) {
      aborted = true
      return
    }
    if (i === size) {
      // Every track cell must belong to the single A→B path.
      let root = -1
      for (let j = 0; j < size; j++) {
        if (!masks[j]) continue
        const f = find(j)
        if (root < 0) root = f
        else if (f !== root) return
      }
      solutions.push(masks.slice())
      return
    }

    const r = Math.floor(i / n)
    const c = i % n
    const needN = r > 0 && (masks[i - n] & S) ? N : 0
    const needW = (c > 0 && masks[i - 1] & E) || i === aIdx ? W : 0

    for (const m of PIECES) {
      if ((m & N) !== needN || (m & W) !== needW) continue
      if (c === n - 1 && m & E) continue
      if (r === n - 1 && m & S && i !== bIdx) continue
      if (i === bIdx && !(m & S)) continue
      if (given[i] >= 0 && m !== given[i]) continue

      const t = m ? 1 : 0
      const rc = rowCnt[r] + t
      const cc = colCnt[c] + t
      if (rc > rows[r] || rc + (n - 1 - c) < rows[r]) continue
      if (cc > cols[c] || cc + (n - 1 - r) < cols[c]) continue
      if (needN && needW && c > 0 && find(i - n) === find(i - 1)) continue // would close a loop

      const mark = history.length
      masks[i] = m
      rowCnt[r] = rc
      colCnt[c] = cc
      if (needN) union(i, i - n)
      if (needW && i !== aIdx) union(i, i - 1)

      // Once A and B are joined the path is finished; no more track may follow.
      const done = i >= bIdx && find(aIdx) === find(bIdx)
      if (!done || placed + t === total) place(i + 1, placed + t)

      rollback(mark)
      masks[i] = 0
      rowCnt[r] -= t
      colCnt[c] -= t
    }
  }

  place(0, 0)
  return { solutions, aborted }
}
