// Revealed rows store — localStorage cache + PostgreSQL persistence
import apiFetch from './apiFetch';

const STORAGE_KEY = 'nexoraRevealed';

export const getRevealedLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (_) {
    return {};
  }
};

const saveRevealedLocal = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('revealedUpdated'));
};

// Fetch from server and sync to localStorage
// - If server has data: merge (union) to protect optimistic reveals not yet persisted
// - If server returns empty {}: server is authoritative — clear local (e.g. after admin reset)
export const syncRevealedFromServer = async () => {
  try {
    const res = await apiFetch('/api/revealed');
    if (!res.ok) return null;
    const serverData = await res.json();

    // Check if server has any revealed keys at all
    const serverHasData = Object.values(serverData).some(v => Array.isArray(v) && v.length > 0);

    if (!serverHasData) {
      // Server is empty — treat as authoritative reset, clear local too
      saveRevealedLocal({});
      return {};
    }

    // Server has data — merge with local to protect optimistic reveals
    const localData = getRevealedLocal();
    const merged = {};
    const allSections = new Set([...Object.keys(serverData), ...Object.keys(localData)]);
    allSections.forEach(section => {
      const serverKeys = Array.isArray(serverData[section]) ? serverData[section] : [];
      const localKeys = Array.isArray(localData[section]) ? localData[section] : [];
      merged[section] = [...new Set([...serverKeys, ...localKeys])];
    });
    saveRevealedLocal(merged);
    return merged;
  } catch (_) {
    return null;
  }
};

// Check if a key is revealed for a section
export const isRevealed = (section, key) => {
  const data = getRevealedLocal();
  return Array.isArray(data[section]) && data[section].includes(key);
};

// Mark a key as revealed — optimistic local + persist to server
export const markRevealed = async (section, key) => {
  const data = getRevealedLocal();
  if (!Array.isArray(data[section])) data[section] = [];
  if (!data[section].includes(key)) {
    data[section] = [...data[section], key];
    saveRevealedLocal(data);
  }
  // Persist to backend
  try {
    await apiFetch('/api/revealed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, key }),
    });
  } catch (_) {}
};
