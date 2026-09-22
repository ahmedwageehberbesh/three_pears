import { $, el, formatPrice, toast } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";
import { config, isProvided } from "../data/config.js";
import { getSnapshot } from "../lib/store.js";

let data;
let selectedChannel = "whatsapp";
let lastFocused = null;

export function initOrder(dataset) {
  data = dataset;

  window.addEventListener("order:open", open);

  const modal = $("#order-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) close();
  });
}

function currency() {
  return getLang() === "en" ? config.currency.en : config.currency.ar;
}

function open() {
  const state = getSnapshot();
  if (!state.items.length) {
    toast(t("order.empty"));
    return;
  }

  lastFocused = document.activeElement;
  selectedChannel = isProvided(config.whatsappNumber) ? "whatsapp" : "messenger";

  const root = $("#order-root");
  root.innerHTML = "";
  root.append(buildForm(state));
  $("#order-modal").hidden = false;
  document.body.style.overflow = "hidden";
  $("#order-root input")?.focus();
}

export function close() {
  $("#order-modal").hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
}

function buildForm(state) {
  const form = el("form", { class: "order-form", novalidate: true, onsubmit: submit });

  form.append(
    el("div", { class: "order-summary" }, [
      el("strong", { text: t("order.summary") }),
      ...state.items.map((item) =>
        el("div", { class: "order-summary-row" }, [
          el("span", { text: `${item.qty} × ${localized(item.name)}` }),
          el("span", {
            class: item.unitPrice == null ? "price-todo" : "",
            text: item.unitPrice == null ? "—" : formatPrice(item.unitPrice * item.qty, currency())
          })
        ])
      ),
      el("div", { class: "order-summary-row is-total" }, [
        el("span", { text: t("cart.total") }),
        el("span", {
          class: state.priced ? "" : "price-todo",
          text: state.priced ? formatPrice(state.total, currency()) : "—"
        })
      ]),
      !state.priced ? el("p", { class: "order-warning", text: t("cart.incomplete") }) : null
    ].filter(Boolean))
  );

  const fields = el("div", { class: "order-fields" }, [
    field("order-name", "order.name", "text", true),
    field("order-phone", "order.phone", "tel", true, "01012345678"),
    field("order-address", "order.address", "text", false)
  ]);
  form.append(fields);

  const channels = el("div", { class: "order-channels" }, [
    channelButton("whatsapp", t("order.whatsapp"),
      `<svg viewBox="0 0 24 24" stroke-width="0" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.9a12 12 0 0 0 4.6 4.3c1.7.8 2.4.9 3.2.7.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3z"/></svg>`),
    channelButton("messenger", t("order.messenger"),
      `<svg viewBox="0 0 24 24" stroke-width="0" aria-hidden="true"><path d="M12 2C6.3 2 2 6.2 2 11.7c0 3 1.4 5.6 3.7 7.4v3.7l3.4-1.9c.9.3 1.9.4 2.9.4 5.7 0 10-4.2 10-9.7S17.7 2 12 2zm1 12.6-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.4 5.8z"/></svg>`)
  ]);
  form.append(
    el("div", { class: "field" }, [
      el("span", { class: "options-title", text: t("order.channel") }),
      channels
    ])
  );

  if (!isProvided(config.whatsappNumber) && !isProvided(config.messengerUrl)) {
    form.append(el("p", { class: "order-warning", text: t("order.unavailable") }));
  }

  form.append(
    el("button", { type: "submit", class: "btn-checkout", text: t("order.send") })
  );

  syncChannelAvailability();
  return form;
}

function channelButton(id, label, iconHtml) {
  return el("button", {
    type: "button",
    class: `channel-btn${selectedChannel === id ? " is-selected" : ""}`,
    dataset: { channel: id },
    html: `${iconHtml}<span>${label}</span>`,
    onclick: (e) => {
      selectedChannel = id;
      document.querySelectorAll(".channel-btn").forEach((btn) => {
        btn.classList.toggle("is-selected", btn.dataset.channel === id);
      });
    }
  });
}

function syncChannelAvailability() {
  const wa = document.querySelector('.channel-btn[data-channel="whatsapp"]');
  const ms = document.querySelector('.channel-btn[data-channel="messenger"]');
  if (wa && !isProvided(config.whatsappNumber)) {
    wa.disabled = true;
    wa.title = t("order.unavailable");
    wa.style.opacity = "0.5";
  }
  if (ms && !isProvided(config.messengerUrl)) {
    ms.disabled = true;
    ms.title = t("order.unavailable");
    ms.style.opacity = "0.5";
  }
}

function field(id, labelKey, type, required, placeholder = "") {
  return el("div", { class: "field" }, [
    el("label", { for: id, text: t(labelKey) + (required ? " *" : "") }),
    el("input", {
      id,
      name: id,
      type,
      required: required ? true : null,
      placeholder,
      autocomplete: type === "tel" ? "tel" : "on",
      "aria-describedby": `${id}-error`
    }),
    el("span", { class: "field-error", id: `${id}-error`, hidden: true })
  ]);
}

function setError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(`${inputId}-error`);
  if (!input || !error) return;
  const invalid = !!message;
  error.hidden = !invalid;
  error.textContent = message || "";
  input.setAttribute("aria-invalid", String(invalid));
  input.style.borderColor = invalid ? "var(--danger)" : "";
}

function submit(event) {
  event.preventDefault();

  const name = $("#order-name").value.trim();
  const phone = $("#order-phone").value.trim();
  const address = $("#order-address").value.trim();
  const state = getSnapshot();

  let valid = true;

  setError("order-name", name ? "" : t("order.required"));
  if (!name) valid = false;

  if (!phone) {
    setError("order-phone", t("order.required"));
    valid = false;
  } else if (!config.phonePattern.test(phone.replace(/\s+/g, ""))) {
    setError("order-phone", t("order.invalidPhone"));
    valid = false;
  } else {
    setError("order-phone", "");
  }

  if (!valid) {
    document.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  if (selectedChannel === "whatsapp") {
    sendWhatsApp({ name, phone, address, state });
  } else if (selectedChannel === "messenger") {
    sendMessenger({ name, phone, address, state });
  } else {
    toast(t("order.needChannel"));
  }
}

function buildMessage({ name, phone, address, state }) {
  const lines = [];

  lines.push(`🐻 ${t("order.msgTitle")} — ${localized(config.businessName)}`);
  lines.push("");
  lines.push(`${t("order.msgName")}: ${name}`);
  lines.push(`${t("order.msgPhone")}: ${phone}`);
  if (address) lines.push(`${t("order.msgAddress")}: ${address}`);
  lines.push("");
  lines.push(`${t("order.msgItems")}:`);
  state.items.forEach((item) => {
    const opts = item.options?.length
      ? ` (${item.options.map((opt) => localized(opt.name)).join(", ")})`
      : "";
    const pricePart =
      item.unitPrice == null ? "" : ` — ${formatPrice(item.unitPrice * item.qty, currency())}`;
    lines.push(`• ${item.qty} × ${localized(item.name)}${opts}${pricePart}`);
    if (item.notes) lines.push(`  ✎ ${item.notes}`);
  });
  lines.push("");
  lines.push(
    `${t("order.msgTotal")}: ${
      state.priced ? formatPrice(state.total, currency()) : t("order.msgIncomplete")
    }`
  );
  if (state.orderNotes) {
    lines.push("");
    lines.push(`${t("order.msgNotes")}: ${state.orderNotes}`);
  }
  return lines.join("\n");
}

async function sendWhatsApp(payload) {
  if (!isProvided(config.whatsappNumber)) {
    toast(t("toast.todoConfig"));
    return;
  }
  const message = buildMessage(payload);
  const number = config.whatsappNumber.replace(/[^\d]/g, "");
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
  close();
}

async function sendMessenger(payload) {
  if (!isProvided(config.messengerUrl)) {
    toast(t("toast.todoConfig"));
    return;
  }
  const message = buildMessage(payload);
  try {
    await navigator.clipboard.writeText(message);
    toast(t("order.copied"));
  } catch {
    // clipboard may be unavailable — still open chat
  }
  window.open(config.messengerUrl, "_blank", "noopener");
  close();
}
