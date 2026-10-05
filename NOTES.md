# Periodic table · atoms

Interactive H–Og table. The chemistry ladder is unchanged and always comes first. After the nucleus, any element can open one nucleon’s quarks, then a separate Standard Model atlas room.

## Open

```bash
cd /workspace
python3 -m http.server 8080
```

Visit `http://localhost:8080/periodic-table-atoms.html`

Query params:

- `?el=C` / `?z=6` — open that element on the Atom stage
- `?embed=1` — chrome-less stage (defaults to C if no el/z)
- `?still=1` — static pose (also respects `prefers-reduced-motion`)

## Files

- `periodic-table-atoms.html` — table, WebGL ladder, quark stage, atlas room
- `periodic-table-data.js` — Z 1–118 (symbol, name, category, atomicMass, neutrons, period, group)

Local three r170 via `./vendor/three/` import map.

## Chemistry (Virgil)

| Quantity | Rule |
|----------|------|
| Protons | Z |
| Electrons | Z (neutral) |
| Neutrons | `Math.round(atomicMass) − Z` |

Masses: IUPAC CIAAW conventional atomic weights where available; radioactive/synthetic elements use a commonly listed standard weight or the most-stable isotope mass number.

Spot checks: H 1/0/1 · He 2/2/2 · C 6/6/6 · O 8/8/8 · Ne 10/10/10 · Ar 18/22/18 · Fe 26/30/26 · Au 79/118/79 · U 92/146/92.

Electron rings: Aufbau subshell fill, grouped by principal **n**. Totals always equal Z. Outer shells compress visually for Z > 36. Carbon is K 2 + L 4. Hydrogen is one electron on K.

**Electron finish B2 (Atom and Shells):** bright discrete heads on faint Bohr rings. One head per electron, count = Z. No comet dust, trails, or decorative points in the empty space between the heads and the nucleus. Nucleons stay satin. The Orbitals stage is unchanged (schematic shapes, satin dots).

Orbital stage uses that same order, ungrouped: H `1s1` · C `1s2 2s2 2p2` · Fe `1s2 2s2 2p6 3s2 3p6 4s2 3d6` · Og through `7p6`. A few real atoms (Cr, Cu, and some heavier cases) differ from this Madelung order; the page keeps one fill so shell totals and orbital totals match.

## Ladder

```
Atom → Shells → Orbitals → Nucleus → Quark ┆ door ┆ Atlas room
```

1. Tap an element. The panel opens on **Atom** (p / n / e in the HUD).
2. **Shells** — Aufbau rings grouped by principal n; optional focus chips All/Both · K/L/M…. Nucleons dim. Tap the nucleus jumps to Nucleus.
3. **Orbitals** — the same Madelung fill, split into subshells (1s, 2s, 2p, 3s, 3p, 4s, 3d, …). Electron counts sum to Z. Shapes are schematic, not hydrogenic ψ²: a sphere for s, three dumbbells (px, py, pz) for p, clover lobes plus a torus for d, and a many-lobe cluster for f when that subshell is occupied. Satin dots are the electrons (Hund seating inside each subshell). Focus chips: All, occupied ℓ families, and each occupied subshell (`2p · 2`). Dots are never invented.
4. **Nucleus** — proton and neutron spheres only. No quarks, gluons, bosons, or mesons in the pack.
5. **Quark** — from Nucleus, tap a nucleon or press Next. A proton shows **uud** (+2/3, +2/3, −1/3 = +1). A neutron shows **udd** (+2/3, −1/3, −1/3 = 0). Both are labeled baryons. Hydrogen has no neutron, so the only nucleon is the proton.
6. **Atlas door** — Next on Quark is “Open door”. The handoff card reads “Leaving the atom · Standard Model atlas”. Enter atlas, or Esc to stay on the quark. This is a separate room, not a deeper nucleus.
7. **Atlas room** — hard cut (atom hidden, blue dashed frame). Browse fermions (6 quarks, 6 leptons), gauge bosons (γ, g, W±, Z⁰), Higgs (H⁰), and mesons (π⁺ = u d̄, π⁻ = d ū, π⁰ = (uū − dd̄)/√2, K⁺ = u s̄). A dashed contrast group shows p = uud and n = udd as baryons, not mesons and not elementary.

Quark and Atlas chips stay locked until Nucleus and Quark respectively, so the chemistry steps are not skipped. The Atlas chip and Next on Quark always open the handoff card first.

Esc or Back steps **atlas → quark → nucleus → orbitals → shells → atom** (Esc closes the handoff card first). The Atom chip returns straight to the Atom stage. On a phone, ← back uses the same steps, then ← table closes the panel.

Quark stays locked on Atom, Shells, and Orbitals. The Atlas chip opens only from Quark, and only through the handoff card.

Keys: ← → step, Enter confirms the door, 0 jumps to Atom.

## Atlas bookkeeping

| Rule | Value |
|------|--------|
| Proton | uud · charge +1 · baryon B = 1 · spin ½ |
| Neutron | udd · charge 0 · baryon · spin ½ |
| Quark charges | u +2/3 · d −1/3 (stored as thirds) |
| Mesons | q q̄, spin 0. Not nucleons. |
| Elementary list | 17 entries: 6 quarks, 6 leptons, γ, g, W±, Z⁰, H⁰ |

Particle-symbol chips (γ, μ, ν, π, uud, …) do **not** use CSS `text-transform: uppercase`.

## Craft

Corridor void `#140818`, Bricolage Grotesque / Instrument Sans / Space Mono, warm accent. Satin nucleons (and orbital dots): metalness 0.32, roughness 0.45, clearcoat 0.22 / 0.38. Anisotropy 0.55 on desktop WebGL2 and **off on mobile**. Atom/Shells electrons are B2 heads (no clearcoat): bright teal beads, ring opacity about 0.16 on Atom and 0.28 on Shells. Hemisphere + warm point light. Subtle UnrealBloom on desktop only.

DPR ≤ 1.5. `setSize(w, h, true)` on mobile. The atom panel and stage use `minmax(0, 1fr)` so the canvas cannot collapse to 0×0. Touch-friendly cells. Mobile atom panel is full screen.

Colours: p `#ff6b3d` · n `#6c84a8` · e `#5fd6c6` · u `#ffd166` · d `#a78bfa`.
