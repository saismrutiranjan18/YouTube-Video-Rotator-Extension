// YouTube Video Rotator Extension
(function() {
  'use strict';

  let currentRotation = 0;
  let controlPanel = null;
  let videoContainer = null;

  // Wait for YouTube video player to load
  function initialize() {
    const checkInterval = setInterval(() => {
      videoContainer = document.querySelector('.html5-video-player');
      if (videoContainer) {
        clearInterval(checkInterval);
        createControlPanel();
        observeVideoChanges();
      }
    }, 1000);
  }

  // Create the rotation control panel
  function createControlPanel() {
    if (controlPanel) return;

    controlPanel = document.createElement('div');
    controlPanel.id = 'yt-rotator-panel';
    controlPanel.innerHTML = `
      <div class="yt-rotator-header">
        <span class="yt-rotator-title">🔄 Video Rotation</span>
        <button class="yt-rotator-toggle" title="Toggle panel">−</button>
      </div>
      <div class="yt-rotator-content">
        <div class="yt-rotator-quick">
          <button class="yt-rotator-btn" data-angle="90">90°</button>
          <button class="yt-rotator-btn" data-angle="180">180°</button>
          <button class="yt-rotator-btn" data-angle="270">270°</button>
          <button class="yt-rotator-btn yt-rotator-reset" data-angle="0">Reset</button>
        </div>
        <div class="yt-rotator-fine">
          <label class="yt-rotator-label">
            Fine Control: <span id="yt-rotator-value">0°</span>
          </label>
          <input 
            type="range" 
            id="yt-rotator-slider" 
            min="0" 
            max="360" 
            value="0" 
            class="yt-rotator-slider"
          />
        </div>
        <div class="yt-rotator-flip">
          <button class="yt-rotator-btn-small" id="yt-flip-h">Flip H</button>
          <button class="yt-rotator-btn-small" id="yt-flip-v">Flip V</button>
        </div>
      </div>
    `;

    document.body.appendChild(controlPanel);
    attachEventListeners();
  }

  // Attach event listeners to controls
  function attachEventListeners() {
    // Quick rotation buttons
    const quickBtns = controlPanel.querySelectorAll('.yt-rotator-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const angle = parseInt(btn.dataset.angle);
        setRotation(angle);
        updateSlider(angle);
      });
    });

    // Slider
    const slider = document.getElementById('yt-rotator-slider');
    slider.addEventListener('input', (e) => {
      const angle = parseInt(e.target.value);
      setRotation(angle);
      updateValueDisplay(angle);
    });

    // Toggle panel
    const toggleBtn = controlPanel.querySelector('.yt-rotator-toggle');
    const content = controlPanel.querySelector('.yt-rotator-content');
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = content.style.display === 'none';
      content.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });

    // Flip buttons
    document.getElementById('yt-flip-h').addEventListener('click', flipHorizontal);
    document.getElementById('yt-flip-v').addEventListener('click', flipVertical);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // Set video rotation
  function setRotation(angle) {
    currentRotation = angle;
    const video = document.querySelector('video');
    
    if (video) {
      const transform = video.style.transform || '';
      const otherTransforms = transform.split(' ').filter(t => !t.startsWith('rotate('));
      const newTransform = [...otherTransforms, `rotate(${angle}deg)`].join(' ');
      video.style.transform = newTransform;
      video.style.transformOrigin = 'center center';
    }
  }

  // Update slider position
  function updateSlider(angle) {
    const slider = document.getElementById('yt-rotator-slider');
    if (slider) {
      slider.value = angle;
      updateValueDisplay(angle);
    }
  }

  // Update value display
  function updateValueDisplay(angle) {
    const display = document.getElementById('yt-rotator-value');
    if (display) {
      display.textContent = `${angle}°`;
    }
  }

  // Flip horizontal
  let isFlippedH = false;
  function flipHorizontal() {
    const video = document.querySelector('video');
    if (video) {
      isFlippedH = !isFlippedH;
      const transform = video.style.transform || '';
      const otherTransforms = transform.split(' ').filter(t => !t.startsWith('scaleX('));
      const newTransform = [...otherTransforms, `scaleX(${isFlippedH ? -1 : 1})`].join(' ');
      video.style.transform = newTransform;
    }
  }

  // Flip vertical
  let isFlippedV = false;
  function flipVertical() {
    const video = document.querySelector('video');
    if (video) {
      isFlippedV = !isFlippedV;
      const transform = video.style.transform || '';
      const otherTransforms = transform.split(' ').filter(t => !t.startsWith('scaleY('));
      const newTransform = [...otherTransforms, `scaleY(${isFlippedV ? -1 : 1})`].join(' ');
      video.style.transform = newTransform;
    }
  }

  // Keyboard shortcuts
  function handleKeyboard(e) {
    // Only activate when Ctrl/Cmd + Alt are pressed
    if (!(e.ctrlKey || e.metaKey) || !e.altKey) return;

    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        currentRotation = (currentRotation + 90) % 360;
        setRotation(currentRotation);
        updateSlider(currentRotation);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        currentRotation = (currentRotation - 90 + 360) % 360;
        setRotation(currentRotation);
        updateSlider(currentRotation);
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentRotation = (currentRotation + 1) % 360;
        setRotation(currentRotation);
        updateSlider(currentRotation);
        break;
      case 'ArrowDown':
        e.preventDefault();
        currentRotation = (currentRotation - 1 + 360) % 360;
        setRotation(currentRotation);
        updateSlider(currentRotation);
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        setRotation(0);
        updateSlider(0);
        break;
    }
  }

  // Observe video changes (YouTube's SPA navigation)
  function observeVideoChanges() {
    const observer = new MutationObserver(() => {
      const video = document.querySelector('video');
      if (video && currentRotation !== 0) {
        setRotation(currentRotation);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();