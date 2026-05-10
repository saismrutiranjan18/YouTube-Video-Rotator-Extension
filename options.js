// options.js — Rotate Pro Settings  v1.2.0

document.addEventListener('DOMContentLoaded', () => {

  // ── SIDEBAR NAV ───────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ── TOPBAR BUTTONS ────────────────────────────────────────
  document.getElementById('topHelpBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/saismrutiranjan18/YouTube-Video-Rotator' });
  });

  document.getElementById('topSettingsBtn').addEventListener('click', () => {
    // Already on settings — scroll to top
    document.querySelector('.scroll-area').scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── OPACITY SLIDER ────────────────────────────────────────
  document.getElementById('opacitySlider').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('opacityVal').textContent  = val + '%';
    document.getElementById('opacityBar').style.width = val + '%';
    chrome.storage.local.set({ overlayOpacity: parseInt(val) });

    // Apply opacity to panel on YouTube tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_OPACITY', value: parseInt(val) }).catch(() => {});
      }
    });
  });

  // ── POSITION BUTTONS ──────────────────────────────────────
  document.querySelectorAll('.pos-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pos-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('inactive');
      });
      btn.classList.add('active');
      btn.classList.remove('inactive');
      chrome.storage.local.set({ controlPosition: btn.textContent.trim() });
      showToast('Position saved');
    });
  });

  // ── AUTO TOGGLE ───────────────────────────────────────────
  document.getElementById('autoToggle').addEventListener('click', () => {
    const el = document.getElementById('autoToggle');
    el.classList.toggle('on');
    chrome.storage.local.set({ autoRotate: el.classList.contains('on') });
  });

  // ── ADD CHANNEL ───────────────────────────────────────────
  document.getElementById('addChannelBtn').addEventListener('click', addChannel);
  document.getElementById('channelInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addChannel();
  });

  // ── DELETE CHANNEL (delegated) ────────────────────────────
  document.getElementById('channelList').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
      btn.closest('.channel-row').remove();
      showToast('Channel removed');
    }
  });

  // ── EDIT SHORTCUTS ────────────────────────────────────────
  document.getElementById('editShortcutsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // ── LOAD SAVED SETTINGS ───────────────────────────────────
  chrome.storage.local.get(['overlayOpacity', 'controlPosition', 'autoRotate'], (r) => {

    if (r.overlayOpacity !== undefined) {
      document.getElementById('opacityVal').textContent  = r.overlayOpacity + '%';
      document.getElementById('opacityBar').style.width = r.overlayOpacity + '%';
      document.getElementById('opacitySlider').value    = r.overlayOpacity;
    }

    if (r.controlPosition) {
      document.querySelectorAll('.pos-btn').forEach(b => {
        const match = b.textContent.trim() === r.controlPosition;
        b.classList.toggle('active',   match);
        b.classList.toggle('inactive', !match);
      });
    }

    if (r.autoRotate) {
      document.getElementById('autoToggle').classList.add('on');
    }
  });

});

// ── HELPERS ──────────────────────────────────────────────────

function addChannel() {
  const input = document.getElementById('channelInput');
  const val   = input.value.trim();
  if (!val) return;

  // Extract handle name
  let name = val;
  if (val.includes('youtube.com/@')) {
    name = val.split('@').pop().split('/')[0];
  } else if (val.startsWith('@')) {
    name = val.slice(1);
  }

  const initial = name.charAt(0).toUpperCase();

  const row = document.createElement('div');
  row.className = 'channel-row';
  row.innerHTML = `
    <div class="channel-info">
      <div class="channel-avatar">${initial}</div>
      <span class="channel-name">${name}</span>
    </div>
    <button class="delete-btn" title="Remove">
      <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
    </button>
  `;
  document.getElementById('channelList').appendChild(row);
  input.value = '';
  showToast('Channel added!');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✓ ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
