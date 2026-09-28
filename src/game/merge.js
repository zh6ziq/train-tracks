// Combine two copies of saved progress without losing anything from either.
// Used by the browser and by the /api/progress function, so both sides agree.
export function merge(a = {}, b = {}) {
  const solved = { ...a.solved, ...b.solved }

  const cats = { ...a.cats }
  // Max, not sum: the same rides may already be counted on both sides.
  for (const [id, n] of Object.entries(b.cats || {})) cats[id] = Math.max(cats[id] || 0, n)

  const boards = {}
  for (const [id, board] of [...Object.entries(a.boards || {}), ...Object.entries(b.boards || {})]) {
    if (solved[id]) continue
    // Boards saved before sync existed have no timestamp and lose to any newer one.
    if (!boards[id] || (board.t || 0) >= (boards[id].t || 0)) boards[id] = board
  }

  return { solved, boards, cats, hintDismissed: !!(a.hintDismissed || b.hintDismissed) }
}
