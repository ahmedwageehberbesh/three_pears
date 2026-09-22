import { $, el, formatPrice, toast } from "../lib/dom.js";
import { t, localized, getLang } from "../data/i18n.js";
import { config, isProvided } from "../data/config.js";
import { getSnapshot, setOrderNotes, clearCart } from "../lib/store.js";

let data;
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

function toAsciiDigits(value) {
  return String(value || "")
    .replace(/[٠-٩]/g, (c) => c.codePointAt(0) - 0x0660)
    .replace(/[۰-۹]/g, (c) => c.codePointAt(0) - 0x06f0)
    .replace(/[０-９]/g, (c) => c.codePointAt(0) - 0xff10)
    .replace(/[^\d]/g, "");
}

function open() {
  const state = getSnapshot();
  if (!state.items.length) {
    toast(t("order.empty"));
    return;
  }

  lastFocused = document.activeElement;

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
    field("order-phone", "order.phone", "tel", true, ""),
    field("order-area", "order.area", "text", false, ""),
    el("div", { class: "field" }, [
      el("label", { for: "order-notes", text: t("order.formNotes") }),
      el("textarea", {
        id: "order-notes",
        rows: "2",
        placeholder: t("order.formNotesPlaceholder")
      })
    ])
  ]);
  fields.querySelector("#order-notes").value = state.orderNotes || "";
  form.append(fields);

  if (!isProvided(config.whatsappNumber)) {
    form.append(el("p", { class: "order-warning", text: t("order.unavailable") }));
  }

  const preview = el("div", { class: "order-preview" }, [
    el("span", { class: "options-title", text: t("order.preview") }),
    el("p", { class: "order-note", text: t("order.previewHint") }),
    el("pre", { class: "order-preview-box", id: "order-preview-box" })
  ]);

  form.append(
    preview,
    el("button", {
      type: "submit",
      class: "btn-checkout",
      id: "order-submit",
      text: t("order.send")
    })
  );

  form.addEventListener("change", syncPreview);
  form.addEventListener("input", syncPreview);
  syncPreview();
  return form;
}

function currentFormState() {
  const name = $("#order-name")?.value.trim() ?? "";
  const phone = toAsciiDigits($("#order-phone")?.value ?? "");
  const area = $("#order-area")?.value.trim() ?? "";
  const notes = $("#order-notes")?.value.trim() ?? "";
  const state = getSnapshot();
  if (notes !== state.orderNotes) setOrderNotes(notes);
  return { name, phone, area, state: getSnapshot() };
}

function syncPreview() {
  const box = document.getElementById("order-preview-box");
  if (!box) return;
  const { name, phone, area, state } = currentFormState();
  if (!state.items.length || !name || !phone) {
    box.textContent = "";
    return;
  }
  box.textContent = buildMessage({ name, phone, area, state });
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
  const phone = toAsciiDigits($("#order-phone").value);
  const phoneField = $("#order-phone");
  if (phone !== phoneField.value.replace(/[^\d٠-٩۰-۹０-９]/g, "")) {
    phoneField.value = phone;
  }
  const area = $("#order-area").value.trim();
  const notes = $("#order-notes").value.trim();
  if (notes !== getSnapshot().orderNotes) setOrderNotes(notes);
  const state = getSnapshot();

  let valid = true;

  setError("order-name", name ? "" : t("order.required"));
  if (!name) valid = false;

  if (!phone) {
    setError("order-phone", t("order.required"));
    valid = false;
  } else if (!config.phonePattern.test(phone)) {
    setError("order-phone", t("order.invalidPhone"));
    valid = false;
  } else {
    setError("order-phone", "");
  }

  if (!valid) {
    document.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  sendWhatsApp({ name, phone, area, state });
}

function buildMessage({ name, phone, area, state }) {
  const lines = [];

  const head = [`${t("order.msgName")}: ${name}`, `${t("order.msgPhone")}: ${phone}`];
  if (area) head.push(`${t("order.msgArea")}: ${area}`);
  lines.push(head.join(" | "));

  lines.push("");
  state.items.forEach((item) => {
    const opts = item.options?.length
      ? ` (${item.options.map((opt) => localized(opt.name)).join(", ")})`
      : "";
    let line = `${item.qty}× ${localized(item.name)}${opts}`;
    if (item.notes) line += ` (${item.notes})`;
    lines.push(`• ${line}`);
  });
  lines.push("");
  lines.push(
    `${t("order.msgTotal")}: ${
      state.priced ? formatPrice(state.total, currency()) : t("order.msgIncomplete")
    }`
  );
  const allNotes = state.orderNotes?.trim();
  if (allNotes) lines.push(`${t("order.msgNotes")}: ${allNotes}`);
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
  clearCart();
  close();
}
