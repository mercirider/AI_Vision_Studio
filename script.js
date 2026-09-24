/* ═══════════════════════════════════════════
   AI VISION STUDIO — Main Application Logic
   ═══════════════════════════════════════════ */

/* ═══════════ STATE ═══════════ */
const state = {
  currentRatio: '1:1',
  currentStyle: 'realistic',
  currentImage: null,
  gallery: [],
  recent: [],
  chatHistory: [],
  isGenerating: false
};

/* ═══════════ CONSTANTS ═══════════ */
const RATIOS = {
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3':  { width: 1024, height: 768 }
};

const STYLES = {
  realistic:  'ultra realistic, photorealistic, 8K, cinematic lighting, highly detailed, sharp focus',
  anime:      'anime style, studio ghibli, vibrant colors, detailed illustration, anime key visual',
  cyberpunk:  'cyberpunk, neon lights, futuristic, blade runner style, moody atmosphere, glowing',
  watercolor: 'watercolor painting, soft colors, artistic, flowing brush strokes, painterly',
  '3d':       '3D render, octane render, unreal engine 5, cinematic, ray tracing, highly detailed',
  sketch:     'pencil sketch, black and white, detailed linework, artistic drawing, hand-drawn'
};

const SURPRISE_PROMPTS = [
  'A majestic white tiger walking through a mystical glowing forest with fireflies',
  'Futuristic cyberpunk city at night with neon lights reflecting on wet streets',
  'A cute fluffy cat wearing astronaut suit floating in space with colorful nebula',
  'Ancient dragon sleeping on a mountain of gold in a crystal cave',
  'Bioluminescent jellyfish floating in deep ocean with glowing coral reefs',
  'A steampunk airship flying through golden sunset clouds',
  'Magical library with floating books and glowing candles, mystical atmosphere',
  'A samurai standing under cherry blossom tree with moonlight',
  'Portrait of a wise old wizard with glowing eyes and magic staff',
  'A cozy cabin in snowy mountains with warm light coming from windows',
  'Astronaut discovering an alien garden on a distant planet',
  'A phoenix rising from flames with spectacular fire wings',
  'Underwater city with mermaids and glowing buildings',
  'A robot tending to a beautiful flower garden in post-apocalyptic world',
  'Enchanted forest with glowing mushrooms and fairy lights',
  'A lion with a golden mane standing on a rock at sunset',
  'Cyberpunk samurai with neon katana in rainy Tokyo street',
  'A young girl with magical powers surrounded by floating crystals',
  'Vintage car driving through Route 66 at sunset',
  'A beautiful mermaid swimming with dolphins in crystal clear water'
];

/* ═══════════ DOM ═══════════ */
const els = {
  particleCanvas: document.getElementById('particleCanvas'),
  navTabs: document.querySelectorAll('.nav-tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  themeToggle: document.getElementById('themeToggle'),

  // Generate tab
  ratioBtns: document.querySelectorAll('.ratio-btn'),
  styleBtns: document.querySelectorAll('.style-btn'),
  hdToggle: document.getElementById('hdToggle'),
  detailToggle: document.getElementById('detailToggle'),
  seedInput: document.getElementById('seedInput'),
  promptInput: document.getElementById('promptInput'),
  charCount: document.getElementById('charCount'),
  surpriseBtn: document.getElementById('surpriseBtn'),
  tipChips: document.querySelectorAll('.tip-chip'),
  generateBtn: document.getElementById('generateBtn'),
  imagePreview: document.getElementById('imagePreview'),
  previewActions: document.getElementById('previewActions'),
  downloadBtn: document.getElementById('downloadBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  saveGalleryBtn: document.getElementById('saveGalleryBtn'),
  shareBtn: document.getElementById('shareBtn'),
  recentList: document.getElementById('recentList'),

  // Chat tab
  chatMessages: document.getElementById('chatMessages'),
  chatInput: document.getElementById('chatInput'),
  sendBtn: document.getElementById('sendBtn'),
  clearChatBtn: document.getElementById('clearChatBtn'),
  suggestionChips: document.querySelectorAll('.suggestion-chip'),

  // Gallery tab
  galleryGrid: document.getElementById('galleryGrid'),
  galleryEmpty: document.getElementById('galleryEmpty'),
  clearGalleryBtn: document.getElementById('clearGalleryBtn'),

  // Global
  toast: document.getElementById('toast'),
  loadingOverlay: document.getElementById('loadingOverlay')
};

/* ═══════════ PARTICLE BACKGROUND ═══════════ */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.resize();
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(80, Math.floor(window.innerWidth / 20));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        color: ['#00d4ff', '#a855f7', '#ec4899'][Math.floor(Math.random() * 3)]
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    // Draw & update particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= dx * 0.008;
          p.y -= dy * 0.008;
        }
      }

      // Bounce
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.fillStyle = p.color;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

/* ═══════════ UTILITIES ═══════════ */
function showToast(message, type = 'info') {
  els.toast.textContent = message;
  els.toast.className = 'toast show ' + type;
  setTimeout(() => els.toast.classList.remove('show'), 2800);
}

function showLoading(show = true) {
  els.loadingOverlay.classList.toggle('show', show);
}

function formatTime(date = new Date()) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Abhi';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ═══════════ TAB SWITCHING ═══════════ */
function switchTab(tabName) {
  els.navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  els.tabContents.forEach(c => c.classList.toggle('active', c.id === tabName + 'Tab'));
}

/* ═══════════ AI IMAGE GENERATION ═══════════ */
function buildPrompt(userPrompt) {
  let finalPrompt = userPrompt.trim();
  finalPrompt += ', ' + STYLES[state.currentStyle];
  if (els.hdToggle.checked) finalPrompt += ', high definition, sharp details, professional photography';
  if (els.detailToggle.checked) finalPrompt += ', intricate details, masterpiece, best quality';
  return finalPrompt;
}

async function generateImage() {
  const userPrompt = els.promptInput.value.trim();

  if (!userPrompt) {
    showToast('⚠️ Pehle kuch likho prompt mein!', 'error');
    els.promptInput.focus();
    return;
  }

  if (state.isGenerating) return;

  state.isGenerating = true;
  els.generateBtn.classList.add('loading');
  els.generateBtn.disabled = true;

  // Build URL
  const ratio = RATIOS[state.currentRatio];
  const finalPrompt = buildPrompt(userPrompt);
  const seed = els.seedInput.value || Math.floor(Math.random() * 1000000);

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${ratio.width}&height=${ratio.height}&seed=${seed}&nologo=true&model=flux`;

  // Show placeholder with loading
  els.imagePreview.innerHTML = `
    <div class="preview-placeholder">
      <div class="loader" style="margin: 0 auto;">
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
      </div>
      <h4 style="margin-top: 100px;">AI image generate kar raha hai...</h4>
      <p>10-20 seconds lag sakte hain</p>
    </div>
  `;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    state.currentImage = {
      url: url,
      prompt: userPrompt,
      style: state.currentStyle,
      ratio: state.currentRatio,
      timestamp: new Date().toISOString()
    };

    els.imagePreview.innerHTML = '';
    els.imagePreview.appendChild(img);
    els.previewActions.style.display = 'grid';

    addToRecent(state.currentImage);
    showToast('✅ Image ready! 🎉', 'success');

  } catch (err) {
    els.imagePreview.innerHTML = `
      <div class="preview-placeholder">
        <div class="placeholder-icon">😢</div>
        <h4>Image generate nahi ho saki</h4>
        <p>Internet connection check karo aur dobara try karo</p>
      </div>
    `;
    showToast('❌ Generation failed!', 'error');
  } finally {
    state.isGenerating = false;
    els.generateBtn.classList.remove('loading');
    els.generateBtn.disabled = false;
  }
}

/* ═══════════ RECENT ═══════════ */
function addToRecent(image) {
  state.recent.unshift(image);
  if (state.recent.length > 8) state.recent.pop();
  renderRecent();
}

function renderRecent() {
  if (state.recent.length === 0) {
    els.recentList.innerHTML = `
      <div class="recent-empty">
        <span>📭</span>
        <p>Koi recent image nahi</p>
      </div>
    `;
    return;
  }

  els.recentList.innerHTML = state.recent.map((item, idx) => `
    <div class="recent-item" data-index="${idx}">
      <img class="recent-thumb" src="${item.url}" alt="Recent" loading="lazy">
      <div class="recent-info">
        <div class="recent-prompt">${escapeHtml(item.prompt)}</div>
        <div class="recent-time">${formatTime(new Date(item.timestamp))}</div>
      </div>
    </div>
  `).join('');

  els.recentList.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      const img = state.recent[idx];
      state.currentImage = img;
      els.promptInput.value = img.prompt;

      els.imagePreview.innerHTML = '';
      const imageEl = new Image();
      imageEl.src = img.url;
      els.imagePreview.appendChild(imageEl);
      els.previewActions.style.display = 'grid';

      showToast('📷 Image load ho gayi', 'info');
    });
  });
}

/* ═══════════ GALLERY ═══════════ */
function saveToGallery() {
  if (!state.currentImage) return;

  state.gallery.unshift({
    ...state.currentImage,
    id: Date.now()
  });
  localStorage.setItem('aiVisionGallery', JSON.stringify(state.gallery));
  renderGallery();
  showToast('💾 Gallery mein save ho gayi!', 'success');
}

function renderGallery() {
  if (state.gallery.length === 0) {
    els.galleryGrid.innerHTML = '';
    els.galleryEmpty.classList.add('show');
    return;
  }

  els.galleryEmpty.classList.remove('show');
  els.galleryGrid.innerHTML = state.gallery.map(item => `
    <div class="gallery-item" data-id="${item.id}">
      <img src="${item.url}" alt="AI Generated" loading="lazy">
      <div class="gallery-overlay">
        <div class="gallery-prompt">${escapeHtml(item.prompt)}</div>
        <div class="gallery-actions">
          <button class="gallery-btn download-g" data-id="${item.id}">⬇️</button>
          <button class="gallery-btn delete" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');

  els.galleryGrid.querySelectorAll('.gallery-btn.download-g').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = state.gallery.find(g => g.id == btn.dataset.id);
      if (item) downloadImage(item.url, item.prompt);
    });
  });

  els.galleryGrid.querySelectorAll('.gallery-btn.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.gallery = state.gallery.filter(g => g.id != btn.dataset.id);
      localStorage.setItem('aiVisionGallery', JSON.stringify(state.gallery));
      renderGallery();
      showToast('🗑️ Gallery se delete ho gayi', 'info');
    });
  });
}

/* ═══════════ DOWNLOAD ═══════════ */
async function downloadImage(url, prompt) {
  try {
    showToast('⬇️ Download shuru...', 'info');
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `ai-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    showToast('✅ Download complete!', 'success');
  } catch (err) {
    // Fallback: open in new tab
    window.open(url, '_blank');
    showToast('📂 New tab mein khul gayi', 'info');
  }
}

/* ═══════════ AI CHAT ═══════════ */
const AI_RESPONSES = {
  greetings: [
    'Assalam-o-Alaikum! Kaise ho? 😊',
    'Hello! Kya help chahiye aaj?',
    'Hi there! Main sun raha hoon!'
  ],
  coding: [
    'Coding seekhne ke liye best approach:\n\n1. Basics strong karo (HTML, CSS, JS)\n2. Roz 1 ghanta practice\n3. Projects banao\n4. Documentation padho\n5. Community join karo\n\nKya specific language seekhni hai?',
    'JavaScript seekhne ke liye:\n\n📚 MDN Web Docs (free)\n🎥 FreeCodeCamp YouTube\n💪 LeetCode for practice\n🛠️ Projects banao\n\nConsistency key hai! Roz kam se kam 30 min do.'
  ],
  jokes: [
    '😄 Programmer ki biwi ne poocha: "Bazar se doodh le aao, aur agar anday mile to 6 le aana."\n\nWo 6 doodh le aaya! 😂',
    '😄 Q: Programmer ko neend kyun nahi aati?\nA: Kyunki wo "async" function mein wait kar raha hota hai! 🤣',
    '😄 2 bytes ne ek restaurant mein jaake khana khaya. Bill aaya toh 1 byte ne doosre se poocha: "Tu pay karega?"\n\nDoosra: "Nahi, main sirf 1 byte hoon!" 😂'
  ],
  ai: [
    'AI (Artificial Intelligence) basically machines ko human ki tarah sochne aur seekhne ke qabil banana hai.\n\n🧠 Types:\n• Narrow AI (specific tasks)\n• General AI (human level)\n• Super AI (theoretical)\n\nExamples: ChatGPT, Siri, recommendation systems, self-driving cars.\n\nKya aur detail chahiye?',
    'AI ka simple matlab: computers ko aise program karna ke wo khud seekh sake aur decisions le sake.\n\nReal-world examples:\n📱 Phone ka face unlock\n🎵 Spotify recommendations\n🚗 Tesla autopilot\n🗣️ Voice assistants\n\nYeh sab AI hai!'
  ],
  motivation: [
    '💪 Yaad rakho:\n\n"Kamyabi ek din mein nahi milti, lekin har din ki koshish se zaroor milti hai."\n\nAaj tum jahan ho, kal se behtar ho. Bas rukna nahi! 🚀',
    '🌟 Tumhare andar wo potential hai jo duniya badal sakta hai. Bas khud pe yaqeen rakho aur mushkil waqt mein himmat na haaro.\n\n"Consistency beats talent, every single time." 🔥'
  ],
  love: [
    '❤️ Love ek khoobsurat feeling hai. Yaad rakho:\n\n• Respect pehle\n• Trust sab kuch\n• Communication key hai\n• Ek dusre ko grow karne do\n\nKisi se pyaar hai? Share karo! 😊'
  ],
  default: [
    'Interesting sawal! 🤔 Yeh ek acha topic hai. Kya aap thora aur detail de sakte ho?',
    'Hmm, main samajh raha hoon. Kya aap specific angle pe discuss karna chahenge?',
    'Bilkul! Iske bare mein aur kya jaanna chahte ho?',
    'Good question! Main help kar sakta hoon — thora aur context do.'
  ]
};

function getAIResponse(message) {
  const msg = message.toLowerCase();

  if (msg.match(/hello|hi|salam|assalam|hey|kaise|kya haal/)) {
    return AI_RESPONSES.greetings[Math.floor(Math.random() * AI_RESPONSES.greetings.length)];
  }
  if (msg.match(/code|coding|programming|javascript|python|developer|seekh/)) {
    return AI_RESPONSES.coding[Math.floor(Math.random() * AI_RESPONSES.coding.length)];
  }
  if (msg.match(/joke|funny|mazah|hasao|hasao/)) {
    return AI_RESPONSES.jokes[Math.floor(Math.random() * AI_RESPONSES.jokes.length)];
  }
  if (msg.match(/ai|artificial intelligence|machine learning|neural/)) {
    return AI_RESPONSES.ai[Math.floor(Math.random() * AI_RESPONSES.ai.length)];
  }
  if (msg.match(/motivate|sad|dukhi|himmat|inspire|demotivat/)) {
    return AI_RESPONSES.motivation[Math.floor(Math.random() * AI_RESPONSES.motivation.length)];
  }
  if (msg.match(/love|pyaar|mohabbat|crush|girlfriend|boyfriend/)) {
    return AI_RESPONSES.love[0];
  }

  // Word count based
  const words = msg.split(' ').length;
  if (words < 3) {
    return 'Thora aur detail mein batao, taake main achi tarah samajh sakoon. 😊';
  }

  return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)];
}

function addMessage(text, sender = 'user') {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const msgEl = document.createElement('div');
  msgEl.className = `message ${sender}-message`;

  const avatar = sender === 'user' ? '👤' : '🤖';
  const content = escapeHtml(text).replace(/\n/g, '<br>');

  msgEl.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-content">
      <p>${content}</p>
      <span class="msg-time">${time}</span>
    </div>
  `;

  els.chatMessages.appendChild(msgEl);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function addTypingIndicator() {
  const el = document.createElement('div');
  el.className = 'message ai-message';
  el.id = 'typingIndicator';
  el.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  els.chatMessages.appendChild(el);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('typingIndicator')?.remove();
}

function sendChatMessage() {
  const text = els.chatInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  els.chatInput.value = '';
  els.chatInput.style.height = '48px';

  addTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    const response = getAIResponse(text);
    addMessage(response, 'ai');
  }, 800 + Math.random() * 700);
}

/* ═══════════ INITIALIZATION ═══════════ */
function init() {
  // Particles
  new ParticleSystem(els.particleCanvas);

  // Nav tabs
  els.navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Theme
  els.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    els.themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('aiTheme', isLight ? 'light' : 'dark');
  });

  // Load theme
  if (localStorage.getItem('aiTheme') === 'light') {
    document.body.classList.add('light');
    els.themeToggle.textContent = '☀️';
  }

  // Ratio buttons
  els.ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      els.ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentRatio = btn.dataset.ratio;
    });
  });

  // Style buttons
  els.styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      els.styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentStyle = btn.dataset.style;
    });
  });

  // Prompt char count
  els.promptInput.addEventListener('input', () => {
    const len = els.promptInput.value.length;
    if (len > 500) {
      els.promptInput.value = els.promptInput.value.slice(0, 500);
    }
    els.charCount.textContent = els.promptInput.value.length;
  });

  // Tip chips
  els.tipChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tip = chip.dataset.tip;
      els.promptInput.value = els.promptInput.value
        ? els.promptInput.value + ', ' + tip
        : tip;
      els.charCount.textContent = els.promptInput.value.length;
      els.promptInput.focus();
    });
  });

  // Surprise Me
  els.surpriseBtn.addEventListener('click', () => {
    const prompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    els.promptInput.value = prompt;
    els.charCount.textContent = prompt.length;
    showToast('🎲 Surprise prompt ready!', 'info');
  });

  // Generate
  els.generateBtn.addEventListener('click', generateImage);

  // Preview actions
  els.downloadBtn.addEventListener('click', () => {
    if (state.currentImage) downloadImage(state.currentImage.url, state.currentImage.prompt);
  });

  els.regenerateBtn.addEventListener('click', () => {
    if (els.promptInput.value.trim()) generateImage();
  });

  els.saveGalleryBtn.addEventListener('click', saveToGallery);

  els.shareBtn.addEventListener('click', async () => {
    if (!state.currentImage) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: state.currentImage.prompt,
          url: state.currentImage.url
        });
      } else {
        await navigator.clipboard.writeText(state.currentImage.url);
        showToast('🔗 Link copy ho gaya!', 'success');
      }
    } catch (e) {}
  });

  // Chat
  els.sendBtn.addEventListener('click', sendChatMessage);
  els.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  els.chatInput.addEventListener('input', () => {
    els.chatInput.style.height = '48px';
    els.chatInput.style.height = Math.min(els.chatInput.scrollHeight, 120) + 'px';
  });

  els.suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      els.chatInput.value = chip.textContent;
      sendChatMessage();
    });
  });

  els.clearChatBtn.addEventListener('click', () => {
    if (!confirm('Chat clear karni hai?')) return;
    els.chatMessages.innerHTML = `
      <div class="message ai-message">
        <div class="msg-avatar">🤖</div>
        <div class="msg-content">
          <p>Chat clear ho gayi! Kya naya poochna hai? 😊</p>
          <span class="msg-time">Abhi</span>
        </div>
      </div>
    `;
    showToast('🗑️ Chat cleared', 'info');
  });

  // Gallery
  els.clearGalleryBtn.addEventListener('click', () => {
    if (state.gallery.length === 0) return;
    if (!confirm('Saari images delete karni hain?')) return;
    state.gallery = [];
    localStorage.setItem('aiVisionGallery', '[]');
    renderGallery();
    showToast('🗑️ Gallery clear', 'info');
  });

  // Load gallery
  try {
    state.gallery = JSON.parse(localStorage.getItem('aiVisionGallery') || '[]');
  } catch (e) {
    state.gallery = [];
  }
  renderGallery();
  renderRecent();

  // Welcome
  setTimeout(() => showToast('👋 Welcome to AI Vision Studio!', 'success'), 600);
}

init();