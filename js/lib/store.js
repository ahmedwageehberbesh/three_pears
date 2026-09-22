const STORAGE_KEY = "tb_cart_v1";
const NOTES_KEY = "tb_cart_notes_v1";

const listeners = new Set();

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

let items = read(STORAGE_KEY, []);
let orderNotes = read(NOTES_KEY, "");

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  localStorage.setItem(NOTES_KEY, JSON.stringify(orderNotes));
  emit();
}

function emit() {
  listeners.forEach((fn) => fn(getSnapshot()));
}

function lineId(productId, optionIds) {
  return [productId, ...(optionIds || [])].join("+");
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSnapshot() {
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const priced = items.every((item) => item.unitPrice != null);
  const total = items.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.qty,
    0
  );
  return { items, count, total, priced, orderNotes };
}

export function addItem({ product, qty = 1, selectedOptions = [], notes = "" }) {
  const optionIds = selectedOptions.map((opt) => opt.id);
  const id = lineId(product.id, optionIds);
  const unitPrice =
    product.price == null
      ? null
      : product.price +
        selectedOptions.reduce((sum, opt) => sum + (opt.priceDelta ?? 0), 0);

  const existing = items.find((item) => item.id === id);
  if (existing) {
    existing.qty += qty;
    if (notes) existing.notes = notes;
  } else {
    items.push({
      id,
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice,
      qty,
      options: selectedOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
        priceDelta: opt.priceDelta ?? 0
      })),
      notes,
      placeholder: !!product.placeholder
    });
  }
  persist();
}

export function updateQty(id, qty) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  if (qty <= 0) {
    items = items.filter((entry) => entry.id !== id);
  } else {
    item.qty = qty;
  }
  persist();
}

export function removeItem(id) {
  items = items.filter((entry) => entry.id !== id);
  persist();
}

export function clearCart() {
  items = [];
  orderNotes = "";
  persist();
}

export function setOrderNotes(value) {
  orderNotes = value;
  persist();
}
