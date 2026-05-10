// ============================================================
// YouTube Rotate Pro — content.js
// Injected on every youtube.com page
// ============================================================
(function () {
  'use strict';

  // ── STATE ──────────────────────────────────────────────────
  let rotation  = 0;
  let flipH     = false;
  let flipV     = false;
  let panel     = null;
  let dragging  = false;
  let dragOX    = 0;
  let dragOY    = 0;

  // ── BOOT ───────────────────────────────────────────────────
  function boot() {
    // Wait for YouTube player to appear
    const timer = setInterval(() => {
      if (document.querySelector('.html5-video-player')) {
        clearInterval(timer);
        restoreState();
        buildPanel();
        listenNavigation();
      }
    }, 800);
  }

  // ── RESTORE SAVED STATE ────────────────────────────────────
  function restoreState() {
    chrome.storage.local.get(['rotation', 'flipH', 'flipV'], (r) => {
      rotation = r.rotation || 0;
      flipH    = r.flipH    || false;
      flipV    = r.flipV    || false;
      applyTransform();
    });
  }

  // ── BUILD OVERLAY PANEL ────────────────────────────────────
  function buildPanel() {
    // Don't duplicate
    if (document.getElementById('yrp-panel')) return;

    panel = document.createElement('div');
    panel.id = 'yrp-panel';

    panel.innerHTML = `
      <div id="yrp-drag-handle">
        <div id="yrp-brand">
          <span id="yrp-icon">↻</span>
          <span id="yrp-name">ROTATE PRO</span>
        </div>
        <div id="yrp-divider"></div>
        <div id="yrp-buttons">
          <button class="yrp-btn" id="yrp-cw"    title="Rotate 90° Clockwise">⟳</button>
          <button class="yrp-btn" id="yrp-ccw"   title="Rotate 90° Counter-Clockwise">⟲</button>
          <button class="yrp-btn" id="yrp-fh"    title="Flip Horizontal">⇔</button>
          <button class="yrp-btn" id="yrp-fv"    title="Flip Vertical">⇕</button>
          <button class="yrp-btn" id="yrp-reset" title="Reset All">✕</button>
          <button class="yrp-btn" id="yrp-hide"  title="Hide Panel">−</button>
        </div>
      </div>
      <div id="yrp-badge" style="display:none;">0°</div>
    `;

    document.body.appendChild(panel);

    // ── Restore saved position ──
    chrome.storage.local.get(['panelX', 'panelY', 'panelHidden'], (r) => {
      if (r.panelX !== undefined && r.panelY !== undefined) {
        panel.style.top   = r.panelY + 'px';
        panel.style.left  = r.panelX + 'px';
        panel.style.right = 'auto';
      }
      if (r.panelHidden) panel.style.display = 'none';
    });

    attachEvents();
  }

  // ── ATTACH ALL EVENTS ──────────────────────────────────────
  function attachEvents() {

    // CW rotate
    document.getElementById('yrp-cw').addEventListener('click', (e) => {
      e.stopPropagation();
      rotation = (rotation + 90) % 360;
      applyTransform(); save();
    });

    // CCW rotate
    document.getElementById('yrp-ccw').addEventListener('click', (e) => {
      e.stopPropagation();
      rotation = (rotation - 90 + 360) % 360;
      applyTransform(); save();
    });

    // Flip horizontal
    document.getElementById('yrp-fh').addEventListener('click', (e) => {
      e.stopPropagation();
      flipH = !flipH;
      document.getElementById('yrp-fh').classList.toggle('yrp-active', flipH);
      applyTransform(); save();
    });

    // Flip vertical
    document.getElementById('yrp-fv').addEventListener('click', (e) => {
      e.stopPropagation();
      flipV = !flipV;
      document.getElementById('yrp-fv').classList.toggle('yrp-active', flipV);
      applyTransform(); save();
    });

    // RESET — clears rotation + flips
    document.getElementById('yrp-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      rotation = 0;
      flipH    = false;
      flipV    = false;
      document.getElementById('yrp-fh').classList.remove('yrp-active');
      document.getElementById('yrp-fv').classList.remove('yrp-active');
      applyTransform(); save();
    });

    // HIDE — hides the panel (X button)
    document.getElementById('yrp-hide').addEventListener('click', (e) => {
      e.stopPropagation();
      panel.style.display = 'none';
      chrome.storage.local.set({ panelHidden: true });
    });

    // ── DRAG ────────────────────────────────────────────────
    const handle = document.getElementById('yrp-drag-handle');

    handle.addEventListener('mousedown', (e) => {
      // Don't drag when clicking a button
      if (e.target.closest('.yrp-btn')) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      dragOX = e.clientX - rect.left;
      dragOY = e.clientY - rect.top;
      panel.style.transition = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const x = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  e.clientX - dragOX));
      const y = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, e.clientY - dragOY));
      panel.style.left  = x + 'px';
      panel.style.top   = y + 'px';
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      chrome.storage.local.set({
        panelX: parseInt(panel.style.left),
        panelY: parseInt(panel.style.top)
      });
    });
  }

  // ── APPLY CSS TRANSFORM TO VIDEO ───────────────────────────
  function applyTransform() {
    const video = getVideo();
    if (!video) return;

    const sx = flipH ? -1 : 1;
    const sy = flipV ? -1 : 1;
    video.style.transform       = `rotate(${rotation}deg) scaleX(${sx}) scaleY(${sy})`;
    video.style.transformOrigin = 'center center';
    video.style.transition      = 'transform 0.25s ease';

    // Update badge
    const badge = document.getElementById('yrp-badge');
    if (badge) {
      badge.textContent = rotation + '°';
      badge.style.display = (rotation !== 0 || flipH || flipV) ? 'block' : 'none';
    }
  }

  function getVideo() {
    return document.querySelector('video');
  }

  // ── SAVE STATE ─────────────────────────────────────────────
  function save() {
    chrome.storage.local.set({ rotation, flipH, flipV });
  }

  // ── KEYBOARD SHORTCUTS ─────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Only when NOT typing in an input
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.altKey && !e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      rotation = (rotation + 90) % 360;
      applyTransform(); save();
    }
    if (e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      flipH = !flipH;
      applyTransform(); save();
    }
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      rotation = 0; flipH = false; flipV = false;
      applyTransform(); save();
    }
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      rotation = (rotation + 1) % 360;
      applyTransform(); save();
    }
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      rotation = (rotation - 1 + 360) % 360;
      applyTransform(); save();
    }
  });

  // ── LISTEN FOR MESSAGES FROM POPUP ─────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'SET_ROTATION') {
      rotation = msg.angle;
      applyTransform(); save();
      sendResponse({ ok: true });
    }
    if (msg.type === 'RESET') {
      rotation = 0; flipH = false; flipV = false;
      applyTransform(); save();
      sendResponse({ ok: true });
    }
    if (msg.type === 'SHOW_PANEL') {
      if (panel) {
        panel.style.display = 'flex';
        chrome.storage.local.set({ panelHidden: false });
      }
      sendResponse({ ok: true });
    }
    if (msg.type === 'GET_STATE') {
      sendResponse({ rotation, flipH, flipV });
    }
    return true; // keep channel open for async
  });

  // ── HANDLE YOUTUBE SPA NAVIGATION ──────────────────────────
  function listenNavigation() {
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        // Re-apply transform after page change
        setTimeout(() => {
          applyTransform();
          // Rebuild panel if it was removed
          if (!document.getElementById('yrp-panel')) buildPanel();
        }, 1500);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── START ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();