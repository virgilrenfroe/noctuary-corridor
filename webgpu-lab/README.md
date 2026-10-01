# WebGPU Lab · Practice 01–03

Bare-metal WebGPU + WGSL drills. No three.js.

Open [`INDEX.html`](./INDEX.html) for the hub.

## Pages URL

https://virgilrenfroe.github.io/noctuary-corridor/webgpu-lab/

## Local

```bash
cd webgpu-lab && python3 -m http.server 8766
# http://127.0.0.1:8766/INDEX.html
```

Needs a browser with `navigator.gpu` (Chrome / Edge desktop recommended).

## Drills

| # | File | Focus |
|---|------|--------|
| 01 | `01-clear-triangle.html` | Adapter, clear, triangle from `vertex_index` |
| 02 | `02-rotating-cube.html` | Depth buffer, indexed mesh, uniform MVP |
| 03 | `03-compute-particles.html` | Compute + storage buffer + point render |
