# Train Tracks

A Train Tracks logic puzzle that runs in the browser and installs like an app (PWA). Built with Vue 3 and Vite in plain JavaScript.

## Commands

```bash
npm install          # once
npm run dev          # play locally at http://localhost:5173
npm run levels       # rebuild the 300 puzzles (src/data/levels.json)
npm run levels -- 30 # or a smaller set while testing
npm run icons        # regenerate icons from public/icon.svg
npm run build        # production files in dist/
npm run preview      # test the built app (service worker / offline)
```

## Where things are

- `src/game/rules.js`: puzzle rules and the win check, shared by the game and the generator
- `src/game/state.js`: player moves, undo, hints, saving
- `src/components/GameBoard.vue`: SVG board plus drag and tap input
- `scripts/generate.js` / `scripts/solver.js`: build puzzles and prove each has exactly one answer

## Testing on your phone

With your phone on the same Wi-Fi, run `npm run dev -- --host`, then open the "Network" URL it prints. This only lets you play in the browser; it can't be installed this way.
