const PRODUCTS = [
  { id: "meetha-paan", name: "Calcutta meetha paan", description: "The classic, wrapped fresh to order", category: "Paan", price: 40, icon: "🌿", popular: 98 },
  { id: "chocolate-paan", name: "Chocolate paan", description: "A little familiar, a little unexpected", category: "Paan", price: 60, icon: "🍃", popular: 92 },
  { id: "fire-paan", name: "Fire paan", description: "A fiery finish for the adventurous", category: "Paan", price: 80, icon: "✨", popular: 87 },
  { id: "royal-mukhwas", name: "Royal mukhwas", description: "A fragrant, colourful after-meal mix · 100 g", category: "Mukhwas", price: 120, icon: "🌸", popular: 96 },
  { id: "saunf-mix", name: "Sweet saunf mix", description: "A refreshing little handful · 100 g", category: "Mukhwas", price: 70, icon: "🌼", popular: 83 },
  { id: "rose-cooler", name: "Rose cooler", description: "Chilled, floral and made for slow sips", category: "Drinks", price: 90, icon: "🥤", popular: 78 },
  { id: "jaljeera", name: "Fresh jaljeera", description: "A bright, tangy house favourite", category: "Drinks", price: 60, icon: "🍋", popular: 80 },
  { id: "wedding-counter", name: "Wedding paan counter", description: "A fresh paan experience for your guests", category: "Catering", price: 5000, icon: "🎉", popular: 100 }
];
const CONFIG = { upiId: "8287966106@upi", shopName: "Shyam Pan Corner", whatsappNumber: "918287966106", webhookUrl: "" };
const CART_KEY = "shyam-pan-corner-cart";
const money = amount => "₹" + Number(amount).toLocaleString("en-IN");
let cart = loadCart();
let activeCategory = "All";
let searchTerm = "";
let sortBy = "featured";
const $ = selector => document.querySelector(selector);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    return Object.fromEntries(Object.entries(saved).filter(([id, qty]) => PRODUCTS.some(product => product.id === id) && Number.isInteger(qty) && qty > 0));
  } catch { return {}; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartQuantity() { return Object.values(cart).reduce((sum, qty) => sum + qty, 0); }
function cartTotal() { return PRODUCTS.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0); }
function addToCart(id) { cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart(); renderProducts(); }
function changeQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(); renderCart(); renderProducts();
  if (!$("#checkout-view").hidden) renderCheckout();
}
function renderProducts() {
  let items = PRODUCTS.filter(product => (activeCategory === "All" || product.category === activeCategory) && (product.name + " " + product.description).toLowerCase().includes(searchTerm));
  if (sortBy === "price-low") items.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") items.sort((a, b) => b.price - a.price);
  if (sortBy === "popular") items.sort((a, b) => b.popular - a.popular);
  $("#product-grid").innerHTML = items.map(product =>
    '<article class="product-card" data-category="' + product.category + '">' +
    '<div class="product-art"><span class="product-category">' + product.category + '</span><span class="product-symbol" aria-hidden="true">' + product.icon + '</span><button class="quick-add" data-add="' + product.id + '" aria-label="Add ' + product.name + ' to bag">+</button></div>' +
    '<div class="product-details"><div><div class="product-name">' + product.name + '</div><div class="product-description">' + product.description + '</div></div><div class="product-price">' + money(product.price) + '</div></div></article>'
  ).join("");
  $("#empty-state").hidden = items.length !== 0;
}
function renderCart() {
  const count = cartQuantity();
  $("#cart-count").textContent = count;
  $("#bag-count-label").textContent = count ? "(" + count + ")" : "";
  $("#cart-subtotal").textContent = money(cartTotal());
  $("#checkout-trigger").disabled = count === 0;
  const items = PRODUCTS.filter(product => cart[product.id]);
  $("#cart-lines").innerHTML = items.length ? items.map(product =>
    '<div class="cart-line"><div><div class="cart-line-title">' + product.name + '</div><div class="cart-line-sub">' + money(product.price) + ' each</div><div class="quantity-control"><button data-qty="' + product.id + '" data-delta="-1" aria-label="Remove one ' + product.name + '">−</button><span>' + cart[product.id] + '</span><button data-qty="' + product.id + '" data-delta="1" aria-label="Add one ' + product.name + '">+</button></div></div><div class="cart-line-price">' + money(product.price * cart[product.id]) + '</div></div>'
  ).join("") : '<div class="empty-cart">Your bag is waiting for something lovely.</div>';
}
function openCart() {
  $("#scrim").hidden = false;
  requestAnimationFrame(() => $("#scrim").classList.add("open"));
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  $("#close-cart").focus();
}
function closeCart() {
  $("#scrim").classList.remove("open");
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { if (!$("#cart-drawer").classList.contains("open")) $("#scrim").hidden = true; }, 250);
}
function makeUpiLink() {
  return "upi://pay?pa=" + encodeURIComponent(CONFIG.upiId) + "&pn=" + encodeURIComponent(CONFIG.shopName) + "&am=" + cartTotal().toFixed(2) + "&cu=INR";
}
function updateFulfillment() {
  const delivery = $("input[name='fulfillment']:checked").value === "delivery";
  $("#delivery-details").hidden = !delivery;
  $("#delivery-address").required = delivery;
  $("#within-radius").required = delivery;
  $("#customer-phone").required = delivery;
  document.querySelectorAll(".fulfillment-choice").forEach(label => label.classList.toggle("selected", label.querySelector("input").checked));
}
function renderCheckout() {
  const lines = PRODUCTS.filter(product => cart[product.id]);
  $("#checkout-items").innerHTML = lines.map(product =>
    '<div class="checkout-line"><span>' + product.name + ' <span>× ' + cart[product.id] + '</span></span><strong>' + money(product.price * cart[product.id]) + '</strong></div>'
  ).join("");
  $("#checkout-total").textContent = money(cartTotal());
  const qr = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qr.searchParams.set("size", "260x260");
  qr.searchParams.set("data", makeUpiLink());
  $("#payment-qr").src = qr.toString();
}
function showCheckout() {
  closeCart();
  renderCheckout();
  $("#checkout-view").hidden = false;
  document.body.classList.add("no-scroll");
  window.scrollTo(0, 0);
}
function hideCheckout() {
  $("#checkout-view").hidden = true;
  document.body.classList.remove("no-scroll");
  window.scrollTo(0, 0);
}
function buildOrder() {
  const items = PRODUCTS.filter(product => cart[product.id]).map(product => ({ name: product.name, quantity: cart[product.id], unit_price: product.price, subtotal: product.price * cart[product.id] }));
  const fulfillment = $("input[name='fulfillment']:checked").value;
  return { name: $("#customer-name").value.trim(), phone: $("#customer-phone").value.trim(), fulfillment, address: fulfillment === "delivery" ? $("#delivery-address").value.trim() : "", items, total: cartTotal(), currency: "INR", created_at: new Date().toISOString() };
}
function sendOrderQuietly(order) {
  if (!CONFIG.webhookUrl) return;
  fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order), keepalive: true }).catch(() => {});
}
$("#product-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});
$("#cart-lines").addEventListener("click", event => {
  const button = event.target.closest("[data-qty]");
  if (button) changeQuantity(button.dataset.qty, Number(button.dataset.delta));
});
document.querySelectorAll(".filter-chip").forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderProducts();
}));
$("#search").addEventListener("input", event => { searchTerm = event.target.value.trim().toLowerCase(); renderProducts(); });
$("#sort").addEventListener("change", event => { sortBy = event.target.value; renderProducts(); });
$("#cart-trigger").addEventListener("click", openCart);
$("#close-cart").addEventListener("click", closeCart);
$("#scrim").addEventListener("click", closeCart);
$("#checkout-trigger").addEventListener("click", showCheckout);
$("#back-to-shop").addEventListener("click", hideCheckout);
document.querySelectorAll("input[name='fulfillment']").forEach(input => input.addEventListener("change", updateFulfillment));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeCart(); if (!$("#checkout-view").hidden) hideCheckout(); }
});
$("#whatsapp-confirm").addEventListener("click", () => {
  if (!cartQuantity()) return;
  if (!$("#delivery-details").hidden) {
    for (const field of [$("#delivery-address"), $("#within-radius"), $("#customer-phone")]) {
      if (!field.reportValidity()) return;
    }
  }
  const order = buildOrder();
  const lines = order.items.map(item => "• " + item.name + " × " + item.quantity + " — " + money(item.subtotal));
  const fulfilmentLines = order.fulfillment === "delivery" ? ["Delivery within 2 km", "Address: " + order.address, "Delivery charge: please confirm"] : ["Counter pickup"];
  const message = ["Hello Shyam Pan Corner! I'd like to confirm this order:", "", ...lines, "", "Total: " + money(order.total), ...fulfilmentLines, order.name ? "Name: " + order.name : "", order.phone ? "WhatsApp: " + order.phone : "", "Placed: " + new Date(order.created_at).toLocaleString("en-IN")].filter(Boolean).join("\n");
  sendOrderQuietly(order);
  window.open("https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
});
$("#contact-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = ["Hello Shyam Pan Corner!", "Name: " + data.get("name"), "Email: " + data.get("email"), "Topic: " + data.get("subject"), "Message: " + data.get("message")].join("\n");
  $("#contact-feedback").textContent = "Opening WhatsApp with your note…";
  window.open("https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
});
renderProducts();
renderCart();
updateFulfillment();