import { $, el, formatPrice, imgFallback } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";
import { subscribe, getSnapshot, updateQty, removeItem, setOrderNotes } from "../lib/store.js";

let lastFocused = null;

export function initCart() {
  $("#cart-open")?.addEventListener("click", open);
  $("#cart-bar")?.addEventListener("click", open);

  const drawer = $("#cart-drawer");
  drawer?.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && !drawer.hidden) close();
  });

  subscribe(render);
  render(getSnapshot());
}

function currency() {
  return getLang() === "en" ? "EGP" : "جنيه";
}

export function open() {
  lastFocused = document.activeElement;
  $("#cart-drawer").hidden = false;
  document.body.style.overflow = "hidden";
  $("#cart-drawer .icon-btn")?.focus();
  render(getSnapshot());
}

export function close() {
  $("#cart-drawer").hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
}

export function refreshCart() {
  render(getSnapshot());
}

function render(state) {
  renderCount(state);
  renderBar(state);
  if (!$("#cart-drawer").hidden) renderDrawer(state);
}

function renderCount(state) {
  const badge = $("#cart-count");
  if (!badge) return;
  badge.hidden = state.count === 0;
  badge.textContent = String(state.count);
}

function renderBar(state) {
  const bar = $("#cart-bar");
  if (!bar) return;
  bar.hidden = state.count === 0;
  $("#cart-bar-count").textContent = String(state.count);
  $("#cart-bar-total").textContent = state.priced
    ? formatPrice(state.total, currency())
    : t("menu.priceMissing");
}

function renderDrawer(state) {
  const body = $("#cart-body");
  const foot = $("#cart-foot");
  body.innerHTML = "";
  foot.innerHTML = "";

  if (!state.items.length) {
    body.append(
      el("div", { class: "cart-empty" }, [
        el("span", { class: "cart-empty-icon", text: "🧺" }),
        el("strong", { text: t("cart.empty") }),
        el("p", { text: t("cart.emptyHint") }),
        el("button", {
          type: "button",
          class: "btn btn-primary",
          text: t("cart.browse"),
          onclick: () => {
            close();
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
          }
        })
      ])
    );
    return;
  }

  const list = el("div", { class: "cart-items" });
  state.items.forEach((item) => {
    const optionText = item.options?.length
      ? item.options.map((opt) => localized(opt.name)).join("، ")
      : "";

    list.append(
      el("article", { class: "cart-item" }, [
        el("img", { class: "cart-item-img", src: item.image, alt: localized(item.name), onerror: imgFallback }),
        el("div", { class: "cart-item-info" }, [
          el("h3", { text: localized(item.name) }),
          optionText ? el("p", { class: "cart-item-meta", text: optionText }) : null,
          item.notes ? el("p", { class: "cart-item-meta", text: `✎ ${item.notes}` }) : null,
          el("button", {
            type: "button",
            class: "cart-remove",
            text: t("cart.remove"),
            onclick: () => removeItem(item.id)
          })
        ]),
        el("div", { class: "cart-item-side" }, [
          el("span", {
            class: `price${item.unitPrice == null ? " price-todo" : ""}`,
            text:
              item.unitPrice == null
                ? t("menu.priceMissing")
                : formatPrice(item.unitPrice * item.qty, currency())
          }),
          el("div", { class: "cart-qty" }, [
            el("button", {
              type: "button",
              "aria-label": "−",
              text: "−",
              onclick: () => updateQty(item.id, item.qty - 1)
            }),
            el("output", { text: String(item.qty) }),
            el("button", {
              type: "button",
              "aria-label": "+",
              text: "+",
              onclick: () => updateQty(item.id, item.qty + 1)
            })
          ])
        ])
      ])
    );
  });
  body.append(list);

  const notesField = el("div", { class: "field" }, [
    el("label", { for: "cart-notes", text: t("cart.orderNote") }),
    el("textarea", {
      id: "cart-notes",
      rows: "2",
      placeholder: t("cart.orderNotePlaceholder"),
      oninput: (e) => setOrderNotes(e.target.value)
    })
  ]);
  notesField.querySelector("textarea").value = state.orderNotes || "";

  foot.append(
    notesField,
    el("div", { class: "cart-totals" }, [
      el("div", { class: "cart-totals-row" }, [
        el("span", { text: t("cart.subtotal") }),
        el("span", {
          class: state.priced ? "" : "price-todo",
          text: state.priced ? formatPrice(state.total, currency()) : "—"
        })
      ]),
      el("div", { class: "cart-totals-row is-total" }, [
        el("span", { text: t("cart.total") }),
        el("span", {
          class: state.priced ? "" : "price-todo",
          text: state.priced ? formatPrice(state.total, currency()) : "—"
        })
      ])
    ]),
    !state.priced ? el("p", { class: "cart-warn", text: t("cart.incomplete") }) : null,
    el("button", {
      type: "button",
      class: "btn-checkout",
      text: t("cart.checkout"),
      onclick: () => {
        close();
        window.dispatchEvent(new CustomEvent("order:open"));
      }
    })
  );
}
