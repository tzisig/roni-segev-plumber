// Site-wide behavior: header state, mobile menu, scroll reveals, counters, consent, analytics events.
// Adapted from the law firm template in this workspace.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Header ----------
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
requestAnimationFrame(onScroll);
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Mobile menu ----------
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const mobileNav = document.querySelector<HTMLElement>('[data-mobile-nav]');
const setMenu = (open: boolean) => {
  if (!toggle || !mobileNav) return;
  toggle.setAttribute('aria-expanded', String(open));
  mobileNav.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  header?.classList.toggle('is-scrolled', open || window.scrollY > 24);
  toggle.querySelector('.visually-hidden')!.textContent = open ? 'סגירת תפריט' : 'תפריט';
  if (open) mobileNav.querySelector<HTMLElement>('a')?.focus();
};
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll<HTMLElement>('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
}

// ---------- Animated counters ----------
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
const runCounter = (el: HTMLElement) => {
  const target = Number(el.dataset.count);
  if (reduceMotion) { el.textContent = target.toLocaleString('he-IL'); return; }
  const duration = 1600;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * eased).toLocaleString('he-IL');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window && !reduceMotion) {
  counters.forEach((el) => { el.textContent = '0'; });
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { runCounter(entry.target as HTMLElement); cio.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => cio.observe(el));
}

// ---------- Consent + analytics ----------
declare global {
  interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void; }
}
const CONSENT_KEY = 'consent.v1';
const consentBox = document.querySelector<HTMLElement>('[data-consent]');
const ga4 = consentBox?.dataset.ga4 || '';

const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const writeConsent = (v: string) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* storage blocked */ } };

const loadAnalytics = () => {
  if (!ga4 || window.gtag) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ga4);
};

const consent = readConsent();
if (consent === 'all') loadAnalytics();
else if (!consent && consentBox) consentBox.hidden = false;

document.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
  writeConsent('all'); if (consentBox) consentBox.hidden = true; loadAnalytics();
});
document.querySelector('[data-consent-reject]')?.addEventListener('click', () => {
  writeConsent('essential'); if (consentBox) consentBox.hidden = true;
});
document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
  if (consentBox) { consentBox.hidden = false; consentBox.querySelector<HTMLElement>('button')?.focus(); }
});

// Key events: phone and WhatsApp clicks
export const track = (name: string, params: Record<string, unknown> = {}) => {
  window.gtag?.('event', name, params);
};
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
  if (!a) return;
  if (a.href.startsWith('tel:')) track('phone_click', { link_url: a.href });
  else if (a.href.includes('wa.me/')) track('whatsapp_click', { link_url: a.href });
});
