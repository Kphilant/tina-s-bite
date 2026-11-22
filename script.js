// --- TINA'S BITE CENTRAL APPLICATION SCRIPT ---

const CART_KEY = 'tinas_bite_cart';
const BACKEND_URL = 'http://localhost:5000/api/orders';
const TINA_MOMO = '0551011153';

const MENU_ITEMS = [
  {
    id: 1,
    name: "Special Beef Shawarma",
    category: "shawarma",
    price: 45.00,
    desc: "Loaded with spiced beef, fresh veggies, garlic sauce, and wrapped in warm pita.",
    img: "https://images.unsplash.com/photo-1561651857-efdb946274a7?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    name: "Loaded Chicken Fries",
    category: "fries",
    price: 55.00,
    desc: "Crispy golden fries topped with diced grilled chicken, melted cheese, and signature sauce.",
    img: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    name: "Spicy Stir-fry Noodles",
    category: "noodles",
    price: 50.00,
    desc: "Wok-tossed noodles with vegetables, sausages, eggs, and rich spicy savory sauce.",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    name: "Chicken Suya Pizza",
    category: "pizza",
    price: 90.00,
    desc: "Topped with spicy suya chicken chunks, bell peppers, onions, and extra mozzarella cheese.",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    name: "Double Decker Burger",
    category: "burger",
    price: 70.00,
    desc: "Two juicy beef patties, double cheese, lettuce, tomatoes, and special house dressing.",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"
  }
];

let currentCategory = 'all';

// --- CART STORAGE HELPERS ---
function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateAllCartBadges();
}

function clearCart() {
  if (confirm("Are you sure you want to undo/clear your entire order?")) {
    localStorage.removeItem(CART_KEY);
    updateAllCartBadges();
    renderCartDrawer();
    renderCheckoutSummary();
  }
}

function updateAllCartBadges() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count-badge, #cart-count').forEach(el => {
    el.innerText = count;
  });
}

// --- MENU PAGE FUNCTIONS ---
function renderMenu() {
  const container = document.getElementById('menu-container');
  if (!container) return;

  const filtered = currentCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === currentCategory);

  container.innerHTML = filtered.map(item => `
    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition">
      <div>
        <img src="${item.img}" class="w-full h-48 object-cover" alt="${item.name}">
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg text-white">${item.name}</h3>
            <span class="bg-amber-400/10 text-amber-400 font-extrabold px-2.5 py-1 rounded-lg text-sm">GH₵ ${item.price.toFixed(2)}</span>
          </div>
          <p class="text-gray-400 text-xs leading-relaxed mb-4">${item.desc}</p>
        </div>
      </div>
      <div class="p-5 pt-0">
        <button onclick="addToCart(${item.id})" class="w-full bg-gray-800 hover:bg-amber-400 hover:text-gray-950 text-amber-400 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
          <i class="fa-solid fa-plus"></i> Add to Order
        </button>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat, btnElement) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('bg-amber-400', 'text-gray-950');
    btn.classList.add('bg-gray-800', 'text-gray-300');
  });
  if (btnElement) {
    btnElement.classList.remove('bg-gray-800', 'text-gray-300');
    btnElement.classList.add('bg-amber-400', 'text-gray-950');
  }
  renderMenu();
}

function addToCart(itemId) {
  const product = MENU_ITEMS.find(i => i.id === itemId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === itemId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart(cart);
  renderCartDrawer();

  const drawer = document.getElementById('cart-drawer');
  if (drawer) {
    drawer.classList.remove('hidden');
  }
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) {
    window.location.href = 'payment.html';
    return;
  }
  drawer.classList.toggle('hidden');
  if (!drawer.classList.contains('hidden')) {
    renderCartDrawer();
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container || !totalEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500 py-10">Your cart is empty.</p>`;
    totalEl.innerText = 'GH₵ 0.00';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="flex items-center justify-between bg-gray-800/60 p-3 rounded-xl border border-gray-700/50">
        <div>
          <h4 class="font-bold text-sm text-white">${item.name}</h4>
          <p class="text-xs text-amber-400 font-semibold">GH₵ ${item.price.toFixed(2)} x ${item.quantity}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQty(${item.id}, -1)" class="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold flex items-center justify-center">-</button>
          <span class="text-sm font-bold w-4 text-center">${item.quantity}</span>
          <button onclick="changeQty(${item.id}, 1)" class="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold flex items-center justify-center">+</button>
          <button onclick="removeItemById(${item.id})" title="Remove item" class="w-7 h-7 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs flex items-center justify-center ml-1">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.innerText = `GH₵ ${total.toFixed(2)}`;
}

function changeQty(id, delta) {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === id);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  saveCart(cart);
  renderCartDrawer();
  renderCheckoutSummary();
}

function removeItemById(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCartDrawer();
  renderCheckoutSummary();
}

// --- CHECKOUT & PAYMENT PAGE FUNCTIONS ---
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-gray-400 text-sm py-3">Your cart is empty. <a href="menu.html" class="text-amber-400 underline font-bold">Return to Menu</a></p>`;
    calculateCheckoutTotals(0);
    return;
  }

  let itemsTotal = 0;
  container.innerHTML = cart.map(item => {
    const sub = item.price * item.quantity;
    itemsTotal += sub;
    return `
      <div class="flex justify-between items-center py-2 border-b border-gray-800 text-sm">
        <div>
          <span>${item.name} <strong class="text-amber-400">x${item.quantity}</strong></span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold">GH₵ ${sub.toFixed(2)}</span>
          <button type="button" onclick="removeItemById(${item.id})" class="text-red-400 hover:text-red-300 text-xs underline">Undo</button>
        </div>
      </div>
    `;
  }).join('');

  calculateCheckoutTotals(itemsTotal);
}

function calculateCheckoutTotals(itemsTotal) {
  const itemsEl = document.getElementById('summary-items-total');
  const feeEl = document.getElementById('summary-delivery-fee');
  const grandEl = document.getElementById('summary-grand-total');
  const zoneSelect = document.getElementById('cust-zone');

  let deliveryFee = 15.00;
  if (zoneSelect) {
    const opt = zoneSelect.options[zoneSelect.selectedIndex];
    if (opt && opt.dataset.fee) {
      deliveryFee = parseFloat(opt.dataset.fee);
    }
  }

  const activeFee = itemsTotal > 0 ? deliveryFee : 0;
  const grandTotal = itemsTotal + activeFee;

  if (itemsEl) itemsEl.innerText = `GH₵ ${itemsTotal.toFixed(2)}`;
  if (feeEl) feeEl.innerText = `GH₵ ${activeFee.toFixed(2)}`;
  if (grandEl) grandEl.innerText = `GH₵ ${grandTotal.toFixed(2)}`;

  window.checkoutTotals = { itemsTotal, deliveryFee: activeFee, grandTotal };
}

async function submitOrderToDatabase(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty! Please add items from the menu first.");
    return;
  }

  const btn = document.getElementById('submit-order-btn');
  const customerName = document.getElementById('cust-name').value.trim();
  const customerPhone = document.getElementById('cust-phone').value.trim();
  const zoneSelect = document.getElementById('cust-zone');
  const zoneId = parseInt(zoneSelect.value) || 1;
  const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
  const exactAddress = document.getElementById('cust-address').value.trim();
  const paymentProvider = document.getElementById('pay-provider').value;

  const { itemsTotal, deliveryFee, grandTotal } = window.checkoutTotals || { itemsTotal: 0, deliveryFee: 0, grandTotal: 0 };

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing Order...`;

  const payload = {
    customerName,
    customerPhone,
    zoneId,
    exactAddress: `${zoneName} - ${exactAddress}`,
    paymentProvider,
    itemsTotal,
    deliveryFee,
    grandTotal,
    items: cart
  };

  const itemsSummary = cart.map(i => `• ${i.name} (x${i.quantity}) - GH₵ ${(i.price * i.quantity).toFixed(2)}`).join('\n');

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      const waMessage =
        `*NEW ORDER - TINA'S BITE (#${result.orderId})*\n\n` +
        `*Customer:* ${customerName}\n` +
        `*Phone:* ${customerPhone}\n` +
        `*Zone:* ${zoneName}\n` +
        `*Landmark:* ${exactAddress}\n` +
        `*Payment:* ${paymentProvider} (MoMo: ${TINA_MOMO})\n` +
        `*Delivery Fee:* GH₵ ${deliveryFee.toFixed(2)}\n` +
        `*Grand Total:* GH₵ ${grandTotal.toFixed(2)}\n\n` +
        `*Items Ordered:*\n${itemsSummary}`;

      localStorage.removeItem(CART_KEY);
      window.location.href = `https://wa.me/233551011153?text=${encodeURIComponent(waMessage)}`;
    } else {
      alert("Database rejected the order: " + (result.error || "Check PostgreSQL table IDs."));
      btn.disabled = false;
      btn.innerHTML = `Confirm Order & Send to WhatsApp`;
    }
  } catch (err) {
    console.warn("Backend offline, falling back to direct WhatsApp order:", err);
    const sendDirect = confirm(
      "Local database server is offline.\n\nClick OK to still send this order directly to Tina's WhatsApp (0551011153) so you don't lose the order, or Cancel to start your Node.js server first."
    );
    if (sendDirect) {
      const waMessage =
        `*NEW ORDER - TINA'S BITE*\n\n` +
        `*Customer:* ${customerName}\n` +
        `*Phone:* ${customerPhone}\n` +
        `*Zone:* ${zoneName}\n` +
        `*Landmark:* ${exactAddress}\n` +
        `*Payment:* ${paymentProvider} (MoMo: ${TINA_MOMO})\n` +
        `*Delivery Fee:* GH₵ ${deliveryFee.toFixed(2)}\n` +
        `*Grand Total:* GH₵ ${grandTotal.toFixed(2)}\n\n` +
        `*Items Ordered:*\n${itemsSummary}`;

      localStorage.removeItem(CART_KEY);
      window.location.href = `https://wa.me/233551011153?text=${encodeURIComponent(waMessage)}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `Confirm Order & Send to WhatsApp`;
    }
  }
}

// --- INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  updateAllCartBadges();
  renderMenu();
  renderCheckoutSummary();

  const zoneSelect = document.getElementById('cust-zone');
  if (zoneSelect) {
    zoneSelect.addEventListener('change', () => {
      const cart = getCart();
      const itemsTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      calculateCheckoutTotals(itemsTotal);
    });
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', submitOrderToDatabase);
  }
});