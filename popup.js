// popup.js — Rotate Pro Extension

let currentAngle = 0;

// ── ON LOAD ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Load saved rotation
  chrome.storage.local.get(['rotation'], (result) => {
    if (result.rotation !== undefined) {
      currentAngle = result.rotation;
      document.getElementById('rotationSlider').value = currentAngle;
      document.getElementById('degreeDisplay').textContent = currentAngle + '°';
      highlightPreset(currentAngle);
    }
  });

  // ── PRESET BUTTONS ──────────────────────────────────────────────
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const angle = parseInt(btn.dataset.angle);
      currentAngle = angle;
      document.getElementById('rotationSlider').value = angle;
      document.getElementById('degreeDisplay').textContent = angle + '°';
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyRotation(angle);
    });
  });

  // ── SLIDER ──────────────────────────────────────────────────────
  document.getElementById('rotationSlider').addEventListener('input', (e) => {
    currentAngle = parseInt(e.target.value);
    document.getElementById('degreeDisplay').textContent = currentAngle + '°';
    highlightPreset(currentAngle);
    applyRotation(currentAngle);
  });

  // ── TOGGLE SWITCH ───────────────────────────────────────────────
  document.getElementById('toggleTrack').addEventListener('click', () => {
    document.getElementById('toggleTrack').classList.toggle('off');
  });

  // ── APPLY BUTTON (Live Preview card) ────────────────────────────
  document.getElementById('applyBtn').addEventListener('click', () => {
    applyRotation(currentAngle);
  });

  // ── SETTINGS BUTTON ─────────────────────────────────────────────
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ── NAV — SHORTCUTS ─────────────────────────────────────────────
  document.getElementById('navShortcuts').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ── NAV — SETTINGS ──────────────────────────────────────────────
  document.getElementById('navSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

});

// ── HELPERS ───────────────────────────────────────────────────────

function highlightPreset(angle) {
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.angle) === angle);
  });
}

function applyRotation(angle) {
  chrome.storage.local.set({ rotation: angle });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (deg) => {
          const video = document.querySelector('video');
          if (video) {
            video.style.transform = `rotate(${deg}deg)`;
            video.style.transformOrigin = 'center center';
            video.style.transition = 'transform 0.3s ease';
          }
        },
        args: [angle]
      }).catch(() => {});
    }
  });
}