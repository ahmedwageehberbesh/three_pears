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

function initFooter() {
  const social = $("#footer-social");
  if (!social) return;
  social.innerHTML = "";
  config.social.forEach((item) => {
    const available = isProvided(item.url);
    const anchor = document.createElement("a");
    anchor.href = available ? item.url : "#";
    anchor.textContent = item.label.charAt(0);
    anchor.setAttribute("aria-label", item.label);
    anchor.title = available ? item.label : `${item.label} — <BUSINESS_TO_PROVIDE>`;
    if (!available) {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        toast(`<BUSINESS_TO_PROVIDE>`);
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
}

boot();
