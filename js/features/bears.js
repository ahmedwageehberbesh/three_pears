import { $, $$, el, escapeHtml, formatPrice, imgFallback } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";

let data;

export function initBears(dataset) {
  data = dataset;
  renderBears();
}

export function renderBears() {
  const grid = $("#bears-grid");
  if (!grid) return;
  grid.innerHTML = "";
  data.bears.forEach((bear) => {
    const card = el(
      "article",
      {
        class: "bear-card",
        dataset: { bearCard: bear.id },
        tabindex: "0",
        role: "button",
        "aria-label": localized(bear.name),
        onclick: () => goToBear(bear),
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToBear(bear);
          }
        }
      },
      [
        el("div", { class: "bear-avatar" }, [
          el("img", { src: bear.heroImage, alt: localized(bear.name), loading: "lazy", onerror: imgFallback })
        ]),
        el("h3", { text: localized(bear.name) }),
        el("p", { class: "bear-tagline", text: localized(bear.tagline) }),
        el("p", { class: "bear-desc", text: localized(bear.description) }),
        el("span", { class: "btn btn-primary", text: t("bears.cta") })
      ]
    );
    grid.append(card);
  });
}

function goToBear(bear) {
  document.documentElement.dataset.bear = bear.theme;
  document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("bear:select", { detail: bear.id }));
}

export function setupWorlds() {
  const switcher = $("#world-switch");
  if (!switcher) return;

  data.bears.forEach((bear, index) => {
    const tab = el(
      "button",
      {
        type: "button",
        class: "world-tab",
        role: "tab",
        id: `world-tab-${bear.id}`,
        "aria-selected": index === 0 ? "true" : "false",
        "aria-controls": "world-panel",
        text: localized(bear.name),
        onclick: () => selectBear(bear.id)
      }
    );
    switcher.append(tab);
  });

  window.addEventListener("bear:select", (e) => selectBear(e.detail));
  selectBear(data.bears[0]?.id);
}

export function selectBear(bearId) {
  const bear = data.bears.find((b) => b.id === bearId) || data.bears[0];
  if (!bear) return;

  document.documentElement.dataset.bear = bear.theme;

  $$(".world-tab").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.id === `world-tab-${bear.id}`));
  });

  const panel = $("#world-panel");
  const drinks = data.products
    .filter((p) => p.active && p.bearId === bear.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  panel.innerHTML = "";
  panel.append(
    el("div", { class: "world-head" }, [
      el("div", { class: "world-anim" }, [
        el("img", { src: bear.heroImage, alt: localized(bear.name), onerror: imgFallback })
      ]),
      el("div", { class: "world-copy" }, [
        el("h3", { text: localized(bear.name) }),
        el("span", { class: "badge", text: localized(bear.tagline) }),
        el("p", { text: localized(bear.description) })
      ])
    ])
  );

  const list = el("div", { class: "world-drinks" });
  if (!drinks.length) {
    list.append(el("p", { text: t("worlds.noDrinks") }));
  } else {
    drinks.forEach((product) => {
      list.append(
        el(
          "button",
          {
            type: "button",
            class: "world-drink-chip",
            onclick: () => window.dispatchEvent(new CustomEvent("product:open", { detail: product.id }))
          },
          [
            el("span", { text: localized(product.name) }),
            el("span", {
              class: `price${product.price == null ? " price-todo" : ""}`,
              text: product.price == null ? t("menu.priceMissing") : formatPrice(product.price, currency())
            })
          ]
        )
      );
    });
  }
  panel.append(list);

  panel.append(
    el("div", { class: "world-cta" }, [
      el("a", {
        class: "btn btn-primary",
        href: "#menu",
        text: t("worlds.viewMenu"),
        onclick: () => window.dispatchEvent(new CustomEvent("menu:filter", { detail: bear.id }))
      })
    ])
  );
}

function currency() {
  return getLang() === "en" ? "EGP" : "جنيه";
}
