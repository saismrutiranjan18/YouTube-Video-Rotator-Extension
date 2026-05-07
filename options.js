// options.js — Rotate Pro Settings Page

document.addEventListener('DOMContentLoaded', () => {

  // ── SIDEBAR NAV ────────────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ── OPACITY SLIDER ─────────────────────────────────────────────
  const opacitySlider = document.getElementById('opacitySlider');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.getElementById('opacityVal').textContent = val + '%';
      document.getElementById('opacityBar').style.width = val + '%';
      chrome.storage.local.set({ overlayOpacity: val });
    });
  }

  // ── POSITION BUTTONS ───────────────────────────────────────────
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

  // ── AUTO-ROTATE TOGGLE ─────────────────────────────────────────
  document.getElementById('autoToggle').addEventListener('click', () => {
    const el = document.getElementById('autoToggle');
    const isOn = el.dataset.on === 'true';
    el.dataset.on = !isOn;
    el.style.background = !isOn ? '#FF0000' : '#444';
    const thumb = el.querySelector('.mini-toggle-thumb');
    thumb.style.right = !isOn ? '2px' : 'auto';
    thumb.style.left  = !isOn ? 'auto' : '2px';
    chrome.storage.local.set({ autoRotate: !isOn });
  });

  // ── ADD CHANNEL ────────────────────────────────────────────────
  document.getElementById('addChannelBtn').addEventListener('click', addChannel);

  document.getElementById('channelInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addChannel();
  });

  // ── DELETE CHANNEL (delegated) ─────────────────────────────────
  document.getElementById('channelList').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
      btn.closest('.channel-row').remove();
      showToast('Channel removed');
    }
  });

  // ── EDIT SHORTCUTS BUTTON ──────────────────────────────────────
  document.getElementById('editShortcutsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // ── LOAD SAVED SETTINGS ────────────────────────────────────────
  chrome.storage.local.get(['overlayOpacity', 'controlPosition', 'autoRotate'], (result) => {
    if (result.overlayOpacity) {
      document.getElementById('opacityVal').textContent = result.overlayOpacity + '%';
      document.getElementById('opacityBar').style.width = result.overlayOpacity + '%';
      document.getElementById('opacitySlider').value = result.overlayOpacity;
    }
    if (result.controlPosition === 'Bottom Right') {
      document.querySelectorAll('.pos-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.trim() === 'Bottom Right');
        b.classList.toggle('inactive', b.textContent.trim() !== 'Bottom Right');
      });
    }
    if (result.autoRotate) {
      const el = document.getElementById('autoToggle');
      el.dataset.on = 'true';
      el.style.background = '#FF0000';
      const thumb = el.querySelector('.mini-toggle-thumb');
      thumb.style.right = '2px';
      thumb.style.left = 'auto';
    }
  });

});

// ── HELPERS ────────────────────────────────────────────────────────

function addChannel() {
  const input = document.getElementById('channelInput');
  const val = input.value.trim();
  if (!val) return;

  const name = val.includes('youtube.com/@')
    ? val.split('@')[1] || val
    : val;
  const initial = name.charAt(0).toUpperCase();

  const row = document.createElement('div');
  row.className = 'channel-row';
  row.innerHTML = `
    <div class="channel-info">
      <div class="channel-avatar">${initial}</div>
      <span class="channel-name">${name}</span>
    </div>
    <button class="delete-btn">
      <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
    </button>
  `;
  document.getElementById('channelList').appendChild(row);
  input.value = '';
  showToast('Channel added!');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = '✓ ' + msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}