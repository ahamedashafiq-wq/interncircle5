const products = [
  { id: 1, name: "Studio Headphones", category: "Tech", price: 1499, emoji: "🎧", color: "#e3e8ff", description: "Your soundtrack, anywhere." },
  { id: 2, name: "Everyday Smartwatch", category: "Tech", price: 2299, emoji: "⌚", color: "#d9f3e9", description: "A little smarter every day." },
  { id: 3, name: "City Backpack", category: "Accessories", price: 999, emoji: "🎒", color: "#ffe2d3", description: "Room for all your plans." },
  { id: 4, name: "Portable Speaker", category: "Tech", price: 1299, emoji: "🔊", color: "#f4e1ff", description: "Bring the good vibes along." },
  { id: 5, name: "Travel Tumbler", category: "Lifestyle", price: 549, emoji: "🥤", color: "#fff0bd", description: "Sip, stroll, repeat." },
  { id: 6, name: "Classic Sunglasses", category: "Accessories", price: 799, emoji: "🕶️", color: "#dceefb", description: "A sunny-day essential." },
  { id: 7, name: "Desk Lamp", category: "Lifestyle", price: 1199, emoji: "💡", color: "#fbe1e1", description: "Make room for bright ideas." },
  { id: 8, name: "Wireless Mouse", category: "Tech", price: 699, emoji: "🖱️", color: "#e1f0df", description: "Smooth moves for your setup." }
];

const state = { cart: [], category: "All", search: "" };
const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 2
}).format(value);

const productsContainer = $("#products");
const cartItemsContainer = $("#cartItems");
const emptyCart = $("#emptyCart");
const cartSummary = $("#cartSummary");
const modal = $("#checkoutModal");
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderProducts() {
  const filtered = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const term = state.search.trim().toLowerCase();
    const matchesSearch = !term ||
      `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  productsContainer.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-art" style="background:${product.color}">
        <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
      </div>
      <p class="product-category">${product.category}</p>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-bottom">
        <span class="product-price">${money(product.price)}</span>
        <button class="add-button" type="button" data-add="${product.id}"
          aria-label="Add ${product.name} to cart" title="Add to cart">+</button>
      </div>
    </article>
  `).join("");

  $("#emptyProducts").classList.toggle("hidden", filtered.length !== 0);
}

function getCartCount() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();
  $("#cartCount").textContent = count;
  $("#cartTitleCount").textContent = `(${count} ${count === 1 ? "item" : "items"})`;
  $("#cartSubtotal").textContent = money(total);
  $("#cartTotal").textContent = money(total);
  $("#deliveryCost").textContent = "Free";

  emptyCart.classList.toggle("hidden", state.cart.length > 0);
  cartSummary.classList.toggle("hidden", state.cart.length === 0);

  cartItemsContainer.innerHTML = state.cart.map((item) => `
    <div class="cart-row">
      <div class="cart-thumb" style="background:${item.color}" aria-hidden="true">${item.emoji}</div>
      <div>
        <p class="cart-product-name">${item.name}</p>
        <p class="cart-product-price">${money(item.price)} each</p>
      </div>
      <div class="quantity-control" aria-label="Quantity for ${item.name}">
        <button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-increase="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
      </div>
      <strong class="cart-line-total">${money(item.price * item.quantity)}</strong>
      <button class="remove-button" type="button" data-remove="${item.id}" aria-label="Remove ${item.name}" title="Remove item">×</button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else state.cart.push({ ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} added to your cart`);
}

productsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-increase], [data-decrease], [data-remove]");
  if (!button) return;

  const id = Number(button.dataset.increase || button.dataset.decrease || button.dataset.remove);
  const item = state.cart.find((product) => product.id === id);
  if (!item) return;

  if (button.hasAttribute("data-increase")) item.quantity += 1;
  if (button.hasAttribute("data-decrease")) item.quantity -= 1;
  if (button.hasAttribute("data-remove") || item.quantity <= 0) {
    state.cart = state.cart.filter((product) => product.id !== id);
  }
  renderCart();
});

$("#categoryFilters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  $("#categoryFilters").querySelectorAll(".category-chip").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});

$("#searchInput").addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

$("#cartButton").addEventListener("click", () => {
  $("#cartSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#clearCartButton").addEventListener("click", () => {
  if (state.cart.length === 0) return;
  state.cart = [];
  renderCart();
  showToast("Your cart has been cleared");
});

function openCheckout() {
  if (state.cart.length === 0) {
    showToast("Add a product before checkout");
    return;
  }

  $("#checkoutSummary").innerHTML = state.cart.map((item) => `
    <div class="checkout-line">
      <span>${item.name} × ${item.quantity}</span>
      <strong>${money(item.price * item.quantity)}</strong>
    </div>
  `).join("");
  $("#modalTotal").textContent = money(getCartTotal());
  modal.showModal();
}

$("#checkoutButton").addEventListener("click", openCheckout);
$("#closeModal").addEventListener("click", () => modal.close());
$("#closeModalX").addEventListener("click", () => modal.close());

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

$("#placeOrder").addEventListener("click", () => {
  if (state.cart.length === 0) {
    modal.close();
    return;
  }
  state.cart = [];
  renderCart();
  modal.close();
  showToast("Demo order placed. No payment was collected.");
});

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
