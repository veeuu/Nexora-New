// Credit store — localStorage as cache, PostgreSQL as source of truth
// Total: 250 credits, 50 per section

import apiFetch from './apiFetch';

export const TOTAL_CREDITS = 250;
export const SECTION_LIMIT = 50;

const SECTION_LABELS = {
  technographics: 'Technographics',
  renewal: 'Renewal Intelligence',
  intent: 'Intent',
  ntp: 'Next Tech Purchase®',
  buyingGroup: 'Buying Group',
};

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
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, total: TOTAL_CREDITS };
    }
  } catch (_) {}
  return { ...DEFAULT_STATE, bySection: { ...DEFAULT_STATE.bySection } };
};

const saveCredits = (state) => {
  localStorage.setItem('nexoraCredits', JSON.stringify(state));
  window.dispatchEvent(new Event('creditsUpdated'));
};

// Fire a custom event that the UI listens to for showing a styled popup
const showCreditExhaustedPopup = (section) => {
  const label = SECTION_LABELS[section] || section;
  window.dispatchEvent(
    new CustomEvent('creditExhausted', {
      detail: { section, label },
    })
  );
};

// Fetch from backend and always trust server as source of truth
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
  const state = getCredits();
  const sectionUsed = state.bySection[section] ?? 0;
  const sectionRemaining = SECTION_LIMIT - sectionUsed;
  const totalRemaining = state.total - state.used;

  if (totalRemaining <= 0) {
    showCreditExhaustedPopup('total');
    return false;
  }
  if (sectionRemaining <= 0) {
    showCreditExhaustedPopup(section);
    return false;
  }

  // Cap amount to what's actually available (never exceed either limit)
  const actualAmount = Math.min(amount, sectionRemaining, totalRemaining);

  // Optimistic local update
  state.used += actualAmount;
  state.bySection[section] = sectionUsed + actualAmount;
  saveCredits(state);

  // Persist to backend
  try {
    await apiFetch('/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, amount: actualAmount }),
    });
  } catch (_) {}

  return actualAmount; // return how many were actually deducted
};

export const getRemainingTotal = () => {
  const s = getCredits();
  return s.total - s.used;
};

export const getRemainingForSection = (section) => {
  const s = getCredits();
  return SECTION_LIMIT - (s.bySection[section] ?? 0);
};

// How many credits can actually be spent right now for a section (min of both limits)
export const getAvailableForSection = (section) => {
  const s = getCredits();
  const totalRemaining = s.total - s.used;
  const sectionRemaining = SECTION_LIMIT - (s.bySection[section] ?? 0);
  return Math.max(0, Math.min(totalRemaining, sectionRemaining));
};
