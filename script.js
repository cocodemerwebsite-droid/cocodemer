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

  // /* ==================================
  //    WHATSAPP CHECKOUT
  // ================================== */
  // window.buyCartViaWhatsApp = function () {

  //   const cart = getCart();
  //   if (!cart.length) {
  //     alert("Your cart is empty.");
  //     return;
  //   }

  //   let message = "Hello COCO DEMER,\n\nI would like to order:\n\n";
  //   let total = 0;

  //   cart.forEach(item => {
  //     message += `• ${item.name} (${item.size}) x${item.quantity} - Rs: ${item.price}\n`;
  //     total += item.price * item.quantity;
  //   });

  //   message += `\nTotal: Rs: ${total}\n\nPlease confirm availability.\nThank you.`;

  //   const phoneNumber = "9895522449";
  //   const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  //   window.open(url, "_blank");
  // };

  /* ==================================
   WHATSAPP CHECKOUT (FULL - WITH QR)
================================== */
document.getElementById("confirmCheckout").onclick = function () {

  const name = document.getElementById("custName").value;
  const address = document.getElementById("custAddress").value;
  const pincode = document.getElementById("custPincode").value;
  const paymentText = document.getElementById("custPayment").value;

  if (!name || !address || !pincode) {
    alert("Please fill all fields");
    return;
  }

  const cart = getCart();

  let message = `🛍 *New Order - COCO DEMER*\n\n`;
  message += `👤 Name: ${name}\n`;
  message += `📍 Address: ${address}\n`;
  message += `📦 Pincode: ${pincode}\n`;
  message += `💳 Payment: ${paymentText}\n\n`;

  message += `🧾 *Order Details:*\n`;

  let total = 0;

  cart.forEach(item => {
    message += `• ${item.name} (${item.size}) x${item.quantity} - Rs: ${item.price * item.quantity}\n`;
    total += item.price * item.quantity;
  });

  const shippingFee = total > 999 ? 0 : 50;
  const grandTotal = total + shippingFee;

  message += `\nSubtotal: Rs: ${total}`;
  message += `\nShipping: Rs: ${shippingFee}`;
  message += `\n*Total: Rs: ${grandTotal}*\n\n`;

  // UPI
  const upiId = "yourupi@upi";
  const upiLink = `upi://pay?pa=${upiId}&pn=COCO%20DEMER&am=${grandTotal}&cu=INR`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  message += `💰 Pay here:\n${upiLink}\n\n`;
  message += `📷 QR:\n${qrCodeUrl}\n\n`;
  message += `Send payment screenshot after paying.`;

  const phoneNumber = "9895522449";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

  checkoutModal.classList.add("hidden");
};
// window.buyCartViaWhatsApp = function () {

//   const cart = getCart();
//   if (!cart.length) {
//     alert("Your cart is empty.");
//     return;
//   }

//   // --- CUSTOMER DETAILS ---
//   const name = prompt("Enter your name:");
//   const address = prompt("Enter your shipping address:");
//   const pincode = prompt("Enter your pincode:");
//   const paymentMethod = prompt("Choose payment method:\n1. UPI\n2. Card\n3. Cash on Delivery");

//   let paymentText = "";
//   if (paymentMethod === "1") paymentText = "UPI Payment";
//   else if (paymentMethod === "2") paymentText = "Card Payment";
//   else paymentText = "Cash on Delivery";

//   // --- ORDER CALCULATION ---
//   let message = `🛍 *New Order - COCO DEMER*\n\n`;
//   message += `👤 Name: ${name}\n`;
//   message += `📍 Address: ${address}\n`;
//   message += `📦 Pincode: ${pincode}\n`;
//   message += `💳 Payment: ${paymentText}\n\n`;

//   message += `🧾 *Order Details:*\n`;

//   let total = 0;

//   cart.forEach(item => {
//     message += `• ${item.name} (${item.size}) x${item.quantity} - Rs: ${item.price * item.quantity}\n`;
//     total += item.price * item.quantity;
//   });

//   const shippingFee = total > 999 ? 0 : 50;
//   const grandTotal = total + shippingFee;

//   message += `\nSubtotal: Rs: ${total}`;
//   message += `\nShipping: Rs: ${shippingFee}`;
//   message += `\n*Total: Rs: ${grandTotal}*\n\n`;

//   // --- UPI DETAILS ---
//   const upiId = "yourupi@upi"; // 🔁 CHANGE THIS
//   const nameEncoded = encodeURIComponent("COCO DEMER");

// // UPI Payment Link
// const upiLink = `upi://pay?pa=${upiId}&pn=${nameEncoded}&am=${grandTotal}&cu=INR`;

// // ✅ Better QR Code (more reliable)
// const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

// // --- ADD TO MESSAGE ---
// message += `💰 *Pay via UPI:*\n`;
// message += `${upiLink}\n\n`;

// message += `📷 *Scan QR to Pay:*\n`;
// message += `${qrCodeUrl}\n\n`;

// message += `📌 UPI ID: ${upiId}\n`;
// message += `📌 Amount: Rs: ${grandTotal}\n\n`;

// message += `⚠️ After payment, send screenshot here.\n`;
// message += `🚚 Tracking will be shared after dispatch.\n`;
// message += `Thank you ❤️`;

//   // --- OPEN WHATSAPP ---
//   const phoneNumber = "9895522449";
//   const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

//   window.open(url, "_blank");
// };

/* ==================================
   CHECKOUT FORM LOGIC
================================== */
const checkoutModal = document.getElementById("checkoutModal");

// OPEN FORM
document.getElementById("openCheckout").onclick = () => {
  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  checkoutModal.classList.remove("hidden");
  checkoutModal.classList.add("flex");
};

// CLOSE FORM
document.getElementById("closeCheckout").onclick = () => {
  checkoutModal.classList.add("hidden");
  checkoutModal.classList.remove("flex");
};
  updateCartUI();

});
