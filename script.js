// === 1. PRODUCT DATA (JSON Array) ===
const products = [
    {
        id: 1,
        name: "Classic Denim Jacket",
        price: 7999.00,
        discountedPrice: 2599.00,
        image: "./img/image.png",
        description: "A timeless, rugged denim jacket perfect for all seasons. Features a button-up front and two chest pockets."
    },
    {
        id: 2,
        name: "Wireless Noise-Cancelling Headphones",
        price: 19999.00,
        discountedPrice: 14999.00,
        image: "./img/image2.webp",
        description: "Experience pure audio with industry-leading noise cancellation and a comfortable, ergonomic design. 30-hour battery life."
    },
    {
        id: 3,
        name: "Organic Cotton T-Shirt Pack",
        price: 3999.00,
        discountedPrice: 2999.00,
        image: "./img/image3.jpg",
        description: "A pack of three incredibly soft organic cotton t-shirts in essential colors. Sustainable and breathable."
    },
    {
        id: 4,
        name: "4K Ultra HD Smart TV (55 Inch)",
        price: 59999.00,
        discountedPrice: 49999.00,
        image: "./img/image4.png",
        description: "Vibrant colors and sharp details with smart features built-in. Perfect for movies and gaming."
    }
];

// === 2. DOM ELEMENTS & INITIALIZATION ===
const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cart-count');

// View Containers (SPA simulation)
const productListView = document.getElementById('productListView');
const productDetailsView = document.getElementById('productDetailsView');
const cartView = document.getElementById('cartView');

// Content Areas
const productDetailsContent = document.getElementById('productDetailsContent');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutBtn = document.querySelector('.checkout-btn');

let currentCart = []; // Main array to hold cart items

// Load data and update UI on startup
loadCartFromLocalStorage();
updateCartHeader();
renderProducts(); 
attachGlobalListeners();


// =========================================================================
//                             CORE FUNCTIONS
// =========================================================================

/**
 * Calculates the total price of all items in the cart.
 * @returns {number} The grand total price.
 */
function calculateTotal() {
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Switches the displayed view to the target view ID. (SPA Navigation)
 * @param {string} targetViewId - The ID of the view to show ('productListView', 'productDetailsView', 'cartView').
 */
function navigateTo(targetViewId) {
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.add('hidden'); 
    });
    document.getElementById(targetViewId).classList.remove('hidden');
    window.scrollTo(0, 0);
}

// =========================================================================
//                             PRODUCT VIEW LOGIC
// =========================================================================

/**
 * Creates the HTML for a single product card.
 */
function createProductCard(product) {
    const discountAmount = product.price - product.discountedPrice;
    const discountPercentage = Math.round((discountAmount / product.price) * 100);

    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price-group">
                    <div>
                        <span class="price">₹${product.discountedPrice.toFixed(2)}</span>
                        <span class="discount-price">₹${product.price.toFixed(2)}</span>
                    </div>
                    <span class="price-discount-tag">-${discountPercentage}%</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders all products onto the main page and attaches click listeners.
 */
function renderProducts() {
    const productsContainer = document.createElement('div');
    productsContainer.classList.add('products-container');

    products.forEach(product => {
        productsContainer.innerHTML += createProductCard(product);
    });

    productGrid.appendChild(productsContainer);

    // Attach click listeners to open the details view
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const product = products.find(p => p.id === id);
            openProductDetails(product);
        });
    });
}

/**
 * Opens the product details view and populates it with data.
 */
function openProductDetails(product) {
    productDetailsContent.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="detail-image">
        <div class="detail-info">
            <h2>${product.name}</h2>
            <div class="detail-prices">
                <span class="price">₹${product.discountedPrice.toFixed(2)}</span>
                <span class="discount-price">₹${product.price.toFixed(2)}</span>
            </div>
            <p>${product.description}</p>

            <div class="quantity-controls">
                <label for="qtyInput">Quantity:</label>
                <button class="qty-btn" id="decreaseQty">-</button>
                <input type="number" id="qtyInput" value="1" min="1" max="99" readonly>
                <button class="qty-btn" id="increaseQty">+</button>
            </div>

            <button id="addToCartBtn" data-id="${product.id}">Add to Cart</button>
        </div>
    `;

    navigateTo('productDetailsView');
    
    // Quantity control listeners in the Details View
    const qtyInput = document.getElementById('qtyInput');
    document.getElementById('increaseQty').addEventListener('click', () => {
        qtyInput.value = Math.min(99, parseInt(qtyInput.value) + 1);
    });
    document.getElementById('decreaseQty').addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
    });

    // Add to Cart listener in the Details View
    document.getElementById('addToCartBtn').addEventListener('click', (e) => {
        const productId = parseInt(e.currentTarget.dataset.id);
        const quantity = parseInt(document.getElementById('qtyInput').value);
        addToCart(productId, quantity);
        navigateTo('productListView'); 
    });
}

// =========================================================================
//                             CART LOGIC
// =========================================================================

/**
 * Adds a product to the cart or updates its quantity.
 */
function addToCart(id, quantity) {
    const product = products.find(p => p.id === id);
    const existingItemIndex = currentCart.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.discountedPrice,
            image: product.image,
            quantity: quantity
        });
    }

    saveCartToLocalStorage();
    updateCartHeader();
    console.log(`${quantity} x ${product.name} added to cart!`);
}

/**
 * Removes an item entirely from the cart.
 */
function removeItemFromCart(id) {
    currentCart = currentCart.filter(item => item.id !== id);
    saveCartToLocalStorage();
    renderCart(); // Re-render the cart view
}

/**
 * Updates the quantity of a specific item in the cart.
 */
function updateCartQuantity(id, newQuantity) {
    const item = currentCart.find(item => item.id === id);
    if (item) {
        if (newQuantity <= 0) {
            removeItemFromCart(id); // Remove if quantity drops to 0 or below
        } else {
            item.quantity = newQuantity;
            saveCartToLocalStorage();
            renderCart(); // Re-render the cart view
        }
    }
}

// =========================================================================
//                             UI UPDATES
// =========================================================================

/**
 * Updates the cart count badge in the header.
 */
function updateCartHeader() {
    const totalItems = currentCart.reduce((count, item) => count + item.quantity, 0);
    cartCount.textContent = totalItems;
}

/**
 * Renders all cart items in the dedicated cart view.
 */
function renderCart() {
    updateCartHeader(); 

    cartItemsContainer.innerHTML = '';

    if (currentCart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        currentCart.forEach(item => {
            const subtotal = item.price * item.quantity;
            const itemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img class="cart-img" src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)} / unit</p>
                    </div>
                    <div class="cart-quantity-control">
                        <button class="qty-btn decrease-qty" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" readonly>
                        <button class="qty-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <span class="cart-subtotal">₹${subtotal.toFixed(2)}</span>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });

        // Attach listeners for cart actions
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                removeItemFromCart(id);
            });
        });
        
        document.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = currentCart.find(i => i.id === id);
                if (item) updateCartQuantity(id, item.quantity + 1);
            });
        });
        
        document.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = currentCart.find(i => i.id === id);
                if (item) updateCartQuantity(id, item.quantity - 1); 
            });
        });
    }

    // Update grand total
    const grandTotal = calculateTotal();
    cartTotalSpan.textContent = `₹${grandTotal.toFixed(2)}`;
}

// =========================================================================
//                             CHECKOUT & LOCAL STORAGE
// =========================================================================

/**
 * Handles the checkout process: shows confirmation, clears cart, saves, and navigates.
 */
function handleCheckout() {
    if (currentCart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }

    // 1. Show Confirmation Notification
    const grandTotal = calculateTotal().toFixed(2);
    alert(`🎉 Order Confirmed! 🎉
    
Thank you for your purchase.
Your total amount of ₹${grandTotal} has been successfully processed.
We will now prepare your items for shipment.
    
Happy shopping!`);

    // 2. Clear the Cart
    currentCart = [];
    
    // 3. Save the empty cart to Local Storage
    saveCartToLocalStorage();
    
    // 4. Update the UI and navigate
    updateCartHeader();
    navigateTo('productListView');
}

/**
 * Saves the current cart array to Local Storage.
 */
function saveCartToLocalStorage() {
    localStorage.setItem('ecommerceCart', JSON.stringify(currentCart));
}

/**
 * Loads the cart array from Local Storage on initialization.
 */
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('ecommerceCart');
    if (storedCart) {
        try {
            currentCart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Error parsing cart from Local Storage:", e);
            currentCart = [];
        }
    }
}


// =========================================================================
//                             GLOBAL LISTENERS
// =========================================================================

/**
 * Attaches event listeners for global navigation elements.
 */
function attachGlobalListeners() {
    // Navigation Listeners
    document.getElementById('homeLink').addEventListener('click', () => navigateTo('productListView'));
    document.getElementById('openCart').addEventListener('click', () => {
        renderCart();
        navigateTo('cartView');
    });
    document.getElementById('backToProducts').addEventListener('click', () => navigateTo('productListView'));
    document.getElementById('backFromCart').addEventListener('click', () => navigateTo('productListView'));

    // Checkout Listener
    checkoutBtn.addEventListener('click', handleCheckout);
}
