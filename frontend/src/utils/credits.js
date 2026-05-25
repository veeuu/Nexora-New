// Credit store — localStorage as cache, PostgreSQL as source of truth
// Total: 500 credits, 100 per section

import apiFetch from './apiFetch';

export const TOTAL_CREDITS = 500;
export const SECTION_LIMIT = 100;

const DEFAULT_STATE = {
  total: TOTAL_CREDITS,
  used: 0,
  bySection: {
    technographics: 0,
    renewal: 0,
    intent: 0,
    ntp: 0,
    buyingGroup: 0,
  },
};

export const getCredits = () => {
  try {
    const stored = localStorage.getItem('nexoraCredits');
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return { ...DEFAULT_STATE, bySection: { ...DEFAULT_STATE.bySection } };
};

const saveCredits = (state) => {
  localStorage.setItem('nexoraCredits', JSON.stringify(state));
  window.dispatchEvent(new Event('creditsUpdated'));
};

// Fetch from backend and sync to localStorage
export const syncCreditsFromServer = async () => {
  try {
    const res = await apiFetch('/api/credits');
    if (!res.ok) return;
    const data = await res.json();
    const state = {
      total: TOTAL_CREDITS,
      used: data.used ?? 0,
      bySection: data.bySection ?? DEFAULT_STATE.bySection,
    };
    saveCredits(state);
  } catch (_) {}
};

// Deduct locally + persist to backend
export const deductCredit = async (section, amount = 1) => {
  // Optimistic local update first
  const state = getCredits();
  const sectionUsed = state.bySection[section] ?? 0;

  if (state.used >= state.total) return false;
  if (sectionUsed >= SECTION_LIMIT) return false;

  state.used += amount;
  state.bySection[section] = sectionUsed + amount;
  saveCredits(state);

  // Persist to backend (fire and forget — local state already updated)
  try {
    const res = await apiFetch('/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, amount }),
    });
    if (res.ok) {
      const data = await res.json();
      // Reconcile with server response
      const synced = {
        total: TOTAL_CREDITS,
        used: data.used,
        bySection: data.bySection,
      };
      saveCredits(synced);
    }
  } catch (_) {}

  return true;
};

export const getRemainingTotal = () => {
  const s = getCredits();
  return s.total - s.used;
};

export const getRemainingForSection = (section) => {
  const s = getCredits();
  return SECTION_LIMIT - (s.bySection[section] ?? 0);
};
