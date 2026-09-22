import { $, $$, el, formatPrice, imgFallback, escapeHtml } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";

let data;
let activeFilter = "all";

export function initMenu(dataset) {
  data = dataset;
  renderFilters();
  renderMenu();

  window.addEventListener("menu:filter", (e) => {
    activeFilter = e.detail || "all";
    syncFilterChips();
    renderMenu();
  });
}

export function refreshFilters() {
  renderFilters();
}

function renderFilters() {
  const bar = $("#menu-filters");
  if (!bar) return;
  bar.innerHTML = "";

  const chips = [{ id: "all", label: t("menu.all") }, ...data.bears.map((b) => ({ id: b.id, label: localized(b.name) }))];

  chips.forEach((chip) => {
    bar.append(
      el(
        "button",
        {
          type: "button",
          class: "filter-chip",
          dataset: chip.id === "all" ? {} : { bear: chip.id },
          "aria-pressed": String(chip.id === activeFilter),
          text: chip.label,
          onclick: () => {
            activeFilter = chip.id;
            syncFilterChips();
            renderMenu();
          }
        },
        []
      )
    );
  });
}

function syncFilterChips() {
  $$("#menu-filters .filter-chip").forEach((chip, i) => {
    const isAll = i === 0;
    const id = isAll ? "all" : chip.dataset.bear;
    chip.setAttribute("aria-pressed", String(id === activeFilter));
  });
}

function currency() {
  return getLang() === "en" ? "EGP" : "جنيه";
}

export function renderMenu() {
  const grid = $("#menu-grid");
  const empty = $("#menu-empty");
  if (!grid) return;

  const products = data.products
    .filter((p) => p.active)
    .filter((p) => activeFilter === "all" || p.bearId === activeFilter)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  grid.innerHTML = "";
  empty.hidden = products.length > 0;

  products.forEach((product) => {
    const bear = data.bears.find((b) => b.id === product.bearId);
    const priceMissing = product.price == null;

    grid.append(
      el("article", { class: "product-card", dataset: { productId: product.id } }, [
        el("div", { class: "product-body" }, [
          el("h3", {
            class: "product-name",
            text: localized(product.name),
            onclick: () => openProduct(product)
          }),
          el("p", { class: "product-desc", text: localized(product.description) })
        ]),
        el(
          "div",
          {
            class: "product-media",
            role: "button",
            tabindex: "0",
            "aria-label": localized(product.name),
            onclick: () => openProduct(product),
            onkeydown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProduct(product);
              }
            }
          },
          [
            el("img", { src: product.image, alt: localized(product.name), loading: "lazy", onerror: imgFallback }),
            product.placeholder
              ? el("span", { class: "badge badge-todo", text: t("menu.todoBadge") })
              : bear
                ? el("span", { class: "badge", text: localized(bear.name) })
                : null
          ]
        ),
        el("div", { class: "product-foot" }, [
          el("span", {
            class: `price${priceMissing ? " price-todo" : ""}`,
            text: priceMissing ? t("menu.priceMissing") : formatPrice(product.price, currency())
          }),
          el("button", {
            type: "button",
            class: "btn-add",
            text: t("menu.add"),
            onclick: () => openProduct(product)
          })
        ])
      ])
    );
  });
}

function openProduct(product) {
  window.dispatchEvent(new CustomEvent("product:open", { detail: product.id }));
}
