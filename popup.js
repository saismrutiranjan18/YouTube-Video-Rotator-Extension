// popup.js — Rotate Pro  v1.2.0

let currentAngle = 0;
let isOnYouTube  = false;

document.addEventListener('DOMContentLoaded', () => {

  // ── CHECK IF CURRENT TAB IS YOUTUBE ──────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    isOnYouTube = tab && tab.url && tab.url.includes('youtube.com');

    if (!isOnYouTube) {
      document.getElementById('not-yt-msg').style.display = 'block';
      document.getElementById('applyLabel').textContent   = 'Open YouTube First';
    }

    // Load saved rotation for this tab
    chrome.storage.local.get(['rotation'], (r) => {
      currentAngle = r.rotation || 0;
      document.getElementById('rotationSlider').value      = currentAngle;
      document.getElementById('degreeDisplay').textContent = currentAngle + '°';
      highlightPreset(currentAngle);
    });
  });

  // ── LOAD TOGGLE STATE ─────────────────────────────────────
  chrome.storage.local.get(['autoDetect'], (r) => {
    if (r.autoDetect) {
      document.getElementById('toggleTrack').classList.add('on');
    }
  });

  // ── PRESET BUTTONS ────────────────────────────────────────
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const angle = parseInt(btn.dataset.angle);
      setAngle(angle);
      sendToPage({ type: 'SET_ROTATION', angle });
    });
  });

  // ── SLIDER ────────────────────────────────────────────────
  document.getElementById('rotationSlider').addEventListener('input', (e) => {
    const angle = parseInt(e.target.value);
    setAngle(angle);
    sendToPage({ type: 'SET_ROTATION', angle });
  });

  // ── TOGGLE (auto-detect) ──────────────────────────────────
  document.getElementById('toggleTrack').addEventListener('click', () => {
    const track = document.getElementById('toggleTrack');
    track.classList.toggle('on');
    chrome.storage.local.set({ autoDetect: track.classList.contains('on') });
  });

  // ── APPLY BUTTON ──────────────────────────────────────────
  document.getElementById('applyBtn').addEventListener('click', () => {
    if (!isOnYouTube) {
      chrome.tabs.create({ url: 'https://www.youtube.com' });
      return;
    }
    sendToPage({ type: 'SET_ROTATION', angle: currentAngle });
  });

  // ── DOUBLE CLICK APPLY → SHOW HIDDEN PANEL ───────────────
  document.getElementById('applyBtn').addEventListener('dblclick', () => {
    sendToPage({ type: 'SHOW_PANEL' });
  });

  // ── HELP BUTTON ───────────────────────────────────────────
  document.getElementById('helpBtn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/saismrutiranjan18/YouTube-Video-Rotator'
    });
  });

  // ── SETTINGS BUTTON ───────────────────────────────────────
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ── BOTTOM NAV ────────────────────────────────────────────
  document.getElementById('navShortcuts').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('navSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

});

// ── HELPERS ───────────────────────────────────────────────────

function setAngle(angle) {
  currentAngle = angle;
  document.getElementById('rotationSlider').value      = angle;
  document.getElementById('degreeDisplay').textContent = angle + '°';
  highlightPreset(angle);
  chrome.storage.local.set({ rotation: angle });
}

function highlightPreset(angle) {
  document.querySelectorAll('.preset-btn').forEach((b) => {
    b.classList.toggle('active', parseInt(b.dataset.angle) === angle);
  });
}

// Send message to content script; fallback to scripting API if needed
function sendToPage(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    const tab = tabs[0];

    if (!tab.url || !tab.url.includes('youtube.com')) return;

    chrome.tabs.sendMessage(tab.id, msg, () => {
      if (chrome.runtime.lastError) {
        // Content script not yet injected — use scripting API as fallback
        if (msg.type === 'SET_ROTATION') {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (deg) => {
              const v = document.querySelector('video');
              if (v) {
                v.style.transform       = `rotate(${deg}deg)`;
                v.style.transformOrigin = 'center center';
                v.style.transition      = 'transform 0.25s ease';
              }
            },
            args: [msg.angle]
          }).catch(() => {});
        }
      }
    });
  });
}
