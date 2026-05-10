// options.js — Rotate Pro Settings

document.addEventListener('DOMContentLoaded', () => {

  // ── SIDEBAR NAV ───────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ── OPACITY SLIDER ────────────────────────────────────────
  document.getElementById('opacitySlider').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('opacityVal').textContent = val + '%';
    document.getElementById('opacityBar').style.width = val + '%';
    chrome.storage.local.set({ overlayOpacity: parseInt(val) });
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
    });
  });

  // ── AUTO TOGGLE ───────────────────────────────────────────
  document.getElementById('autoToggle').addEventListener('click', () => {
    const el    = document.getElementById('autoToggle');
    const thumb = el.querySelector('.mini-toggle-thumb');
    const isOn  = el.dataset.on === 'true';

    el.dataset.on      = String(!isOn);
    el.style.background = !isOn ? '#FF0000' : '#444';
    thumb.style.left    = !isOn ? 'auto' : '2px';
    thumb.style.right   = !isOn ? '2px'  : 'auto';
    chrome.storage.local.set({ autoRotate: !isOn });
  });

  // ── ADD CHANNEL ───────────────────────────────────────────
  document.getElementById('addChannelBtn').addEventListener('click', addChannel);
  document.getElementById('channelInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addChannel();
  });

  // ── DELETE CHANNEL (event delegation) ────────────────────
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
    if (r.overlayOpacity) {
      document.getElementById('opacityVal').textContent  = r.overlayOpacity + '%';
      document.getElementById('opacityBar').style.width  = r.overlayOpacity + '%';
      document.getElementById('opacitySlider').value     = r.overlayOpacity;
    }
    if (r.controlPosition === 'Bottom Right') {
      document.querySelectorAll('.pos-btn').forEach(b => {
        const match = b.textContent.trim() === 'Bottom Right';
        b.classList.toggle('active',   match);
        b.classList.toggle('inactive', !match);
      });
    }
    if (r.autoRotate) {
      const el    = document.getElementById('autoToggle');
      const thumb = el.querySelector('.mini-toggle-thumb');
      el.dataset.on      = 'true';
      el.style.background = '#FF0000';
      thumb.style.right  = '2px';
      thumb.style.left   = 'auto';
    }
  });

});

// ── HELPERS ──────────────────────────────────────────────────

function addChannel() {
  const input = document.getElementById('channelInput');
  const val   = input.value.trim();
  if (!val) return;

  const name    = val.includes('@') ? val.split('@').pop().split('/')[0] : val;
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