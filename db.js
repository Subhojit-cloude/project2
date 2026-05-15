/* ══════════════════════════════════════════
   JARVIS DATABASE — IndexedDB Layer
   Stores: sessions, commands, searches
   ══════════════════════════════════════════ */

const DB_NAME    = 'JarvisDB';
const DB_VERSION = 1;
let db = null;

// ── OPEN / INIT DB ───────────────────────────────
function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;

      // Table 1: sessions (user logins)
      if (!database.objectStoreNames.contains('sessions')) {
        const ss = database.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        ss.createIndex('name',      'name',      { unique: false });
        ss.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Table 2: commands (all queries/commands)
      if (!database.objectStoreNames.contains('commands')) {
        const cs = database.createObjectStore('commands', { keyPath: 'id', autoIncrement: true });
        cs.createIndex('sessionId', 'sessionId', { unique: false });
        cs.createIndex('timestamp', 'timestamp', { unique: false });
        cs.createIndex('type',      'type',      { unique: false });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
}

// ── LOG USER SESSION ─────────────────────────────
function logSession(user) {
  return new Promise((resolve, reject) => {
    const tx   = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const session = {
      name:      user.name,
      bio:       user.bio || '',
      location:  user.location || '',
      instagram: user.instagram || '',
      github:    user.github || '',
      timestamp: new Date().toISOString(),
      date:      new Date().toLocaleDateString('en-IN'),
      time:      new Date().toLocaleTimeString('en-IN'),
      userAgent: navigator.userAgent.substring(0, 80),
    };
    const req = store.add(session);
    req.onsuccess = () => {
      resolve(req.result); // returns sessionId
    };
    req.onerror = () => reject(req.error);
  });
}

// ── LOG COMMAND / SEARCH ─────────────────────────
function logCommand(sessionId, text, type, response) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(); return; }
    const tx    = db.transaction('commands', 'readwrite');
    const store = tx.objectStore('commands');
    const cmd = {
      sessionId,
      text:      text.substring(0, 500),
      type,                              // 'voice' | 'text' | 'quick'
      response:  response ? response.substring(0, 500) : '',
      timestamp: new Date().toISOString(),
      date:      new Date().toLocaleDateString('en-IN'),
      time:      new Date().toLocaleTimeString('en-IN'),
    };
    const req = store.add(cmd);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── READ ALL SESSIONS ────────────────────────────
function getAllSessions() {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req   = store.getAll();
    req.onsuccess = () => resolve(req.result.reverse()); // newest first
    req.onerror   = () => reject(req.error);
  });
}

// ── READ ALL COMMANDS ────────────────────────────
function getAllCommands() {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('commands', 'readonly');
    const store = tx.objectStore('commands');
    const req   = store.getAll();
    req.onsuccess = () => resolve(req.result.reverse());
    req.onerror   = () => reject(req.error);
  });
}

// ── GET COMMANDS BY SESSION ──────────────────────
function getCommandsBySession(sessionId) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('commands', 'readonly');
    const store = tx.objectStore('commands');
    const index = store.index('sessionId');
    const req   = index.getAll(sessionId);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── CLEAR ALL DATA ───────────────────────────────
function clearAllData() {
  return new Promise((resolve) => {
    const tx = db.transaction(['sessions','commands'], 'readwrite');
    tx.objectStore('sessions').clear();
    tx.objectStore('commands').clear();
    tx.oncomplete = () => resolve();
  });
}

// ── EXPORT DATA AS JSON ──────────────────────────
async function exportData() {
  const sessions = await getAllSessions();
  const commands = await getAllCommands();
  const blob = new Blob([JSON.stringify({ sessions, commands }, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `jarvis_data_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
