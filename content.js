// YouTube Rotate Pro — content.js
(function () {
  'use strict';

  let currentRotation = 0;
  let isFlippedH = false;
  let isFlippedV = false;
  let overlayPanel = null;
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    const check = setInterval(() => {
      const player = document.querySelector('.html5-video-player');
      if (player) {
        clearInterval(check);
        loadSavedState();
        injectOverlay();
        observeNavigation();
      }
    }, 1000);
  }

  function loadSavedState() {
    chrome.storage.local.get(['rotation', 'flipH', 'flipV'], (result) => {
      if (result.rotation) {
        currentRotation = result.rotation;
        applyTransform();
      }
      if (result.flipH) { isFlippedH = result.flipH; applyTransform(); }
      if (result.flipV) { isFlippedV = result.flipV; applyTransform(); }
    });
  }

  // ─── Overlay UI ─────────────────────────────────────────────────────────────

  function injectOverlay() {
    if (document.getElementById('rp-overlay')) return;

    // Inject Google Fonts into page
    if (!document.getElementById('rp-fonts')) {
      const link = document.createElement('link');
      link.id = 'rp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      document.head.appendChild(link);
    }

    overlayPanel = document.createElement('div');
    overlayPanel.id = 'rp-overlay';
    overlayPanel.innerHTML = `
      <div id="rp-bar">
        <span id="rp-label">ROTATE PRO</span>
        <div id="rp-controls">
          <button class="rp-btn" id="rp-cw"     title="Rotate 90° CW">
            <span class="rp-icon">rotate_90_degrees_cw</span>
          </button>
          <button class="rp-btn" id="rp-ccw"    title="Rotate 90° CCW">
            <span class="rp-icon">rotate_90_degrees_ccw</span>
          </button>
          <button class="rp-btn" id="rp-flip-h" title="Flip Horizontal">
            <span class="rp-icon">flip</span>
          </button>
          <button class="rp-btn" id="rp-reset"  title="Reset">
            <span class="rp-icon">restart_alt</span>
          </button>
          <button class="rp-btn" id="rp-close"  title="Close">
            <span class="rp-icon">close</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayPanel);
    injectStyles();
    bindOverlayEvents();
    makeDraggable();

    // Load position
    chrome.storage.local.get(['overlayX', 'overlayY', 'position'], (r) => {
      if (r.overlayX !== undefined && r.overlayY !== undefined) {
        overlayPanel.style.left = r.overlayX + 'px';
        overlayPanel.style.top  = r.overlayY + 'px';
        overlayPanel.style.right = 'auto';
      } else if (r.position === 'bottom-right') {
        overlayPanel.style.bottom = '80px';
        overlayPanel.style.top = 'auto';
        overlayPanel.style.right = '16px';
        overlayPanel.style.left = 'auto';
      }
    });
  }

  function injectStyles() {
    if (document.getElementById('rp-styles')) return;
    const style = document.createElement('style');
    style.id = 'rp-styles';
    style.textContent = `
      #rp-overlay {
        position: fixed;
        top: 80px;
        right: 16px;
        z-index: 9999;
        user-select: none;
      }

      #rp-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 15, 15, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 7px 10px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        cursor: grab;
      }

      #rp-bar:active { cursor: grabbing; }

      #rp-label {
        color: #FF0000;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        font-family: 'Inter', sans-serif;
        padding-right: 8px;
        border-right: 1px solid rgba(255,255,255,0.1);
        margin-right: 2px;
        white-space: nowrap;
      }

      #rp-controls {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .rp-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaa;
        transition: background 0.15s, color 0.15s;
      }

      .rp-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
      .rp-btn:active { transform: scale(0.9); }

      #rp-close:hover { background: rgba(255,0,0,0.15); color: #FF0000; }

      .rp-icon {
        font-family: 'Material Symbols Outlined';
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        font-size: 17px;
        line-height: 1;
      }

      /* Video smooth transform */
      .html5-main-video {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        transform-origin: center center !important;
      }
    `;
    document.head.appendChild(style);
  }

  function bindOverlayEvents() {
    document.getElementById('rp-cw').addEventListener('click', (e) => {
      e.stopPropagation();
      currentRotation = (currentRotation + 90) % 360;
      applyTransform();
      saveState();
    });

    document.getElementById('rp-ccw').addEventListener('click', (e) => {
      e.stopPropagation();
      currentRotation = (currentRotation - 90 + 360) % 360;
      applyTransform();
      saveState();
    });

    document.getElementById('rp-flip-h').addEventListener('click', (e) => {
      e.stopPropagation();
      isFlippedH = !isFlippedH;
      applyTransform();
      saveState();
    });

    document.getElementById('rp-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      currentRotation = 0;
      isFlippedH = false;
      isFlippedV = false;
      applyTransform();
      saveState();
    });

    document.getElementById('rp-close').addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlayPanel) {
        overlayPanel.style.display = 'none';
      }
    });
  }

  function makeDraggable() {
    const bar = document.getElementById('rp-bar');

    bar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.rp-btn')) return;
      isDragging = true;
      const rect = overlayPanel.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      overlayPanel.style.right = 'auto';
      overlayPanel.style.bottom = 'auto';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      overlayPanel.style.left = x + 'px';
      overlayPanel.style.top  = y + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        chrome.storage.local.set({
          overlayX: parseInt(overlayPanel.style.left),
          overlayY: parseInt(overlayPanel.style.top)
        });
      }
    });
  }

  // ─── Transform ───────────────────────────────────────────────────────────────

  function applyTransform() {
    const video = document.querySelector('video');
    if (!video) return;

    const scaleX = isFlippedH ? -1 : 1;
    const scaleY = isFlippedV ? -1 : 1;
    video.style.transform = `rotate(${currentRotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
    video.style.transformOrigin = 'center center';
  }

  function saveState() {
    chrome.storage.local.set({
      rotation: currentRotation,
      flipH: isFlippedH,
      flipV: isFlippedV
    });
  }

  // ─── Message listener (from popup) ──────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'rotate') {
      currentRotation = msg.angle;
      applyTransform();
      // Re-show overlay if hidden
      if (overlayPanel) overlayPanel.style.display = '';
    }
    if (msg.action === 'reset') {
      currentRotation = 0;
      isFlippedH = false;
      isFlippedV = false;
      applyTransform();
    }
  });

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return;

    switch (e.key.toLowerCase()) {
      case 'r':
        e.preventDefault();
        currentRotation = (currentRotation + 90) % 360;
        applyTransform();
        saveState();
        break;
      case 'h':
        e.preventDefault();
        isFlippedH = !isFlippedH;
        applyTransform();
        saveState();
        break;
      case 'v':
        e.preventDefault();
        isFlippedV = !isFlippedV;
        applyTransform();
        saveState();
        break;
    }

    // Alt + Shift + R = reset
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      currentRotation = 0;
      isFlippedH = false;
      isFlippedV = false;
      applyTransform();
      saveState();
    }
  });

  // ─── SPA navigation observer ─────────────────────────────────────────────────

  function observeNavigation() {
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
          // Re-apply transform on new video
          applyTransform();
          // Re-inject overlay if removed
          if (!document.getElementById('rp-overlay')) {
            injectOverlay();
          }
        }, 1500);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ─── Start ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();