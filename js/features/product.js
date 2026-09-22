import { $, el, formatPrice, imgFallback, toast } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";
import { addItem } from "../lib/store.js";

let data;
let qty = 1;
let selectedOptionIds = new Set();
let lastFocused = null;

export function initProduct(dataset) {
  data = dataset;

  window.addEventListener("product:open", (e) => open(e.detail));

  const modal = $("#product-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) close();
  });
}

function currency() {
  return getLang() === "en" ? "EGP" : "جنيه";
}

function open(productId) {
  const product = data.products.find((p) => p.id === productId);
  if (!product) return;

  qty = 1;
  selectedOptionIds = new Set();
  lastFocused = document.activeElement;

  const modal = $("#product-modal");
  const panel = $("#product-modal-panel");
  panel.innerHTML = "";
  panel.append(buildDetail(product));
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  panel.querySelector("button, [href], input")?.focus();
}

export function close() {
  const modal = $("#product-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
}

function currentPrice(product) {
  if (product.price == null) return null;
  const extra = product.options
    .filter((opt) => selectedOptionIds.has(opt.id))
    .reduce((sum, opt) => sum + (opt.priceDelta ?? 0), 0);
  return product.price + extra;
}

function buildDetail(product) {
  const price = currentPrice(product);

  const body = el("div", { class: "product-detail-body" }, [
    el("div", { class: "product-detail-head" }, [
      el("h2", { id: "product-modal-title", text: localized(product.name) }),
      el("span", {
        class: `price product-detail-price${price == null ? " price-todo" : ""}`,
        text: price == null ? t("menu.priceMissing") : formatPrice(price, currency())
      }),
      product.placeholder
        ? el("span", { class: "badge badge-todo", style: "margin-inline-start:8px", text: t("menu.todoBadge") })
        : null
    ]),
    el("p", { text: localized(product.description) }),

    product.options?.filter((opt) => opt.active !== false).length
      ? el("div", { class: "options-group" }, [
          el("span", { class: "options-title", text: t("product.options") }),
          ...product.options
            .filter((opt) => opt.active !== false)
            .map((opt) =>
              el("label", { class: "option-item" }, [
                el("span", { class: "option-label" }, [
                  el("input", {
                    type: "checkbox",
                    value: opt.id,
                    onchange: (e) => {
                      if (e.target.checked) selectedOptionIds.add(opt.id);
                      else selectedOptionIds.delete(opt.id);
                      refreshPrice(product);
                    }
                  }),
                  el("span", { text: localized(opt.name) })
                ]),
                el("span", {
                  class: "option-delta",
                  text:
                    opt.priceDelta == null
                      ? t("menu.priceMissing")
                      : opt.priceDelta === 0
                        ? ""
                        : `+${formatPrice(opt.priceDelta, currency())}`
                })
              ])
            )
        ])
      : null,

    el("div", { class: "qty-row" }, [
      el("span", { text: t("product.qty") }),
      el("div", { class: "qty-control" }, [
        el("button", {
          type: "button",
          "aria-label": "−",
          text: "−",
          onclick: () => setQty(product, qty - 1)
        }),
        el("output", { id: "pd-qty", text: String(qty), "aria-live": "polite" }),
        el("button", {
          type: "button",
          "aria-label": "+",
          text: "+",
          onclick: () => setQty(product, qty + 1)
        })
      ])
    ]),

    el("div", { class: "field" }, [
      el("label", { for: "pd-notes", text: t("product.notes") }),
      el("textarea", {
        id: "pd-notes",
        rows: "2",
        placeholder: t("product.notesPlaceholder")
      })
    ]),

    el("div", { class: "product-detail-actions" }, [
      el("button", {
        type: "button",
        class: "btn-add-cart",
        id: "pd-add",
        text: t("product.addToCart"),
        onclick: () => addToCart(product)
      })
    ])
  ]);

  return el("div", { class: "product-detail" }, [
    el("div", { class: "product-detail-media" }, [
      el("img", { src: product.image, alt: localized(product.name), onerror: imgFallback })
    ]),
    body
  ]);
}

function setQty(product, next) {
  qty = Math.max(1, Math.min(99, next));
  const out = $("#pd-qty");
  if (out) out.textContent = String(qty);
}

function refreshPrice(product) {
  const price = currentPrice(product);
  const node = $("#product-modal-panel .product-detail-price");
  if (!node) return;
  node.textContent = price == null ? t("menu.priceMissing") : formatPrice(price, currency());
  node.classList.toggle("price-todo", price == null);
}

function addToCart(product) {
  const selectedOptions = product.options
    ?.filter((opt) => opt.active !== false && selectedOptionIds.has(opt.id))
    .map((opt) => ({ id: opt.id, name: opt.name, priceDelta: opt.priceDelta ?? 0 })) ?? [];

  const notes = $("#pd-notes")?.value.trim() ?? "";

  addItem({ product, qty, selectedOptions, notes });
  toast(t("toast.added"));
  close();
}
