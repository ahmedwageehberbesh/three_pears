import { $, $$, toast } from "./lib/dom.js";
import { setLang, getLang, t, applyStaticStrings } from "./data/i18n.js";
import { config, isProvided } from "./data/config.js";
import { initBears, setupWorlds, renderBears, selectBear } from "./features/bears.js";
import { initMenu, renderMenu, refreshFilters } from "./features/menu.js";
import { initProduct } from "./features/product.js";
import { initCart, refreshCart } from "./features/cart.js";
import { initOrder } from "./features/order.js";
import { initQuiz } from "./features/quiz.js";

let data = null;

async function loadMenu() {
  const response = await fetch("./js/data/menu.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`menu.json: ${response.status}`);
  return response.json();
}

function initHeader() {
  const langToggle = $("#lang-toggle");
  const langLabel = $("#lang-label");

  const syncLangUi = () => {
    langLabel.textContent = getLang() === "ar" ? "EN" : "عربي";
    document.title =
      getLang() === "ar"
        ? "الدببة الثلاثة | Three Bears Drinks"
        : "Three Bears Drinks | الدببة الثلاثة";
  };

  langToggle?.addEventListener("click", () => {
    setLang(getLang() === "ar" ? "en" : "ar");
    applyStaticStrings();
    syncLangUi();
    rerender();
  });

  syncLangUi();

  const navToggle = $("#nav-toggle");
  const nav = $("#main-nav");
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });

  const sections = $$("main section[id]");
  const navLinks = $$(".main-nav a");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }
}

const SOCIAL_ICONS = {
  instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.3.06-1.68.07-4.9.07-3.22 0-3.6-.01-4.9-.07-3.25-.15-4.76-1.7-4.91-4.92C2.1 15.58 2.1 15.2 2.1 12s.01-3.58.08-4.85C2.33 3.92 3.84 2.38 7.1 2.22 8.4 2.2 8.78 2.2 12 2.2zm0 3.68a6.12 6.12 0 1 0 0 12.24 6.12 6.12 0 0 0 0-12.24zM12 10.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zm6.4-5.18a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.53 2h3.07a5.7 5.7 0 0 0 2.3 4.03c.95.63 1.8.83 2.6.85v3.1c-1.18-.03-2.42-.39-3.55-1.16a9.7 9.7 0 0 1-1.28-1.04v6.1a6.05 6.05 0 1 1-6.05-6.05c.32 0 .63.02.95.07v3.2a2.86 2.86 0 1 0 2.96 2.85V2z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 21.9v-8h2.7l.4-3.1h-3.1V8.8c0-.9.25-1.5 1.54-1.5h1.66V4.5a22 22 0 0 0-2.42-.12c-2.4 0-4.04 1.46-4.04 4.15v2.27H7.5v3.1h2.72v8h3.28z"/></svg>'
};

function initFooter() {
  const social = $("#footer-social");
  if (!social) return;
  social.innerHTML = "";
  config.social.forEach((item) => {
    const available = isProvided(item.url);
    const anchor = document.createElement("a");
    anchor.href = available ? item.url : "#";
    anchor.innerHTML = SOCIAL_ICONS[item.id] || item.label.charAt(0);
    anchor.setAttribute("aria-label", item.label);
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.title = available ? item.label : `${item.label} — <BUSINESS_TO_PROVIDE>`;
    if (!available) {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        toast(`${item.label} — <BUSINESS_TO_PROVIDE>`);
      });
    }
    social.append(anchor);
  });
}

function rerender() {
  if (!data) return;
  renderBears();
  refreshFilters();
  renderMenu();
  refreshQuiz();
  refreshCart();
  selectBear(document.documentElement.dataset.bear || "qotbi");
}

let refreshQuiz = () => {};
let worldTimer = null;

function startAutoWorld() {
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced || !data || !data.bears?.length) return;

  let index = 0;
  worldTimer = setInterval(() => {
    if (document.hidden) return;
    index = (index + 1) % data.bears.length;
    selectBear(data.bears[index].id, { syncMenu: false });
  }, 4000);
}

function lockWorld() {
  if (worldTimer) {
    clearInterval(worldTimer);
    worldTimer = null;
    window.removeEventListener("world:decided", lockWorld);
  }
}

async function boot() {
  setLang(getLang());
  applyStaticStrings();

  try {
    data = await loadMenu();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="toast" style="position:fixed;top:12px;bottom:auto">⚠ menu.json failed to load — run a local server (npx serve)</div>`
    );
    return;
  }

  initHeader();
  initFooter();

  initBears(data);
  setupWorlds();
  initMenu(data);
  initProduct(data);
  initCart();
  initOrder(data);
  refreshQuiz = initQuiz(data);

  window.addEventListener("world:decided", lockWorld);
  startAutoWorld();
}

boot();
