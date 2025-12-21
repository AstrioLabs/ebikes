// E-Bike Products
const products = [
    { id: 1, name: "NEW! Mountain eBike", image: "images/mountain.webp" },
    { id: 2, name: "City Commuter", image: "images/city.jpg" },
    { id: 3, name: "Road Racing eBike", image: "images/road.jpg" },
    { id: 4, name: "Fat Tire eBike", image: "images/fat.jpg" },
    { id: 5, name: "Folding eBike", image: "images/folding.webp" },
    { id: 6, name: "Cargo eBike", image: "images/cargo.webp" },
    { id: 7, name: "Hybrid eBike", image: "images/hybrid.webp" },
    { id: 8, name: "Performance eBike", image: "images/performance.jpg" }
];

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Track which items have been highlighted
let highlightedItems = JSON.parse(localStorage.getItem('highlightedItems')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartBadge();
    observeProducts();
    restoreHighlights();
});

// Restore highlights for items that were previously added
function restoreHighlights() {
    highlightedItems.forEach(itemId => {
        const productCard = document.querySelector(`[data-id="${itemId}"]`);
        if (productCard) {
            const imageWrapper = productCard.querySelector('.product-image-wrapper');
            imageWrapper.classList.add('selected');
        }
    });
}

// Render Products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image" id="productImg-${product.id}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}, this)">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Fly to Cart Animation
function flyToCart(productId, buttonElement) {
    const productImg = document.getElementById(`productImg-${productId}`);
    const cartIcon = document.getElementById('cartIcon');
    const container = document.getElementById('flyingImageContainer');
    
    // Get positions
    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create flying image
    const flyingImg = document.createElement('img');
    flyingImg.src = productImg.src;
    flyingImg.className = 'flying-image';
    flyingImg.style.left = imgRect.left + imgRect.width / 2 - 40 + 'px';
    flyingImg.style.top = imgRect.top + imgRect.height / 2 - 40 + 'px';
    
    container.appendChild(flyingImg);
    
    // Trigger animation after a small delay
    requestAnimationFrame(() => {
        flyingImg.style.left = cartRect.left + cartRect.width / 2 - 10 + 'px';
        flyingImg.style.top = cartRect.top + cartRect.height / 2 - 10 + 'px';
        flyingImg.classList.add('fly');
    });
    
    // Remove after animation
    setTimeout(() => {
        flyingImg.remove();
    }, 800);
}

// Add to Cart
function addToCart(productId, buttonElement) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    // Add highlight only once (first time item is added)
    if (!highlightedItems.includes(productId)) {
        const productCard = document.querySelector(`[data-id="${productId}"]`);
        const imageWrapper = productCard.querySelector('.product-image-wrapper');
        imageWrapper.classList.add('selected');
        
        highlightedItems.push(productId);
        localStorage.setItem('highlightedItems', JSON.stringify(highlightedItems));
    }
    
    // Fly animation
    flyToCart(productId, buttonElement);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartBadge();
    shakeCart();
    
    // If cart is open, update the display immediately
    if (document.getElementById('cartDrawer').classList.contains('active')) {
        renderCartItems();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Remove highlight when item is removed
    const productCard = document.querySelector(`[data-id="${productId}"]`);
    if (productCard) {
        const imageWrapper = productCard.querySelector('.product-image-wrapper');
        imageWrapper.classList.remove('selected');
    }
    
    // Remove from highlighted items
    highlightedItems = highlightedItems.filter(id => id !== productId);
    localStorage.setItem('highlightedItems', JSON.stringify(highlightedItems));
    
    saveCart();
    updateCartBadge();
    renderCartItems();
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
            updateCartBadge();
        }
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart Badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
}

// Shake Cart Animation
function shakeCart() {
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.classList.add('shake');
    setTimeout(() => cartIcon.classList.remove('shake'), 500);
}

// Open Cart
function openCart() {
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.classList.add('cart-open');
    renderCartItems();
}

// Close Cart
function closeCartDrawer() {
    document.getElementById('cartDrawer').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.classList.remove('cart-open');
}

// Render Cart Items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your cart is empty</p>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">&times;</button>
        </div>
    `).join('');
}

// Checkout - Show Congratulations Message
function checkout() {
    if (cart.length === 0) {
        return;
    }
    
    const buyNowPayLater = document.getElementById('buyNowPayLater').checked;
    
    // Show congratulations overlay
    const congratsOverlay = document.getElementById('congratsOverlay');
    const congratsMessage = congratsOverlay.querySelector('.congrats-message');
    
    if (buyNowPayLater) {
        congratsMessage.textContent = 'Enjoy BUY NOW PAY LATER eBIKE 🚴⚡';
    } else {
        congratsMessage.textContent = 'Enjoy your new eBike 🚴⚡';
    }
    
    congratsOverlay.classList.add('show');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartItems();
    closeCartDrawer();
    
    // Remove all highlights
    document.querySelectorAll('.product-image-wrapper.selected').forEach(wrapper => {
        wrapper.classList.remove('selected');
    });
    
    // Clear highlighted items
    highlightedItems = [];
    localStorage.setItem('highlightedItems', JSON.stringify(highlightedItems));
    
    // Hide congratulations after 4 seconds
    setTimeout(() => {
        congratsOverlay.classList.remove('show');
    }, 4000);
}

// Scroll Animation Observer
function observeProducts() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}
