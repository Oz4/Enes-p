// Subtle scroll reveals (PLAN.md motion rules: 150–250ms, no parallax circus).
// Elements are hidden only when html.js is set (inline gate in Base.astro),
// so the document is fully visible with JS off.

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px' },
);

for (const el of document.querySelectorAll('.reveal')) observer.observe(el);
