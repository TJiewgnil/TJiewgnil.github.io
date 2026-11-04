// Scroll story: bars grow and the counter ticks up when they come into view; the step rail follows the reader.
// Without JS, or with reduced motion, everything shows its final value at once.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return;

  // 1. step rail: highlight the step in view
  var links = {};
  document.querySelectorAll(".rail a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var railObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].removeAttribute("aria-current"); });
      if (links[e.target.id]) links[e.target.id].setAttribute("aria-current", "step");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".step[id]").forEach(function (s) { railObs.observe(s); });

  if (reduce) return;
  document.documentElement.classList.add("motion");

  // 2. bars grow (only charts that start below the fold; visible ones stay as they are)
  var vh = window.innerHeight;
  var growObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); growObs.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".chart.grow").forEach(function (c) {
    if (c.getBoundingClientRect().top < vh) c.classList.add("in"); else growObs.observe(c);
  });

  // 3. counters tick up from 0
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      var el = e.target, to = Number(el.getAttribute("data-to")), t0 = null, dur = 1200;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-to]").forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    el.textContent = "0";
    countObs.observe(el);
  });
})();
