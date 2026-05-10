// popup.js — Rotate Pro

let currentAngle = 0;

document.addEventListener('DOMContentLoaded', () => {

  // ── LOAD SAVED STATE ──────────────────────────────────────
  chrome.storage.local.get(['rotation'], (r) => {
    currentAngle = r.rotation || 0;
    document.getElementById('rotationSlider').value = currentAngle;
    document.getElementById('degreeDisplay').textContent = currentAngle + '°';
    highlightPreset(currentAngle);
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

  // ── TOGGLE ────────────────────────────────────────────────
  document.getElementById('toggleTrack').addEventListener('click', () => {
    document.getElementById('toggleTrack').classList.toggle('off');
  });

  // ── APPLY BUTTON ──────────────────────────────────────────
  document.getElementById('applyBtn').addEventListener('click', () => {
    sendToPage({ type: 'SET_ROTATION', angle: currentAngle });
  });

  // ── SHOW PANEL (if user hid it) ───────────────────────────
  document.getElementById('applyBtn').addEventListener('dblclick', () => {
    sendToPage({ type: 'SHOW_PANEL' });
  });

  // ── HELP BUTTON ───────────────────────────────────────────
  document.getElementById('helpBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/saismrutiranjan18' }); 
  });

  // ── SETTINGS BUTTON ───────────────────────────────────────
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ── NAV ITEMS ─────────────────────────────────────────────
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
  document.getElementById('rotationSlider').value = angle;
  document.getElementById('degreeDisplay').textContent = angle + '°';
  highlightPreset(angle);
  chrome.storage.local.set({ rotation: angle });
}

function highlightPreset(angle) {
  document.querySelectorAll('.preset-btn').forEach((b) => {
    b.classList.toggle('active', parseInt(b.dataset.angle) === angle);
  });
}

// Send message to the active YouTube tab's content script
function sendToPage(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    const tab = tabs[0];

    // Only works on YouTube
    if (!tab.url || !tab.url.includes('youtube.com')) return;

    chrome.tabs.sendMessage(tab.id, msg, (response) => {
      // Suppress "no receiver" error — content script may not be ready
      if (chrome.runtime.lastError) {
        // Fallback: inject directly
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (angle) => {
            const v = document.querySelector('video');
            if (v) {
              v.style.transform = `rotate(${angle}deg)`;
              v.style.transformOrigin = 'center center';
              v.style.transition = 'transform 0.25s ease';
            }
          },
          args: [msg.angle || 0]
        }).catch(() => {});
      }
    });
  });
}