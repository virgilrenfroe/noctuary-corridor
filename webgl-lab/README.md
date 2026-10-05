# WebGL Lab · Effects 01–18

Standalone three.js `r170` drills for Virgil’s Noctuary taste-test. **Not** wired into corridor / physics-room panels.

Open [`INDEX.html`](./INDEX.html) for the hub.

## Pages URL

https://virgilrenfroe.github.io/noctuary-corridor/webgl-lab/

## Local

```bash
cd webgl-lab && python3 -m http.server 8765
# http://127.0.0.1:8765/INDEX.html
```

CDN import maps need http(s); `file://` will fail module loads.

## WebGPU caveats

None of these demos require WebGPU. Effect **02 caustics** is a WebGL projected/animated caustic fallback (true spectral/compute caustics would need WebGPU).
