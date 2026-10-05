# Soft Matter Lab · waves & cloth

Continuum intro for shop class or intro physics. The page header names it:

**Silk is a soft solid. The basin is a liquid surface. Both are continua — neighbors pull on neighbors. A shape can travel while the material mostly stays.**

## Open

From the repo root:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080/soft-matter-lab.html`

Pages, after merge: https://virgilrenfroe.github.io/noctuary-corridor/soft-matter-lab.html

Query params:

- `?embed=1` — chrome-less stage, transparent clear, for a hung panel
- `?still=1` — one settled shape, no wind, no animation loop (also what `prefers-reduced-motion: reduce` does)

## What the student should notice

1. **The crest travels. The buoy does not.** Five gold buoys sit in a row. Wind from the lamp on the left sends crests across the basin. A buoy rises and falls as a crest passes, then stays in its place. The pale tracers do the same, with only a small sideways lean.
2. **A push becomes a wave because neighbors are tied.** Drag the water, or drop a stone. The dent does not stay a private dent. The surrounding surface follows, and the shape walks to the brass rim and comes back.
3. **The silk is the same idea in a soft solid.** Pull one point. The weave shares the pull. The pins on the rail do not come loose. Wind folds the hem the way it folds the water, but the cloth hangs instead of flowing away.
4. **Wind off is the control.** The basin calms. The silk hangs quieter. The continuum is still there; it is just no longer being driven.

Drag is the experiment. The line under “What to notice” changes with wind, a pull on the silk, and a push on the water.

## Files

- `soft-matter-lab.html` — one page, one `WebGLRenderer`, local three r170 via `./vendor/three/`
- `NOTES.md` — this note

No build step. GitHub Pages serves the file next to the other root exhibits.

## Craft

Corridor void `#140818`. Bricolage Grotesque, Instrument Sans, Space Mono labels.

Mobile (coarse pointer or width under 820px): pixel ratio capped at 1.5, bloom off, material anisotropy off, anisotropic texture filtering off. Wave grid 40×24 (desktop 72×42). Cloth 12×8 and 3 constraint passes (desktop 20×12 and 5). Tracers 40 (desktop 112). Desktop silk may use a little anisotropy on WebGL2.

The animation frame is cancelled while the tab is hidden, and it is not started at all for `?still=1` or reduced motion. A still page can still be pulled or dented; it just does not keep moving on its own.
