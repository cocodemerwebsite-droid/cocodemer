// MOBILE MENU
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', function () {
  mobileMenu.classList.toggle('active');
});
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', function () {
    mobileMenu.classList.remove('active');
  });
});



document.addEventListener("DOMContentLoaded", function () {

  /* ==================================
     GLOBAL VARIABLES
  ================================== */
  let selectedProduct = null;
  let selectedSize = "30ml";
  let modalIndex = 0;
  let modalTotalSlides = 0;

  const overlay = document.getElementById('productOverlay');
  const closeBtn = document.getElementById('closeModal');
  const carousel = document.getElementById('modalCarousel');
  const modalPrevBtn = document.getElementById('modalPrev');
  const modalNextBtn = document.getElementById('modalNext');
  const cartDrawer = document.getElementById("cartDrawer");

  /* ==================================
     MODAL FUNCTIONS
  ================================== */
  window.openModal = function (prod) {

    selectedProduct = prod;

    const images = (prod.images && prod.images.length)
      ? prod.images
      : [prod.image];

    modalTotalSlides = images.length;
    carousel.innerHTML = "";

    images.forEach(img => {
      const slide = document.createElement("div");
      slide.className = "min-w-full h-full bg-cover bg-center";
      slide.style.backgroundImage = `url('${img}')`;
      carousel.appendChild(slide);
    });

    modalIndex = 0;
    updateModalSlide();

    modalPrevBtn.style.display = modalTotalSlides > 1 ? "flex" : "none";
    modalNextBtn.style.display = modalTotalSlides > 1 ? "flex" : "none";

    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  };

  function updateModalSlide() {
    carousel.style.transform = `translateX(-${modalIndex * 100}%)`;
  }

  modalNextBtn.onclick = function (e) {
    e.stopPropagation();
    modalIndex = (modalIndex + 1) % modalTotalSlides;
    updateModalSlide();
  };

  modalPrevBtn.onclick = function (e) {
    e.stopPropagation();
    modalIndex = (modalIndex - 1 + modalTotalSlides) % modalTotalSlides;
    updateModalSlide();
  };

  closeBtn.onclick = closeModal;
  overlay.onclick = function (e) {
    if (e.target === overlay) closeModal();
  };

  function closeModal() {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  /* ==================================
     SIZE SELECTION
  ================================== */
  document.querySelectorAll(".size-option").forEach(btn => {
    btn.addEventListener("click", function () {

      document.querySelectorAll(".size-option")
        .forEach(b => b.classList.remove("bg-primary", "border-primary", "text-white"));

      this.classList.add("bg-primary", "border-primary", "text-white");
      selectedSize = this.dataset.size;
    });
  });

  /* ==================================
     QUANTITY
  ================================== */
  const qtyInput = document.getElementById("quantityInput");

  document.getElementById("increaseQty").onclick = () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  };

  document.getElementById("decreaseQty").onclick = () => {
    if (parseInt(qtyInput.value) > 1)
      qtyInput.value = parseInt(qtyInput.value) - 1;
  };

  /* ==================================
     CART SYSTEM
  ================================== */
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function calculatePrice(basePrice, size) {
    if (size === "50ml") return basePrice + 20;
    if (size === "100ml") return basePrice + 40;
    return basePrice;
  }
  function showCartToast() {
    const toast = document.getElementById("cartToast");

    toast.classList.remove("invisible", "opacity-0", "translate-y-[-20px]");
    toast.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "translate-y-[-20px]");

      setTimeout(() => {
        toast.classList.add("invisible");
      }, 400);

    }, 2500);
  }
  window.addToCart = function (product, size, quantity) {

    let cart = getCart();
    const finalPrice = calculatePrice(product.price, size);

    const existing = cart.find(
      item => item.id === product.id && item.size === size
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: finalPrice,
        size: size,
        quantity: quantity
      });
    }

    saveCart(cart);
    updateCartUI();
    showCartToast();
  };

  document.getElementById("addToCart").onclick = function () {
    if (!selectedProduct) return;
    const quantity = parseInt(qtyInput.value);
    addToCart(selectedProduct, selectedSize, quantity);
  };

  /* ==================================
     CART UI
  ================================== */
  function updateCartUI() {

    const cart = getCart();
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    cartCount.textContent =
      cart.reduce((sum, item) => sum + item.quantity, 0);

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {

      total += item.price * item.quantity;

      const div = document.createElement("div");
      div.className = "flex justify-between items-center border-b pb-3";

      div.innerHTML = `
      <div>
        <p class="font-semibold text-sm">${item.name}</p>
        <p class="text-xs text-primary">${item.size} × ${item.quantity}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold">Rs: ${item.price * item.quantity}</p>
        <button class="text-xs text-red-500 remove-btn">Remove</button>
      </div>
    `;

      div.querySelector(".remove-btn").onclick = function () {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        updateCartUI();
      };

      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = "Rs: " + total;
  }

  /* ==================================
     DRAWER TOGGLE
  ================================== */
  document.getElementById("cartIcon").onclick = () => {
    cartDrawer.classList.remove("translate-x-full");
  };

  document.getElementById("closeCart").onclick = () => {
    cartDrawer.classList.add("translate-x-full");
  };

  /* ==================================
     WHATSAPP CHECKOUT
  ================================== */
  window.buyCartViaWhatsApp = function () {

    const cart = getCart();
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    let message = "Hello COCO DEMER,\n\nI would like to order:\n\n";
    let total = 0;

    cart.forEach(item => {
      message += `• ${item.name} (${item.size}) x${item.quantity} - Rs: ${item.price}\n`;
      total += item.price * item.quantity;
    });

    message += `\nTotal: Rs: ${total}\n\nPlease confirm availability.\nThank you.`;

    const phoneNumber = "9895522449";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  updateCartUI();

});
