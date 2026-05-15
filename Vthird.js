/* JARVIS — Universal AI Voice Assistant */

// ── DOM ──────────────────────────────────────────
const micButton         = document.getElementById('micButton');
const micIcon           = document.getElementById('micIcon');
const transcriptDisplay = document.getElementById('transcriptDisplay');
const transcriptText    = document.getElementById('transcriptText');
const chatContainer     = document.getElementById('chatContainer');
const statusText        = document.getElementById('statusText');
const statusDot         = document.querySelector('.status-dot');
const greetingBanner    = document.getElementById('greetingBanner');
const clockDisplay      = document.getElementById('clockDisplay');
const jarvisAvatar      = document.getElementById('jarvisAvatar');
const weatherBadge      = document.getElementById('weatherBadge');
const setupOverlay      = document.getElementById('setupOverlay');
const setupSubmitBtn    = document.getElementById('setupSubmitBtn');
const textInputToggle   = document.getElementById('textInputToggle');
const textInputArea     = document.getElementById('textInputArea');
const textInput         = document.getElementById('textInput');
const sendTextBtn       = document.getElementById('sendTextBtn');
const commandsToggle    = document.getElementById('commandsToggle');
const commandsPanel     = document.getElementById('commandsPanel');
const resetBtn          = document.getElementById('resetBtn');

// ── STATE ────────────────────────────────────────
let isListening      = false;
let openedWindows    = [];
let userData         = null;
let currentSessionId = null;
let lastInputType    = 'text'; // 'voice' | 'text' | 'quick'
let isJarvisSpeaking = false;

// ── HUGE SITE DATABASE (name → url) ──────────────
const SITES = {
  // Social
  youtube:'https://youtube.com', instagram:'https://instagram.com',
  twitter:'https://twitter.com', x:'https://twitter.com',
  facebook:'https://facebook.com', linkedin:'https://linkedin.com',
  snapchat:'https://snapchat.com', tiktok:'https://tiktok.com',
  pinterest:'https://pinterest.com', reddit:'https://reddit.com',
  discord:'https://discord.com', telegram:'https://web.telegram.org',
  whatsapp:'https://web.whatsapp.com', quora:'https://quora.com',
  // Search & Productivity
  google:'https://google.com', bing:'https://bing.com',
  yahoo:'https://yahoo.com', duckduckgo:'https://duckduckgo.com',
  gmail:'https://mail.google.com', outlook:'https://outlook.live.com',
  'google drive':'https://drive.google.com', gdrive:'https://drive.google.com',
  'google docs':'https://docs.google.com', docs:'https://docs.google.com',
  'google sheets':'https://sheets.google.com', sheets:'https://sheets.google.com',
  'google slides':'https://slides.google.com', slides:'https://slides.google.com',
  'google meet':'https://meet.google.com', meet:'https://meet.google.com',
  'google calendar':'https://calendar.google.com', calendar:'https://calendar.google.com',
  'google maps':'https://maps.google.com', maps:'https://maps.google.com',
  'google translate':'https://translate.google.com', translate:'https://translate.google.com',
  'google photos':'https://photos.google.com',
  notion:'https://notion.so', trello:'https://trello.com',
  slack:'https://slack.com', zoom:'https://zoom.us',
  // AI Models
  chatgpt:'https://chat.openai.com', openai:'https://chat.openai.com',
  gemini:'https://gemini.google.com', bard:'https://gemini.google.com',
  grok:'https://grok.com', copilot:'https://copilot.microsoft.com',
  'microsoft copilot':'https://copilot.microsoft.com',
  claude:'https://claude.ai', anthropic:'https://claude.ai',
  perplexity:'https://perplexity.ai', mistral:'https://chat.mistral.ai',
  'hugging face':'https://huggingface.co', huggingface:'https://huggingface.co',
  'midjourney':'https://midjourney.com', dalle:'https://labs.openai.com',
  // Entertainment
  netflix:'https://netflix.com', spotify:'https://open.spotify.com',
  'amazon prime':'https://primevideo.com', primevideo:'https://primevideo.com',
  hotstar:'https://hotstar.com', disneyplus:'https://disneyplus.com',
  'disney plus':'https://disneyplus.com', hulu:'https://hulu.com',
  twitch:'https://twitch.tv', soundcloud:'https://soundcloud.com',
  jiosaavn:'https://jiosaavn.com', gaana:'https://gaana.com',
  // Shopping
  amazon:'https://amazon.in', flipkart:'https://flipkart.com',
  myntra:'https://myntra.com', meesho:'https://meesho.com',
  ebay:'https://ebay.com', aliexpress:'https://aliexpress.com',
  // Dev / Tech
  github:'https://github.com', gitlab:'https://gitlab.com',
  stackoverflow:'https://stackoverflow.com', codepen:'https://codepen.io',
  'stack overflow':'https://stackoverflow.com', replit:'https://replit.com',
  vercel:'https://vercel.com', netlify:'https://netlify.com',
  // News & Info
  wikipedia:'https://wikipedia.org', wiki:'https://wikipedia.org',
  bbc:'https://bbc.com', cnn:'https://cnn.com',
  ndtv:'https://ndtv.com', 'times of india':'https://timesofindia.com',
  // Finance
  'google finance':'https://finance.google.com',
  zerodha:'https://zerodha.com', groww:'https://groww.in',
  // Other
  canva:'https://canva.com', figma:'https://figma.com',
  leetcode:'https://leetcode.com', hackerrank:'https://hackerrank.com',
  coursera:'https://coursera.org', udemy:'https://udemy.com',
  'khan academy':'https://khanacademy.org',
};

// ── HUD GRID DECOR ───────────────────────────────
// (Grid is handled by CSS now, we can add dynamic logic here if needed)

// ── CLOCK ────────────────────────────────────────
setInterval(() => {
  const n = new Date();
  clockDisplay.textContent = [n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');
}, 1000);

// ── GREET ────────────────────────────────────────
function wishUser() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const msg = `${g}${userData?.name ? ', ' + userData.name : ''}! All systems operational.`;
  greetingBanner.textContent = msg;
  greetingBanner.style.display = 'inline-block';
  speak(msg);
}

// ── SETUP ────────────────────────────────────────
async function loadUserData() {
  await initDB(); // Initialize IndexedDB first
  const raw = localStorage.getItem('jarvis_v2_setup');
  if (raw) {
    userData = JSON.parse(raw);
    setupOverlay.style.display = 'none';
    // Log returning user session
    currentSessionId = await logSession(userData);
    wishUser();
    fetchWeather(userData.location);
  } else {
    setupOverlay.style.display = 'flex';
  }
}

setupSubmitBtn.addEventListener('click', async () => {
  const name      = document.getElementById('setup-name').value.trim();
  const bio       = document.getElementById('setup-bio').value.trim();
  const location  = document.getElementById('setup-location').value.trim();
  const instagram = document.getElementById('setup-instagram').value.trim();
  const github    = document.getElementById('setup-github').value.trim();
  if (!name || !location) { showNotif('Please fill Name and City!','error'); return; }
  userData = { name, bio, location, instagram, github };
  localStorage.setItem('jarvis_v2_setup', JSON.stringify(userData));
  setupOverlay.style.display = 'none';
  // Log new user session to DB
  currentSessionId = await logSession(userData);
  wishUser();
  fetchWeather(location);
  const welcomeMsg = `Hello ${name}! I am JARVIS. Speak or type anything — I understand natural English. Try: "Open YouTube", "Play a song", or ask me anything!`;
  addMsg('jarvis', welcomeMsg);
  logCommand(currentSessionId, `[SETUP] New user: ${name}`, 'system', welcomeMsg);
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reset JARVIS setup?')) { localStorage.clear(); location.reload(); }
});

// ── WEATHER ──────────────────────────────────────
async function fetchWeather(city) {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`);
    if (!r.ok) return;
    const d = await r.json();
    const t = (d.main.temp - 273.15).toFixed(1);
    weatherBadge.innerHTML = `<i class="fas fa-cloud-sun"></i> ${t}°C · ${d.weather[0].description}`;
  } catch(e) {}
}

// ── SPEAK (Indian English Accent) ────────────────
function getIndianVoice() {
  const voices = speechSynthesis.getVoices();
  // Priority order: Indian English voices
  return (
    voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
    voices.find(v => v.lang === 'en-IN') ||
    voices.find(v => v.name.toLowerCase().includes('ravi')) ||
    voices.find(v => v.name.toLowerCase().includes('heera')) ||
    voices.find(v => v.name.toLowerCase().includes('india')) ||
    voices.find(v => v.lang === 'hi-IN') ||
    voices.find(v => v.lang.startsWith('en-IN')) ||
    voices.find(v => v.lang === 'en-GB') ||
    null
  );
}

function speak(text) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang   = 'en-IN';   // Indian English locale
  u.volume = 1;
  u.rate   = 0.92;      // slightly slower = clearer Indian rhythm
  u.pitch  = 1.05;

  const voice = getIndianVoice();
  if (voice) u.voice = voice;

  u.onstart = () => { 
    isJarvisSpeaking = true;
    try { recognition?.stop(); } catch(e) {}
    jarvisAvatar.classList.add('active'); 
  };
  u.onend = () => { 
    isJarvisSpeaking = false;
    jarvisAvatar.classList.remove('active'); 
    if (isListening) { try { recognition?.start(); } catch(e) {} }
  };
  speechSynthesis.speak(u);
}

// Load voices and re-apply when they become available
speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();

// ── CHAT UI ──────────────────────────────────────
function addMsg(sender, text) {
  const w = chatContainer.querySelector('.chat-welcome');
  if (w) w.remove();
  const time = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  const d = document.createElement('div');
  d.className = `chat-msg ${sender}`;
  d.innerHTML = `<div class="msg-avatar">${sender==='user'?'U':'J'}</div><div><div class="msg-bubble">${text}</div><div class="msg-time">${time}</div></div>`;
  chatContainer.appendChild(d);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
  const d = document.createElement('div');
  d.className='chat-msg jarvis typing-indicator'; d.id='typingIndicator';
  d.innerHTML=`<div class="msg-avatar">J</div><div class="msg-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  chatContainer.appendChild(d);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
function removeTyping() { const e=document.getElementById('typingIndicator'); if(e) e.remove(); }

function showNotif(msg, type='info') {
  const n = document.createElement('div');
  n.style.cssText = `position:fixed;top:70px;right:20px;z-index:9000;background:${type==='error'?'rgba(255,56,96,0.15)':'rgba(0,212,255,0.1)'};border:1px solid ${type==='error'?'#ff3860':'rgba(0,212,255,0.4)'};color:${type==='error'?'#ff3860':'#00d4ff'};padding:12px 20px;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:.9rem;backdrop-filter:blur(10px);max-width:300px;`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(()=>n.remove(),3500);
}

// ── OPEN SITE ────────────────────────────────────
function openSite(url, label) {
  const w = window.open(url, '_blank');
  openedWindows.push(w);
  const msg = `Opening ${label}.`;
  addMsg('jarvis', msg); speak(msg);
}

// Expose for quick-action buttons
function quickOpen(key) {
  const labels = {
    youtube:'YouTube',google:'Google',instagram:'Instagram',github:'GitHub',
    chatgpt:'ChatGPT',gemini:'Google Gemini',grok:'Grok AI',
    perplexity:'Perplexity',copilot:'Microsoft Copilot',
    twitter:'Twitter',linkedin:'LinkedIn',spotify:'Spotify',
  };
  if (SITES[key]) openSite(SITES[key], labels[key] || key);
}
window.quickOpen = quickOpen;

// ── AI CHATBOT ───────────────────────────────────
async function askAI(question, inputType='text') {
  showTyping();
  try {
    const sys = `You are JARVIS, an advanced AI assistant like Iron Man's JARVIS. Be helpful, witty, formal but friendly. Address user by name. NEVER call the user "sir". User's name: ${userData?.name||'User'}. Today: ${new Date().toDateString()}.`;
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(sys + '\n\nUser: ' + question + '\nJARVIS:')}`);
    let ans = (await res.text()).trim().replace(/^JARVIS:\s*/i,'');
    removeTyping();
    addMsg('jarvis', ans);
    speak(ans);
    logCommand(currentSessionId, question, 'ai', ans);
  } catch(e) {
    removeTyping();
    const fb = "I apologize, my AI module is temporarily offline. Please check your internet.";
    addMsg('jarvis', fb); speak(fb);
    logCommand(currentSessionId, question, 'ai', fb);
  }
}

// ── SMART INTENT DETECTION ───────────────────────
function detectSiteIntent(t) {
  // Check "open X", "launch X", "start X", "go to X", "take me to X", "show me X"
  const openPatterns = [
    /(?:open|launch|start|go to|take me to|navigate to|show me|load|visit|bring up)\s+(.+)/i,
    /(?:can you open|please open|i want to open|i need to open)\s+(.+)/i,
  ];
  for (const pat of openPatterns) {
    const m = t.match(pat);
    if (m) {
      const raw = m[1].trim().replace(/[?.!,]$/,'').toLowerCase();
      // Try exact match first
      if (SITES[raw]) return { url: SITES[raw], label: raw };
      // Try partial match
      for (const [key, url] of Object.entries(SITES)) {
        if (raw.includes(key) || key.includes(raw)) return { url, label: key };
      }
    }
  }
  // Direct name mention without "open" — check if entire text IS a site name
  const clean = t.replace(/[?.!,]/g,'').toLowerCase().trim();
  if (SITES[clean]) return { url: SITES[clean], label: clean };
  return null;
}

function detectSearchIntent(t) {
  const m = t.match(/(?:search(?:\s+for)?|look up|find|google)\s+(.+)/i) ||
            t.match(/(?:please search|can you search)\s+(?:for\s+)?(.+)/i);
  if (m) return m[1].trim().replace(/[?.!,]$/,'');
  return null;
}

function detectPlayIntent(t) {
  const m = t.match(/(?:play|play me|i want to listen to|put on|give me)\s+(.+)/i) ||
            t.match(/(?:search youtube for|find on youtube)\s+(.+)/i);
  if (m) return m[1].trim().replace(/[?.!,]$/,'');
  return null;
}

function detectMyProfileIntent(t) {
  if (/my\s+(?:insta|instagram)\s*(?:profile)?/i.test(t)) return 'instagram';
  if (/my\s+(?:github|git hub)\s*(?:profile)?/i.test(t)) return 'github';
  return null;
}

// ── MAIN COMMAND PROCESSOR ───────────────────────
async function processCommand(raw) {
  const text = raw.trim();
  if (!text) return;
  const t = text.toLowerCase();

  addMsg('user', text);
  setStatus('PROCESSING...', false);
  // Determine input type for logging
  const inputType = lastInputType;

  // 1. SYSTEM COMMANDS
  if (/(?:hey|hello|hi|activate|wake up)\s+jarvis/i.test(t)) {
    const r = `At your service, ${userData?.name||'User'}!`;
    addMsg('jarvis',r); speak(r);
    logCommand(currentSessionId, text, inputType, r); return;
  }
  if (/(?:shut down|stop|goodbye|bye|sleep)\s+jarvis/i.test(t) || t==='goodbye' || t==='bye') {
    const r = `Goodbye ${userData?.name||'User'}. Have a great day!`;
    addMsg('jarvis',r); speak(r);
    logCommand(currentSessionId, text, inputType, r); stopListening(); return;
  }
  if (/clear\s+(?:chat|history|screen|all)/i.test(t)) {
    chatContainer.innerHTML='<div class="chat-welcome"><p>Chat cleared. Say anything to JARVIS!</p></div>';
    speak("Chat cleared.");
    logCommand(currentSessionId, text, inputType, 'Chat cleared'); return;
  }
  if (/close\s+(?:all\s+)?(?:tabs|windows|browsers?)/i.test(t)) {
    openedWindows.forEach(w=>{try{w.close()}catch(e){}});
    openedWindows=[];
    const r="All tabs closed."; addMsg('jarvis',r); speak(r);
    logCommand(currentSessionId, text, inputType, r); return;
  }

  // 2. MY PROFILE
  const profile = detectMyProfileIntent(t);
  if (profile === 'instagram' && userData?.instagram) {
    openSite(`https://instagram.com/${userData.instagram.replace('@','')}`, 'your Instagram profile');
    logCommand(currentSessionId, text, inputType, 'Opened Instagram profile'); return;
  }
  if (profile === 'github' && userData?.github) {
    openSite(`https://github.com/${userData.github}`, 'your GitHub profile');
    logCommand(currentSessionId, text, inputType, 'Opened GitHub profile'); return;
  }

  // 3. OPEN ANY SITE/APP
  const siteIntent = detectSiteIntent(t);
  if (siteIntent) {
    openSite(siteIntent.url, siteIntent.label);
    logCommand(currentSessionId, text, 'open', `Opened ${siteIntent.label}`); return;
  }

  // 4. SEARCH
  const searchQuery = detectSearchIntent(t);
  if (searchQuery) {
    const w = window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    openedWindows.push(w);
    const r=`Searching for "${searchQuery}".`; addMsg('jarvis',r); speak(r);
    logCommand(currentSessionId, text, 'search', r); return;
  }

  // 5. PLAY / YOUTUBE
  const playQuery = detectPlayIntent(t);
  if (playQuery) {
    const w = window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(playQuery)}`, '_blank');
    openedWindows.push(w);
    const r=`Playing "${playQuery}" on YouTube.`; addMsg('jarvis',r); speak(r);
    logCommand(currentSessionId, text, 'play', r); return;
  }

  // 6. TIME
  if (/(?:time|clock|what time|current time)/i.test(t) && !/good time/i.test(t)) {
    const r=`The time is ${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}.`;
    addMsg('jarvis',r); speak(r); return;
  }

  // 7. DATE
  if (/(?:date|today|what day|day is it)/i.test(t) && !/update/i.test(t)) {
    const r=`Today is ${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}.`;
    addMsg('jarvis',r); speak(r); return;
  }

  // 8. WEATHER
  if (/weather|temperature|forecast|how hot|how cold/i.test(t)) {
    const city = userData?.location || 'Delhi';
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`);
      const d = await res.json();
      const temp=(d.main.temp-273.15).toFixed(1);
      const feel=(d.main.feels_like-273.15).toFixed(1);
      const r=`In ${city} it's ${d.weather[0].description}, ${temp}°C, feels like ${feel}°C.`;
      addMsg('jarvis',r); speak(r);
    } catch(e) { addMsg('jarvis','Weather data unavailable.'); }
    return;
  }

  // 9. MATH
  const mathM = t.match(/(?:calculate|compute|what(?:'s|\s+is)\s+)?([\d\s\+\-\*\/\.\(\)^%]+)(?:\s*=\s*\?)?$/);
  if (mathM && /[\d\+\-\*\/]/.test(mathM[1]) && mathM[1].trim().length > 1) {
    try {
      const result = Function('"use strict";return (' + mathM[1] + ')')();
      if (!isNaN(result)) { const r=`The answer is ${result}.`; addMsg('jarvis',r); speak(r); return; }
    } catch(e) {}
  }

  // 10. JOKES
  if (/joke|funny|laugh|humor/i.test(t)) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Debugging is like being a detective in a crime movie where you are also the murderer.",
      "There are only 10 types of people: those who understand binary, and those who don't.",
      "I told my AI to fix my code. Now it thinks it's the developer.",
      "Why don't scientists trust atoms? Because they make up everything.",
    ];
    const r = jokes[Math.floor(Math.random()*jokes.length)];
    addMsg('jarvis',r); speak(r); return;
  }

  // 11. HOW ARE YOU
  if (/how are you|are you ok|you alright|you fine/i.test(t)) {
    const r="All systems fully operational. I am functioning at 100% efficiency. How may I assist you?";
    addMsg('jarvis',r); speak(r); return;
  }

  // 12. WHO AM I
  if (/who am i|my name|about me|my profile|my info/i.test(t)) {
    const r=userData?`You are ${userData.name}.${userData.bio?' '+userData.bio+'.':''}`:
      "Setup not complete. Please restart and configure JARVIS.";
    addMsg('jarvis',r); speak(r); return;
  }

  // 13. COMMANDS / HELP
  if (/(?:commands|help|what can you do|capabilities|features|show yours? commands?)/i.test(t)) {
    commandsPanel.style.display='grid';
    const r="Accessing command protocols. Here is the full list."; addMsg('jarvis',r); speak(r); return;
  }

  // 14. AI FALLBACK — Everything else
  await askAI(text, inputType);
}

// ── VOICE RECOGNITION ────────────────────────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SR) {
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    micButton.classList.add('listening');
    micIcon.className = 'fas fa-stop';
    transcriptDisplay.classList.add('active');
    transcriptText.textContent = 'Listening... speak now';
    setStatus('LISTENING', true);
  };

  recognition.onresult = (e) => {
    let interim='', final='';
    for (let i=e.resultIndex;i<e.results.length;i++) {
      const txt=e.results[i][0].transcript;
      if (e.results[i].isFinal) final+=txt; else interim+=txt;
    }
    transcriptText.textContent = final||interim||'Listening...';
    if (final) processCommand(final.trim());
  };

  recognition.onerror = (e) => {
    if (e.error==='not-allowed') showNotif('Microphone access denied!','error');
    stopListening();
  };

  recognition.onend = () => {
    if (isListening && !isJarvisSpeaking) {
      try { recognition.start(); } catch(e) {}
    }
  };

} else {
  micButton.style.opacity='0.4';
  showNotif('Use Chrome for voice features','error');
}

function startListening() { try { recognition?.start(); } catch(e){} }

function stopListening() {
  isListening = false;
  try { recognition?.stop(); } catch(e) {}
  micButton.classList.remove('listening');
  micIcon.className = 'fas fa-microphone';
  transcriptDisplay.classList.remove('active');
  transcriptText.textContent = 'Click mic or type anything...';
  setStatus('SYSTEM ONLINE', false);
}

micButton.addEventListener('click', () => {
  if (isListening) { stopListening(); }
  else { lastInputType = 'voice'; startListening(); }
});

function setStatus(t, l) {
  statusText.textContent = t;
  statusDot.className = `status-dot ${l?'listening':'online'}`;
}

// ── TEXT INPUT ───────────────────────────────────
textInputToggle.addEventListener('click', () => {
  const hidden = textInputArea.style.display==='none';
  textInputArea.style.display = hidden?'flex':'none';
  if (hidden) textInput.focus();
});

function sendText() {
  const v = textInput.value.trim();
  if (!v) return;
  textInput.value='';
  lastInputType = 'text';
  processCommand(v);
}
sendTextBtn.addEventListener('click', sendText);
textInput.addEventListener('keydown', e => { if(e.key==='Enter') sendText(); });

// ── COMMANDS PANEL ───────────────────────────────
commandsToggle.addEventListener('click', () => commandsPanel.style.display='block');

// ── INIT ─────────────────────────────────────────
loadUserData();
