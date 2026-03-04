/* Portfolio site — data-driven single page
   Edit data.json to update content.
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  data: null,
  activeTags: new Set(),
  matchMode: "any", // "any" | "all"
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function safeUrl(u) {
  if (!u) return "";
  try {
    const url = new URL(u, window.location.href);
    return url.href;
  } catch {
    return "";
  }
}

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function setTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const icon = $("#themeToggle .icon");
  if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";
  $("#themeToggle")?.setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    setTheme(stored);
    return;
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function setupThemeToggle() {
  $("#themeToggle")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

function setSeoFromData(data) {
  if (!data?.seo) return;
  if (data.seo.title) document.title = data.seo.title;

  const setMeta = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute("content", value);
  };

  setMeta('meta[name="description"]', data.seo.description);
  setMeta('meta[name="keywords"]', (data.seo.keywords || []).join(", "));

  setMeta('meta[property="og:title"]', data.seo.title);
  setMeta('meta[property="og:description"]', data.seo.description);
  // og:image left as-is by default (you can add ./og-image.png)
}

function renderSocialRow(targetId, social, email) {
  const root = document.getElementById(targetId);
  if (!root) return;
  root.innerHTML = "";

  const items = [];
  for (const [label, url] of Object.entries(social || {})) {
    if (!url) continue;
    items.push({ label, url });
  }
  // Add email quick link
  if (email) items.unshift({ label: "Email", url: `mailto:${email}` });

  const iconMap = {
    "Email": "✉",
    "LinkedIn": "in",
    "GitHub": "⌘",
    "Hugging Face": "🤗",
  };

  items.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.url.startsWith("mailto:") ? item.url : safeUrl(item.url);

    a.target = item.url.startsWith("mailto:") ? "_self" : "_blank";
    if (a.target === "_blank") a.rel = "noreferrer";
    const dot = create("span", "dot");
    const label = create("span", "", item.label);
    const icon = create("span", "badge", iconMap[item.label] || "↗");
    icon.style.textTransform = "none";
    icon.style.letterSpacing = "0";
    icon.style.fontWeight = "900";
    a.append(dot, label, icon);
    root.appendChild(a);
  });
}

/*function renderMetaPills(data) {
  const row = $("#metaRow");
  if (!row) return;
  row.innerHTML = "";

  const location = create("span", "pill", `📍 ${data.location}`);
  const email = create("a", "pill", `✉ ${data.email}`);
  email.href = `mailto:${data.email}`;

  row.append(location, email);
}*/

function renderStats(data) {
  const root = $("#stats");
  if (!root) return;
  root.innerHTML = "";

  const projectsCount = (data.projects || []).length;
  const researchCount = (data.research || []).length;

  const uniq = new Set();
  (data.projects || []).forEach(p => (p.tech || []).forEach(t => uniq.add(t)));
  const uniqCount = uniq.size;

  const stats = [
    { k: projectsCount, l: "Projects" },
    { k: researchCount, l: "Research" },
    { k: uniqCount, l: "Tech tags" },
  ];

  stats.forEach(s => {
    const box = create("div", "stat");
    const k = create("div", "k", String(s.k));
    const l = create("div", "l", s.l);
    box.append(k, l);
    root.appendChild(box);
  });
}

function renderSnapshot(data) {
  const root = $("#snapshot");
  if (!root) return;
  root.innerHTML = "";

  // ✅ Use data.json -> snapshot
  if (Array.isArray(data.snapshot) && data.snapshot.length) {
    data.snapshot.forEach((item) => {
      const label = (item?.label || "").trim();
      const value = (item?.value || "").trim();
      if (!label && !value) return;

      const text = label && value ? `${label}: ${value}` : (value || label);
      root.appendChild(create("li", "", text));
    });
    return;
  }

  // ⛑️ Fallback if snapshot is missing
  root.appendChild(create("li", "", "Add a snapshot[] section in data.json"));
}



function renderFocusChips(data) {
  const root = $("#focusChips");
  if (!root) return;
  root.innerHTML = "";

  const picks = (Array.isArray(data.focus) && data.focus.length)
    ? data.focus
    : [];

  picks.forEach((p) => {
    if (!p) return;
    root.appendChild(create("span", "chip", String(p)));
  });
}



function renderAbout(data) {
  setText("aboutSummary", data.summary);
}

function renderSkills(data) {
  const root = $("#skillsGrid");
  if (!root) return;
  root.innerHTML = "";

  const skills = data.skills || {};
  Object.entries(skills).forEach(([category, items]) => {
    const card = create("div", "card skill-block");
    const h = create("h3", "", category);
    const list = create("div", "skill-list");
    (items || []).forEach((s) => list.appendChild(create("span", "skill", s)));
    card.append(h, list);
    root.appendChild(card);
  });
}

function tagFrequencies(projects) {
  const freq = new Map();
  (projects || []).forEach(p => {
    (p.tech || []).forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
  });
  return freq;
}

function renderTagChips(data) {
  const root = $("#tagChips");
  if (!root) return;
  root.innerHTML = "";

  const freq = tagFrequencies(data.projects || []);
  const tags = Array.from(freq.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .map(([t]) => t);

  tags.forEach((tag) => {
    const chip = create("button", "chip", tag);
    chip.type = "button";
    chip.addEventListener("click", () => {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      chip.classList.toggle("active");
      renderProjects();
    });
    root.appendChild(chip);
  });
}

function projectMatches(p, query, tags, matchMode) {
  const hay = [
    p.title, p.subtitle, p.description,
    ...(p.tech || []),
    ...(p.category || []),
    ...(p.highlights || [])
  ].join(" ").toLowerCase();

  if (query && !hay.includes(query)) return false;

  if (!tags.length) return true;

  const tech = new Set((p.tech || []).map(x => x.toLowerCase()));
  const check = (t) => tech.has(t.toLowerCase());

  if (matchMode === "all") return tags.every(check);
  return tags.some(check);
}

function renderProjects() {
  const data = state.data;
  const root = $("#projectsGrid");
  if (!data || !root) return;
  root.innerHTML = "";

  const query = ($("#projectSearch")?.value || "").trim().toLowerCase();
  const tags = Array.from(state.activeTags);

  const matches = (data.projects || []).filter(p => projectMatches(p, query, tags, state.matchMode));

  if (!matches.length) {
    const empty = create("div", "card");
    empty.innerHTML = `<h3 style="margin:0 0 8px;">No matches</h3><p class="muted" style="margin:0;">Try clearing filters or searching a different keyword.</p>`;
    root.appendChild(empty);
    return;
  }

  matches.forEach((p) => {
    const card = create("article", "card project");

    const head = create("div", "project-head");
    const left = create("div");
    const title = create("h3", "project-title", p.title);
    const sub = create("div", "muted small", p.subtitle || "");
    if (!p.subtitle) sub.style.display = "none";
    left.append(title, sub);

    const meta = create("div", "project-meta");
    meta.appendChild(create("span", "badge", p.when || ""));
    head.append(left, meta);

    const desc = create("p", "", p.description || "");

    const bullets = create("ul", "bullets");
    (p.highlights || []).slice(0, 3).forEach(h => bullets.appendChild(create("li", "", h)));

    const tech = create("div", "project-tech");
    (p.tech || []).slice(0, 12).forEach(t => tech.appendChild(create("span", "skill", t)));

    const links = create("div", "project-links");
    const demo = safeUrl(p.links?.Demo);
    const src = safeUrl(p.links?.Source);

    if (demo) {
      const a = create("a", "btn small primary", "Live demo");
      a.href = demo; a.target = "_blank"; a.rel = "noreferrer";
      links.appendChild(a);
    }
    if (src) {
      // Style Source same as Live demo for consistent CTA emphasis
      const a = create("a", "btn small primary", "Source");
      a.href = src; a.target = "_blank"; a.rel = "noreferrer";
      links.appendChild(a);
    }

    card.append(head, desc, bullets, tech);
    if (links.childNodes.length) card.appendChild(links);

    root.appendChild(card);
  });
}

function renderResearch(data) {
  const root = $("#researchGrid");
  if (!root) return;
  root.innerHTML = "";

  (data.research || []).forEach((r) => {
    const card = create("article", "card project");

    const head = create("div", "project-head");
    const left = create("div");
    left.appendChild(create("h3", "project-title", r.title));
    left.appendChild(create("div", "muted small", r.status || ""));
    const meta = create("div", "project-meta");
    meta.appendChild(create("span", "badge", r.when || ""));
    head.append(left, meta);

    const bullets = create("ul", "bullets");
    (r.highlights || []).forEach(h => bullets.appendChild(create("li", "", h)));

    const tags = create("div", "project-tech");
    (r.tags || []).forEach(t => tags.appendChild(create("span", "skill", t)));

    const links = create("div", "project-links");
    const url = safeUrl(r.link);
    if (url) {
      const a = create("a", "btn small primary", "Open link");
      a.href = url; a.target = "_blank"; a.rel = "noreferrer";
      links.appendChild(a);
    }

    card.append(head, bullets, tags);
    if (links.childNodes.length) card.appendChild(links);

    root.appendChild(card);
  });
}

function renderEducation(data) {
  const root = $("#educationTimeline");
  if (!root) return;
  root.innerHTML = "";

  (data.education || []).forEach((e) => {
    const row = create("div", "card timeline-item");

    const time = create("div", "time", e.dates || "");
    const content = create("div", "content");
    content.appendChild(create("h3", "", e.degree || ""));
    const p = create("p", "", `${e.school || ""}${e.location ? " — " + e.location : ""}`);
    content.appendChild(p);

    row.append(time, content);
    root.appendChild(row);
  });
}

function renderAchievements(data) {
  const root = $("#achievementGrid");
  if (!root) return;
  root.innerHTML = "";

  (data.achievements || []).forEach((a) => {
    const card = create("div", "card achievement");
    card.appendChild(create("h3", "", a.title || ""));
    card.appendChild(create("p", "", a.detail || ""));
    root.appendChild(card);
  });
}

function renderPositions(data) {
  const root = $("#positionsList");
  if (!root) return;
  root.innerHTML = "";

  (data.positions || []).forEach((p) => {
    const box = create("div", "card");
    box.style.boxShadow = "none";
    box.style.padding = "12px";
    box.appendChild(create("h3", "", p.title || ""));
    const d = create("p", "muted", p.detail || "");
    d.style.margin = "8px 0 0";
    box.appendChild(d);
    root.appendChild(box);
  });
}

function setupFilters(data) {
  const search = $("#projectSearch");
  search?.addEventListener("input", () => renderProjects());

  $("#clearFilters")?.addEventListener("click", () => {
    state.activeTags.clear();
    $$("#tagChips .chip").forEach(c => c.classList.remove("active"));
    if (search) search.value = "";
    renderProjects();
  });

  const toggle = $("#toggleMatch");
  toggle?.addEventListener("click", () => {
    state.matchMode = state.matchMode === "any" ? "all" : "any";
    toggle.textContent = `Match: ${state.matchMode === "any" ? "Any" : "All"}`;
    toggle.setAttribute("aria-pressed", state.matchMode === "all" ? "true" : "false");
    renderProjects();
  });
}

function setupReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(e => e.classList.add("reveal-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("reveal-visible");
    });
  }, { threshold: 0.14 });
  els.forEach(e => io.observe(e));
}

function setupScrollSpy() {
  const navLinks = $$(".nav a").map(a => ({ a, id: a.getAttribute("href")?.slice(1) })).filter(x => x.id);
  const sections = navLinks.map(x => document.getElementById(x.id)).filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    // Pick the most visible section
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach(x => x.a.classList.toggle("active", visible.target.id === x.id));
  }, { rootMargin: "-25% 0px -65% 0px", threshold: [0.15, 0.35, 0.55] });

  sections.forEach(s => io.observe(s));
}

function setupToTop() {
  const btn = $("#toTop");
  if (!btn) return;

  const onScroll = () => {
    const show = window.scrollY > 700;
    btn.classList.toggle("show", show);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupCopyEmail(email) {
  const btn = $("#copyEmail");
  if (!btn || !navigator.clipboard) return;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      btn.textContent = "✓";
      setTimeout(() => (btn.textContent = "⧉"), 900);
    } catch {
      // ignore
    }
  });
}

function hydrate(data) {
  setSeoFromData(data);

  setText("logoMark", data.initials || "VR");
  setText("logoText", (data.name || "Vivek").split(" ")[0]);

  setText("headline", data.headline);
  setText("name", data.name);
  setText("summary", data.summary);
  setText("footerName", (data.name || "Vivek").split(" ")[0]);

  setText("year", String(new Date().getFullYear()));

  //renderMetaPills(data);
  renderSocialRow("socialLinks", data.social, data.email);
  renderSocialRow("socialLinksBottom", data.social, data.email);

  renderStats(data);
  renderSnapshot(data);
  renderFocusChips(data);
  renderAbout(data);
  renderSkills(data);

  renderTagChips(data);
  renderProjects();

  renderResearch(data);
  renderEducation(data);
  renderAchievements(data);
  renderPositions(data);

  // Contact section
  $("#emailLink")?.setAttribute("href", `mailto:${data.email}`);
  setText("emailLink", data.email);
  $("#phoneLink")?.setAttribute("href", `tel:${data.phone.replace(/[^\d+]/g, "")}`);
  setText("phoneLink", data.phone);
  setText("locationText", data.location);

  setupCopyEmail(data.email);

  // Resume button
  const resumeBtn = $("#resumeBtn");
  if (resumeBtn) {
    const href = safeUrl(data.resumeUrl || "./resume.pdf");
    resumeBtn.href = href || "./resume.pdf";
  }

  // Rotating role text
  setupRoleRotator(data.roles || []);
}

function setupRoleRotator(roles) {
  const el = $("#roleRotator");
  if (!el || !roles.length) return;

  let i = 0;
  el.textContent = roles[i];

  setInterval(() => {
    i = (i + 1) % roles.length;
    el.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 200, easing: "ease-out" })
      .finished
      .catch(() => {})
      .finally(() => {
        el.textContent = roles[i];
        el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 260, easing: "ease-out" });
      });
  }, 2600);
}

async function init() {
  initTheme();
  setupThemeToggle();
  setupReveal();
  setupScrollSpy();
  setupToTop();

  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    const data = await res.json();
    state.data = data;
    hydrate(data);
    setupFilters(data);
  } catch (err) {
    console.error(err);
    // Fail gracefully
    setText("name", "Unable to load data.json");
    setText("summary", "Check that data.json exists in the same folder as index.html.");
  }
}

document.addEventListener("DOMContentLoaded", init);
