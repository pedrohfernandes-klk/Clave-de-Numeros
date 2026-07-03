
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: .12 });
reveals.forEach(el => io.observe(el));
const form = document.querySelector('[data-demo-form]');
const notice = document.querySelector('.notice');
if (form && notice) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    notice.classList.add('show');
  });
}
