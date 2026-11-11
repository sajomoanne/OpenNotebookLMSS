import { onUser, signInWithGoogle, signOutUser } from './firebase.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Accepts a Firestore Timestamp, Date, or ISO string. */
export function formatDate(value) {
  if (!value) return '';
  let d;
  if (typeof value.toDate === 'function') d = value.toDate();
  else if (value instanceof Date) d = value;
  else d = new Date(value);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initTheme() {
  const html = document.documentElement;
  const sunIcon = document.getElementById('iconSun');
  const moonIcon = document.getElementById('iconMoon');
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const apply = (dark) => {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (sunIcon) sunIcon.style.display = dark ? 'block' : 'none';
    if (moonIcon) moonIcon.style.display = dark ? 'none' : 'block';
  };

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved ? saved === 'dark' : prefersDark);

  toggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    apply(!isDark);
  });
}

/**
 * Wires up the shared header auth UI.
 * Expects elements: #signInBtn, #userBox, #userName, #myNotebooksLink, #signOutBtn
 * Any may be absent — missing pieces are skipped.
 */
export function initAuthHeader() {
  const signInBtn = document.getElementById('signInBtn');
  const userBox = document.getElementById('userBox');
  const userName = document.getElementById('userName');
  const signOutBtn = document.getElementById('signOutBtn');

  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      signInBtn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error('Sign-in failed:', err);
        alert('Sign-in failed: ' + (err.message || err));
      } finally {
        signInBtn.disabled = false;
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => signOutUser().catch(console.error));
  }

  onUser((user) => {
    if (user) {
      signInBtn?.classList.add('hidden');
      userBox?.classList.remove('hidden');
      if (userName) userName.textContent = user.displayName || user.email || 'Account';
    } else {
      signInBtn?.classList.remove('hidden');
      userBox?.classList.add('hidden');
    }
  });
}

/**
 * Calls callback(user) once auth state is first known.
 * Returns an unsubscribe function.
 */
export function whenUserKnown(callback) {
  let done = false;
  return onUser((user) => {
    if (done) return;
    done = true;
    callback(user);
  });
}
