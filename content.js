// YouTube Rotate Pro - Content Script v2.0
(function () {
  'use strict';

  let currentRotation = 0;
  let isFlippedH = false;
  let isFlippedV = false;
  let panelVisible = true;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let overlayPanel = null;

  // ── INIT ────────────────────────────────────────────────────────
  function init() {
    const old = document.getElementById('yt-rotate-pro-overlay');
    const oldShow = document.getElementById('yrp-show-btn');
    if (old) old.remove();
    if (oldShow) oldShow.remove();
    overlayPanel = null;

    const check = setInterval(() => {
      const player = document.querySelector('.html5-video-player, #movie_player, video');
      if (player) {
        clearInterval(check);
        injectStyles();
        createOverlay();
        loadSavedState();
      }
    }, 800);
  }

  // ── INJECT STYLES ───────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('yrp-styles')) return;
    const style = document.createElement('style');
    style.id = 'yrp-styles';
    style.textContent = `
      #yt-rotate-pro-overlay {
        position: fixed !important;
        top: 72px;
        right: 20px;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        user-select: none;
        pointer-events: all !important;
      }
      #yrp-bar {
        display: flex !important;
        align-items: center;
        gap: 6px;
        background: rgba(10, 10, 10, 0.94) !important;
        backdrop-filter: blur(24px) !important;
        -webkit-backdrop-filter: blur(24px) !important;
        border: 1px solid rgba(255,255,255,0.14) !important;
        border-radius: 10px !important;
        padding: 7px 10px !important;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7) !important;
        cursor: grab;
        min-width: 270px;
      }
      #yrp-logo {
        display: flex;
        align-items: center;
        gap: 7px;
        padding-right: 10px;
        border-right: 1px solid rgba(255,255,255,0.1);
        flex-shrink: 0;
      }
      #yrp-logo-icon {
        width: 24px;
        height: 24px;
        background: rgba(255,0,0,0.15);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FF0000;
        font-size: 14px;
        font-weight: 900;
      }
      #yrp-label {
        color: #FF0000 !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        letter-spacing: 0.1em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }
      #yrp-controls {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: 1;
        justify-content: center;
      }
      .yrp-btn {
        width: 30px !important;
        height: 30px !important;
        border-radius: 7px !important;
        background: transparent !important;
        border: none !important;
        color: #999 !important;
        font-size: 16px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background 0.15s, color 0.15s, transform 0.1s !important;
        line-height: 1 !important;
        flex-shrink: 0;
        padding: 0 !important;
      }
      .yrp-btn:hover {
        background: rgba(255,255,255,0.1) !important;
        color: #ffffff !important;
      }
      .yrp-btn:active { transform: scale(0.82) !important; }
      .yrp-btn.yrp-active {
        background: rgba(255,0,0,0.18) !important;
        color: #FF0000 !important;
        border: 1px solid rgba(255,0,0,0.35) !important;
      }
      #yrp-btn-reset:hover {
        background: rgba(255,0,0,0.12) !important;
        color: #FF5555 !important;
      }
      #yrp-btn-close {
        color: #666 !important;
        margin-left: 4px !important;
        font-size: 18px !important;
      }
      #yrp-btn-close:hover {
        background: rgba(255,60,60,0.15) !important;
        color: #FF4444 !important;
      }
      #yrp-angle-badge {
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(255,0,0,0.12) !important;
        border: 1px solid rgba(255,0,0,0.32) !important;
        border-radius: 6px !important;
        padding: 3px 10px !important;
        font-size: 11px !important;
        font-weight: 800 !important;
        color: #FF0000 !important;
        letter-spacing: 0.05em !important;
      }
      #yrp-show-btn {
        position: fixed !important;
        top: 72px;
        right: 20px;
        z-index: 2147483647 !important;
        background: rgba(10,10,10,0.92) !important;
        border: 1px solid rgba(255,0,0,0.45) !important;
        border-radius: 8px !important;
        padding: 7px 13px !important;
        color: #FF0000 !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        display: none;
        align-items: center;
        gap: 6px;
        font-family: -apple-system, sans-serif !important;
      }
      #yrp-show-btn:hover {
        background: rgba(255,0,0,0.12) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── CREATE OVERLAY ──────────────────────────────────────────────
  function createOverlay() {
    if (document.getElementById('yt-rotate-pro-overlay')) return;

    overlayPanel = document.createElement('div');
    overlayPanel.id = 'yt-rotate-pro-overlay';

    const bar = document.createElement('div');
    bar.id = 'yrp-bar';
    bar.innerHTML = `
      <div id="yrp-logo">
        <div id="yrp-logo-icon">↻</div>
        <span id="yrp-label">Rotate Pro</span>
      </div>
      <div id="yrp-controls">
        <button class="yrp-btn" id="yrp-btn-cw"    title="Rotate 90° CW (Alt+R)">⟳</button>
        <button class="yrp-btn" id="yrp-btn-ccw"   title="Rotate 90° CCW">⟲</button>
        <button class="yrp-btn" id="yrp-btn-fliph" title="Flip Horizontal (Alt+H)">⇔</button>
        <button class="yrp-btn" id="yrp-btn-flipv" title="Flip Vertical">⇕</button>
        <button class="yrp-btn" id="yrp-btn-reset" title="Reset all (Alt+Shift+R)">↺</button>
      </div>
      <button class="yrp-btn" id="yrp-btn-close" title="Hide panel">✕</button>
    `;

    const badge = document.createElement('div');
    badge.id = 'yrp-angle-badge';

    overlayPanel.appendChild(bar);
    overlayPanel.appendChild(badge);
    document.body.appendChild(overlayPanel);

    // Show-again button
    const showBtn = document.createElement('button');
    showBtn.id = 'yrp-show-btn';
    showBtn.textContent = '↻ Rotate Pro';
    document.body.appendChild(showBtn);

    bindEvents(bar, showBtn);
  }

  // ── BIND EVENTS ─────────────────────────────────────────────────
  function bindEvents(bar, showBtn) {

    safe('yrp-btn-cw', 'click', (e) => {
      e.stopPropagation();
      currentRotation = (currentRotation + 90) % 360;
      applyTransform(); saveState();
    });

    safe('yrp-btn-ccw', 'click', (e) => {
      e.stopPropagation();
      currentRotation = (currentRotation - 90 + 360) % 360;
      applyTransform(); saveState();
    });

    safe('yrp-btn-fliph', 'click', (e) => {
      e.stopPropagation();
      isFlippedH = !isFlippedH;
      document.getElementById('yrp-btn-fliph').classList.toggle('yrp-active', isFlippedH);
      applyTransform(); saveState();
    });

    safe('yrp-btn-flipv', 'click', (e) => {
      e.stopPropagation();
      isFlippedV = !isFlippedV;
      document.getElementById('yrp-btn-flipv').classList.toggle('yrp-active', isFlippedV);
      applyTransform(); saveState();
    });

    safe('yrp-btn-reset', 'click', (e) => {
      e.stopPropagation();
      currentRotation = 0;
      isFlippedH = false;
      isFlippedV = false;
      document.getElementById('yrp-btn-fliph').classList.remove('yrp-active');
      document.getElementById('yrp-btn-flipv').classList.remove('yrp-active');
      applyTransform(); saveState();
    });

    // ✅ CLOSE — hides panel, shows tiny button
    safe('yrp-btn-close', 'click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      overlayPanel.style.setProperty('display', 'none', 'important');
      panelVisible = false;
      showBtn.style.display = 'flex';
    });

    // ✅ SHOW AGAIN
    showBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlayPanel.style.removeProperty('display');
      overlayPanel.style.display = 'flex';
      panelVisible = true;
      showBtn.style.display = 'none';
    });

    // ── DRAG ────────────────────────────────────────────────────
    bar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('yrp-btn') || e.target.closest('.yrp-btn')) return;
      isDragging = true;
      const rect = overlayPanel.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffsetX));
      const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffsetY));
      overlayPanel.style.left  = x + 'px';
      overlayPanel.style.top   = y + 'px';
      overlayPanel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      try {
        chrome.storage.local.set({
          panelX: overlayPanel.style.left,
          panelY: overlayPanel.style.top
        });
      } catch(e) {}
    });
  }

  function safe(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
  }

  // ── APPLY TRANSFORM ─────────────────────────────────────────────
  function applyTransform() {
    const video = document.querySelector('video');
    if (!video) return;
    const sx = isFlippedH ? -1 : 1;
    const sy = isFlippedV ? -1 : 1;
    video.style.transform       = `rotate(${currentRotation}deg) scaleX(${sx}) scaleY(${sy})`;
    video.style.transformOrigin = 'center center';
    video.style.transition      = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';

    const badge = document.getElementById('yrp-angle-badge');
    if (!badge) return;
    const active = currentRotation !== 0 || isFlippedH || isFlippedV;
    badge.style.display = active ? 'flex' : 'none';
    let label = currentRotation + '°';
    if (isFlippedH) label += ' ⇔';
    if (isFlippedV) label += ' ⇕';
    badge.textContent = label;
  }

  // ── SAVE / LOAD ─────────────────────────────────────────────────
  function saveState() {
    try {
      chrome.storage.local.set({ rotation: currentRotation, flipH: isFlippedH, flipV: isFlippedV });
    } catch(e) {}
  }

  function loadSavedState() {
    try {
      chrome.storage.local.get(['rotation','flipH','flipV','panelX','panelY'], (result) => {
        if (result.rotation !== undefined) currentRotation = result.rotation;
        if (result.flipH !== undefined) isFlippedH = result.flipH;
        if (result.flipV !== undefined) isFlippedV = result.flipV;
        if (result.panelX && overlayPanel) {
          overlayPanel.style.left  = result.panelX;
          overlayPanel.style.top   = result.panelY;
          overlayPanel.style.right = 'auto';
        }
        if (isFlippedH) document.getElementById('yrp-btn-fliph')?.classList.add('yrp-active');
        if (isFlippedV) document.getElementById('yrp-btn-flipv')?.classList.add('yrp-active');
        if (currentRotation !== 0 || isFlippedH || isFlippedV) applyTransform();
      });
    } catch(e) {}
  }

  // ── KEYBOARD SHORTCUTS ──────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      currentRotation = 0; isFlippedH = false; isFlippedV = false;
      document.getElementById('yrp-btn-fliph')?.classList.remove('yrp-active');
      document.getElementById('yrp-btn-flipv')?.classList.remove('yrp-active');
      applyTransform(); saveState(); return;
    }
    if (e.altKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      currentRotation = (currentRotation + 90) % 360;
      applyTransform(); saveState();
    }
    if (e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      isFlippedH = !isFlippedH;
      document.getElementById('yrp-btn-fliph')?.classList.toggle('yrp-active', isFlippedH);
      applyTransform(); saveState();
    }
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      currentRotation = (currentRotation + 1) % 360;
      applyTransform(); saveState();
    }
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      currentRotation = (currentRotation - 1 + 360) % 360;
      applyTransform(); saveState();
    }
  });

  // ── MESSAGES FROM POPUP ─────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_ROTATION') {
      currentRotation = msg.angle;
      applyTransform(); saveState();
    }
    if (msg.type === 'RESET') {
      currentRotation = 0; isFlippedH = false; isFlippedV = false;
      applyTransform(); saveState();
    }
    if (msg.type === 'SHOW_PANEL' && overlayPanel) {
      overlayPanel.style.display = 'flex';
      const sb = document.getElementById('yrp-show-btn');
      if (sb) sb.style.display = 'none';
    }
  });

  // ── YOUTUBE SPA NAVIGATION ──────────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(init, 1800);
    }
  }).observe(document.body, { childList: true, subtree: true });

  // ── START ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();