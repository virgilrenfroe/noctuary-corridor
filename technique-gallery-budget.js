/**
 * Production WebGL budget for the walkable technique gallery (grove + cubicles).
 * The page keeps one shared WebGLRenderer. This file only caps the extra
 * iframe contexts, video uploads, and the mobile quality knobs.
 *
 * Trial. Pre-change commit: a40067a3947c77d0ed9ba6f5452577c6fe4c1d5a
 * Revert that trial by checking the two exhibit HTML files and this script
 * back to that commit (or git revert the budget commit).
 */
(function (global) {
  const params = new URLSearchParams(global.location.search || '');
  const hashParams = new URLSearchParams(String(global.location.hash || '').replace(/^#/, '').replace(/,/g, '&'));
  const forceSafe = params.has('safe') || hashParams.has('safe');
  const forceDesktop = !forceSafe && (
    params.has('desktop') || params.get('hq') === '1' ||
    hashParams.get('desktop') === '1' || hashParams.get('hq') === '1'
  );
  const coarse = global.matchMedia('(pointer: coarse)').matches;
  const narrow = global.matchMedia('(max-width: 900px)').matches;
  const mobile = !forceDesktop && (coarse || narrow || forceSafe);

  // Chromium's active WebGL context budget is ~16 desktop / ~8 Android.
  // The grove already owns one. Armed iframe labs stay at 0 or 1.
  let maxArmedIframes = 1;
  const labs = params.get('labs') ?? hashParams.get('labs');
  if (labs === '0') maxArmedIframes = 0;

  const videoSlots = new Set();

  function pageHidden() {
    return typeof document !== 'undefined' && !!document.hidden;
  }

  /** True only while a decoder is actually producing frames. */
  function videoMayUpload(video) {
    if (!video) return false;
    if (video.paused || video.ended || video.seeking) return false;
    if (pageHidden()) return false;
    if (video.readyState < 2) return false;
    return true;
  }

  function claimVideo(id) {
    if (videoSlots.has(id)) return true;
    const cap = mobile ? 1 : 2;
    if (videoSlots.size >= cap) return false;
    videoSlots.add(id);
    return true;
  }

  function releaseVideo(id) {
    videoSlots.delete(id);
  }

  /**
   * Browsers without requestVideoFrameCallback upload whenever update()
   * sees readyState >= 2, including a paused element. Safari has lost the
   * WebGL context on that path. Never flag a paused video for upload.
   */
  function guardVideoTexture(texture) {
    if (!texture) return texture;
    texture.update = function guardedVideoUpdate() {
      const video = this.image;
      if (!videoMayUpload(video)) return;
      if (typeof video.requestVideoFrameCallback !== 'function') {
        this.needsUpdate = true;
      }
    };
    return texture;
  }

  /**
   * Call before `new THREE.VideoTexture(video)`. three.js registers
   * requestVideoFrameCallback immediately and sets needsUpdate from that
   * callback even if the element is paused. Skip the flag while paused,
   * hidden, or seeking, and keep the callback chain alive.
   */
  function installPausedVideoUploadGuard(video) {
    if (!video || typeof video.requestVideoFrameCallback !== 'function') return video;
    if (video.__galleryRvfcGuard) return video;
    const orig = video.requestVideoFrameCallback.bind(video);
    video.requestVideoFrameCallback = function guarded(cb) {
      return orig(function onFrame(now, meta) {
        if (video.paused || video.ended || video.seeking || pageHidden()) {
          video.requestVideoFrameCallback(cb);
          return;
        }
        cb(now, meta);
      });
    };
    video.__galleryRvfcGuard = true;
    return video;
  }

  function glOf(canvas) {
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    const names = ['webgl2', 'webgl', 'experimental-webgl'];
    for (let i = 0; i < names.length; i++) {
      try {
        const gl = canvas.getContext(names[i]);
        if (gl) return gl;
      } catch (_) {}
    }
    return null;
  }

  /** Eagerly drop an iframe lab's WebGL context before blanking the frame. */
  function loseIframeWebGL(iframe) {
    let doc = null;
    try { doc = iframe && iframe.contentDocument; } catch (_) { return 0; }
    if (!doc || typeof doc.querySelectorAll !== 'function') return 0;
    const canvases = doc.querySelectorAll('canvas');
    let n = 0;
    for (let i = 0; i < canvases.length; i++) {
      const gl = glOf(canvases[i]);
      if (!gl || typeof gl.getExtension !== 'function') continue;
      try {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext && typeof ext.loseContext === 'function') {
          ext.loseContext();
          n++;
        }
      } catch (_) {}
    }
    return n;
  }

  /**
   * Same-origin lab documents keep their own RAF. Hook it once the iframe
   * document exists so a hidden tab does not keep drawing the armed lab.
   * The hook passes through while visible.
   */
  function installEmbeddedRafPause(win) {
    if (!win || win.__galleryRafHook) return false;
    if (typeof win.requestAnimationFrame !== 'function') return false;
    win.__galleryRafHook = true;
    const nativeRAF = win.requestAnimationFrame.bind(win);
    const nativeCAF = typeof win.cancelAnimationFrame === 'function'
      ? win.cancelAnimationFrame.bind(win)
      : function () {};
    const doc = win.document;
    let held = null;
    let holdId = 0;
    win.requestAnimationFrame = function galleryRAF(fn) {
      if (doc && doc.hidden) {
        held = fn;
        holdId += 1;
        return holdId;
      }
      return nativeRAF(fn);
    };
    win.cancelAnimationFrame = function galleryCAF(id) {
      if (held && id === holdId) {
        held = null;
        return;
      }
      return nativeCAF(id);
    };
    const flush = function () {
      if (!held || (doc && doc.hidden)) return;
      const fn = held;
      held = null;
      nativeRAF(fn);
    };
    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('visibilitychange', flush);
    }
    win.__galleryFlushRaf = flush;
    return true;
  }

  global.GalleryBudget = {
    preChange: 'a40067a3947c77d0ed9ba6f5452577c6fe4c1d5a',
    mobile: mobile,
    maxArmedIframes: maxArmedIframes,
    maxPlayingVideos: mobile ? 1 : 2,
    dprCap: mobile ? 1.5 : 2,
    skipComposer: mobile || forceSafe,
    sparkCount: mobile ? 8 : 28,
    videoArmDist: mobile ? 16 : 48,
    claimVideo: claimVideo,
    releaseVideo: releaseVideo,
    videoMayUpload: videoMayUpload,
    guardVideoTexture: guardVideoTexture,
    installPausedVideoUploadGuard: installPausedVideoUploadGuard,
    loseIframeWebGL: loseIframeWebGL,
    installEmbeddedRafPause: installEmbeddedRafPause,
  };
})(window);
