// Tech-stack filter and the growing bar chart. Without JS every project shows, with final values.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-tech]"));
  var row = document.querySelector(".chiprow");
  var status = document.querySelector(".status");
  var labels = JSON.parse(document.getElementById("tech-labels").textContent);
  var allLabel = row.getAttribute("data-all");
  var fmt = status.getAttribute("data-format"); // e.g. "Showing {n} of {t}"

  // count projects per tech, keep the order of the labels list
  var counts = {};
  cards.forEach(function (c) { c.getAttribute("data-tech").split(" ").forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });

  function chip(key, text, n) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "fchip"; b.setAttribute("data-key", key);
    b.setAttribute("aria-pressed", key === "all" ? "true" : "false");
    b.innerHTML = text + ' <span class="n">' + n + "</span>";
    b.addEventListener("click", function () { apply(key); });
    return b;
  }
  row.appendChild(chip("all", allLabel, cards.length));
  Object.keys(labels).forEach(function (k) { if (counts[k]) row.appendChild(chip(k, labels[k], counts[k])); });

  function apply(key, keepHash) {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = key === "all" || (" " + c.getAttribute("data-tech") + " ").indexOf(" " + key + " ") >= 0;
      c.hidden = !ok; if (ok) shown++;
      c.querySelectorAll(".tech").forEach(function (t) { t.classList.toggle("on", key !== "all" && t.getAttribute("data-k") === key); });
    });
    row.querySelectorAll(".fchip").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-key") === key ? "true" : "false"); });
    status.textContent = fmt.replace("{n}", shown).replace("{t}", cards.length);
    if (keepHash) return;
    try { if (key === "all") history.replaceState(null, "", location.pathname); else history.replaceState(null, "", "#" + key); } catch (e) { /* ignore */ }
  }
  // #<tech> opens a filtered view; any other hash (#rag, #driveagent ...) is a card anchor, so leave it
  var start = (location.hash || "").slice(1);
  if (counts[start]) apply(start); else apply("all", true);

  // bar chart grows when it comes into view
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("motion");
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll(".grow").forEach(function (g) {
    if (g.getBoundingClientRect().top < window.innerHeight) requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.add("in"); }); });
    else obs.observe(g);
  });
})();
