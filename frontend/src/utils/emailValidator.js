// List of blocked free/temp email domains
const BLOCKED_DOMAINS = new Set([
  // Gmail & Google
  'gmail.com', 'googlemail.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'yahoo.es',
  'ymail.com', 'rocketmail.com',
  // Microsoft personal
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.es',
  'outlook.com', 'live.com', 'msn.com', 'passport.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // AOL
  'aol.com', 'aim.com',
  // Other popular free providers
  'protonmail.com', 'proton.me', 'pm.me',
  'zoho.com', 'zohomail.com',
  'mail.com', 'email.com', 'usa.com', 'myself.com',
  'inbox.com', 'fastmail.com', 'fastmail.fm',
  'hushmail.com', 'tutanota.com', 'tutamail.com',
  'gmx.com', 'gmx.net', 'gmx.de', 'gmx.us',
  'web.de', 'freenet.de', 't-online.de',
  'rediffmail.com', 'indiatimes.com',
  'yandex.com', 'yandex.ru', 'yandex.ua',
  'mail.ru', 'bk.ru', 'inbox.ru', 'list.ru',
  'qq.com', '163.com', '126.com', 'sina.com',
  // Temp/disposable email services
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net',
  'throwam.com', 'trashmail.com', 'trashmail.net', 'trashmail.me',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'spam4.me', 'yopmail.com', 'yopmail.fr', 'cool.fr.nf',
  'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  'dispostable.com', 'mailnull.com', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamgourmet.com',
  'maildrop.cc', 'mailnesia.com', 'mailnull.com',
  'spamfree24.org', 'spamfree24.de', 'spamfree24.eu',
  'spamfree24.info', 'spamfree24.net', 'spamfree24.com',
  'spamgob.com', 'spamherelots.com', 'spamhereplease.com',
  'spamhole.com', 'spamify.com', 'spaminator.de',
  'spamkill.info', 'spaml.com', 'spaml.de',
  'spammotel.com', 'spamoff.de', 'spamslicer.com',
  'spamspot.com', 'spamstack.net', 'spamthis.co.uk',
  'spamthisplease.com', 'spamtrail.com', 'spamtroll.net',
  'spamwc.de', 'spamwc.net', 'spamwc.org',
  'discard.email', 'discardmail.com', 'discardmail.de',
  'throwam.com', 'throwaway.email', 'throwam.com',
  'fakeinbox.com', 'fakeinbox.net', 'fakeinbox.org',
  'getairmail.com', 'getairmail.cf', 'getairmail.ga',
  'getairmail.gq', 'getairmail.ml', 'getairmail.tk',
  'mailnew.com', 'mailseal.de', 'mailshell.com',
  'mailsiphon.com', 'mailslapping.com', 'mailslite.com',
  'mailsnare.net', 'mailsou.com', 'mailsucker.net',
  'mailtome.de', 'mailtothis.com', 'mailzilla.com',
  'mailzilla.org', 'makemetheking.com', 'malahov.de',
  'manifestgenerator.com', 'manybrain.com', 'markmurfin.com',
]);

/**
 * Validates if an email is a business/work email
 * Returns { valid: boolean, message: string }
 */
export const validateBusinessEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  const domain = trimmed.split('@')[1];

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: 'Please use your work or business email address'
    };
  }

  return { valid: true, message: '' };
};

export default validateBusinessEmail;
