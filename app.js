const root = document.documentElement;
root.classList.add('motion-enabled');

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = isOpen;
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const progress = document.querySelector('.scroll-progress');
let scrollScheduled = false;
function updateProgress() {
  const range = root.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (range > 0 ? window.scrollY / range : 0) + ')';
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { requestAnimationFrame(updateProgress); scrollScheduled = true; }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

const looks = [...document.querySelectorAll('.look')];
const lookDialog = document.querySelector('#look-dialog');
const lookImage = lookDialog.querySelector('figure img');
const lookTitle = lookDialog.querySelector('figcaption span');
const lookCount = lookDialog.querySelector('figcaption small');
let currentLook = 0;
let lookReturnFocus = null;
function showLook(index) {
  currentLook = (index + looks.length) % looks.length;
  const card = looks[currentLook];
  const image = card.querySelector('img');
  lookImage.src = image.src;
  lookImage.alt = image.alt;
  lookTitle.textContent = card.querySelector('b').textContent;
  lookCount.textContent = String(currentLook + 1).padStart(2, '0') + ' / ' + String(looks.length).padStart(2, '0');
}
looks.forEach((card, index) => card.addEventListener('click', () => {
  lookReturnFocus = card;
  showLook(index);
  lookDialog.showModal();
}));
lookDialog.querySelector('.look-close').addEventListener('click', () => lookDialog.close());
lookDialog.querySelector('.look-prev').addEventListener('click', () => showLook(currentLook - 1));
lookDialog.querySelector('.look-next').addEventListener('click', () => showLook(currentLook + 1));
lookDialog.addEventListener('click', event => { if (event.target === lookDialog) lookDialog.close(); });
lookDialog.addEventListener('close', () => { if (lookReturnFocus) lookReturnFocus.focus(); });
document.addEventListener('keydown', event => {
  if (!lookDialog.open) return;
  if (event.key === 'ArrowLeft') showLook(currentLook - 1);
  if (event.key === 'ArrowRight') showLook(currentLook + 1);
});
if ('IntersectionObserver' in window) {
  const lookObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      lookObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  looks.forEach((card, index) => {
    card.style.transitionDelay = Math.min(index % 4, 3) * 70 + 'ms';
    card.classList.add('look-ready');
    lookObserver.observe(card);
  });
}

const dialog = document.querySelector('#booking-dialog');
const serviceChoice = document.querySelector('#service-choice');
const message = document.querySelector('#booking-message');
const status = document.querySelector('#copy-status');
let returnFocus = null;
function draftMessage() {
  message.value = 'Hi Rabie! I’d like to request a home visit in Évora for ' + serviceChoice.value.toLowerCase() + '. My area is [your neighborhood] and my preferred day/time is [your preferred day/time]. Could you confirm the price and details? Thank you!';
  status.textContent = 'No message is sent automatically.';
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  closeMenu();
  serviceChoice.value = button.dataset.service || 'Help choosing a look';
  draftMessage();
  dialog.showModal();
}));
serviceChoice.addEventListener('change', draftMessage);
message.addEventListener('input', () => { status.textContent = 'No message is sent automatically.'; });
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  const target = returnFocus && returnFocus.getClientRects().length ? returnFocus : menuButton;
  target.focus();
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = 'Message copied. Open Instagram and paste it into a message to Rabie.';
  } catch {
    message.focus();
    message.select();
    status.textContent = 'Select and copy the message, then paste it into Instagram.';
  }
});
