export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "dataset") {
      Object.assign(node.dataset, value);
    } else {
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

export function formatPrice(amount, currency) {
  if (amount == null || Number.isNaN(amount)) return null;
  const value = Number(amount);
  const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
  return `${formatted} ${currency}`;
}

export function imgFallback(event) {
  const img = event.target;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  img.src = "assets/images/products/placeholder.svg";
}

export function toast(message, duration = 2600) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  clearTimeout(node._timer);
  node._timer = setTimeout(() => {
    node.hidden = true;
  }, duration);
}
