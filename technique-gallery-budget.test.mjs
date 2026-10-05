/**
 * Node checks for technique-gallery-budget.js (no browser).
 * Run: node technique-gallery-budget.test.mjs
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('./technique-gallery-budget.js', import.meta.url), 'utf8');

function load({ search = '', mobile = false } = {}) {
  const sandbox = {
    URLSearchParams: globalThis.URLSearchParams,
    location: { search, hash: '' },
    matchMedia: (q) => ({ matches: mobile && (String(q).includes('coarse') || String(q).includes('900')) }),
    document: { hidden: false, addEventListener() {} },
    console,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const desk = load({ mobile: false });
assert(desk.GalleryBudget.maxArmedIframes === 1, 'desktop armed cap is 1');
assert(desk.GalleryBudget.dprCap === 2, 'desktop dpr cap stays 2');
assert(desk.GalleryBudget.skipComposer === false, 'desktop keeps composer');
assert(desk.GalleryBudget.sparkCount === 28, 'desktop spark count unchanged');
assert(desk.GalleryBudget.maxPlayingVideos === 2, 'desktop video cap is 2');
assert(desk.GalleryBudget.preChange === 'a40067a3947c77d0ed9ba6f5452577c6fe4c1d5a', 'pre-change sha recorded');

const phone = load({ mobile: true });
assert(phone.GalleryBudget.mobile === true, 'mobile detected');
assert(phone.GalleryBudget.maxArmedIframes === 1, 'mobile armed cap is 1');
assert(phone.GalleryBudget.dprCap === 1.5, 'mobile dpr cap is 1.5');
assert(phone.GalleryBudget.skipComposer === true, 'mobile skips composer');
assert(phone.GalleryBudget.sparkCount === 8, 'mobile spark count reduced');
assert(phone.GalleryBudget.maxPlayingVideos === 1, 'mobile allows one playing video');
assert(phone.GalleryBudget.videoArmDist === 16, 'mobile video arms by proximity');

const killed = load({ search: '?labs=0', mobile: true });
assert(killed.GalleryBudget.maxArmedIframes === 0, 'labs=0 kills iframe labs');

const safe = load({ search: '?safe=1' });
assert(safe.GalleryBudget.skipComposer === true, 'safe=1 skips composer');
assert(safe.GalleryBudget.dprCap === 1.5, 'safe=1 uses the mobile dpr cap');

const gb = phone.GalleryBudget;
const paused = { paused: true, ended: false, seeking: false, readyState: 2 };
assert(gb.videoMayUpload(paused) === false, 'paused video must not upload');
const ended = { paused: false, ended: true, seeking: false, readyState: 2 };
assert(gb.videoMayUpload(ended) === false, 'ended video must not upload');
const seeking = { paused: false, ended: false, seeking: true, readyState: 2 };
assert(gb.videoMayUpload(seeking) === false, 'seeking video must not upload');
const live = { paused: false, ended: false, seeking: false, readyState: 2 };
assert(gb.videoMayUpload(live) === true, 'playing video may upload');
phone.document.hidden = true;
assert(gb.videoMayUpload(live) === false, 'hidden tab must not upload');
phone.document.hidden = false;

const tex = { image: paused, needsUpdate: false };
gb.guardVideoTexture(tex);
tex.update();
assert(tex.needsUpdate === false, 'guard does not flag a paused texture');
tex.image = live;
tex.update();
assert(tex.needsUpdate === true, 'guard flags a playing texture without rvfc');

const rvfcVideo = {
  paused: true,
  ended: false,
  seeking: false,
  readyState: 2,
  requestVideoFrameCallback(cb) { this._q.push(cb); return this._q.length; },
  _q: [],
};
gb.installPausedVideoUploadGuard(rvfcVideo);
let uploaded = false;
rvfcVideo.requestVideoFrameCallback(() => { uploaded = true; });
assert(rvfcVideo._q.length === 1, 'guard registered one callback');
const first = rvfcVideo._q.shift();
first(0, {});
assert(uploaded === false, 'paused rvfc must not mark an upload');
assert(rvfcVideo._q.length === 1, 'paused rvfc keeps the chain');
rvfcVideo.paused = false;
const second = rvfcVideo._q.shift();
second(1, {});
assert(uploaded === true, 'playing rvfc still delivers the frame');

assert(gb.claimVideo('stargazer') === true, 'first video claims the only mobile slot');
assert(gb.claimVideo('other') === false, 'second video is refused on mobile');
gb.releaseVideo('stargazer');
assert(gb.claimVideo('other') === true, 'released slot can be claimed');

let lost = 0;
const iframe = {
  contentDocument: {
    querySelectorAll() {
      return [{
        getContext() {
          return { getExtension() { return { loseContext() { lost += 1; } }; } };
        },
      }];
    },
  },
};
assert(gb.loseIframeWebGL(iframe) === 1, 'loseIframeWebGL drops the lab context');
assert(lost === 1, 'WEBGL_lose_context.loseContext was called');

const calls = [];
const childDoc = {
  hidden: true,
  addEventListener(_type, fn) { this._vis = fn; },
};
const child = {
  document: childDoc,
  requestAnimationFrame(fn) { calls.push(fn); return calls.length; },
  cancelAnimationFrame() {},
};
assert(gb.installEmbeddedRafPause(child) === true, 'raf pause hook installs');
let ran = false;
const id = child.requestAnimationFrame(() => { ran = true; });
assert(ran === false && calls.length === 0, 'hidden iframe does not schedule a frame');
assert(typeof id === 'number', 'hidden raf returns an id');
child.cancelAnimationFrame(id);
childDoc.hidden = false;
child.requestAnimationFrame(() => { ran = true; });
assert(calls.length === 1, 'visible iframe uses the native raf');
calls[0]();
assert(ran === true, 'native callback runs');

console.log('technique-gallery-budget.test.mjs: ok');
