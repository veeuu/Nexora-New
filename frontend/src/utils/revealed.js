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

// Fetch from server and sync to localStorage — returns the data
export const syncRevealedFromServer = async () => {
  try {
    const res = await apiFetch('/api/revealed');
    if (!res.ok) return null;
    const data = await res.json();
    saveRevealedLocal(data);
    return data;
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
