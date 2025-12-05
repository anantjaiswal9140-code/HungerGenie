// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
const htmlElement = document.documentElement;
const icon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);
updateIcon(currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

function updateIcon(theme) {
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}
}

// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification('Item added to cart!');
    updateCartCount();
}

function removeFromCart(productName) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.name !== productName);
    saveCart(updatedCart);
    renderCart();
    updateBilling();
}

function updateQuantity(productName, change) {
    const cart = getCart();
    const item = cart.find(item => item.name === productName);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
            return;
        }
        saveCart(cart);
        renderCart();
        updateBilling();
    }
}


function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLink = document.querySelector('.cart-link');
    
    if (cartLink) {
        let badge = cartLink.querySelector('.cart-badge');
        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `
                    background: #ffd166;
                    color: #333;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    margin-left: 5px;
                `;
                cartLink.appendChild(badge);
            }
            badge.textContent = totalItems;
        } else if (badge) {
            badge.remove();
        }
    }
}

// Products Page - Add to Cart functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on products page
    if (document.querySelector('.products-grid')) {
    const addButtons = document.querySelectorAll('.add-to-cart-btn');

    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            
            if (productCard) {
                    const name = productCard.querySelector('h3').textContent;
                const priceElement = productCard.querySelector('.product-price');
                    const imageElement = productCard.querySelector('.product-image img');
                
                if (priceElement) {
                    const priceText = priceElement.textContent.replace('$', '').trim();
                    const price = parseFloat(priceText);
                    
                    if (!isNaN(price)) {
                            const product = {
                                name: name,
                                price: price,
                                image: imageElement ? imageElement.src : ''
                            };
                            
                            addToCart(product);
                        }
                    }
                }
            });
        });
    }
    
    // Check if we're on cart page
    if (document.querySelector('.cart-section')) {
        renderCart();
        // Checkout button functionality disabled
        // const checkoutBtn = document.querySelector('.checkout-btn');
        // if (checkoutBtn) {
        //     checkoutBtn.addEventListener('click', (e) => {
        //         e.preventDefault();
        //         const cart = getCart();
        //         if (cart.length === 0) {
        //             showNotification('Your cart is empty!', 'error');
        //             return;
        //         }
        //         window.location.href = 'checkout.html';
        //     });
        // }
    }
    
    // Check if we're on order confirmation page
    if (document.querySelector('.confirmation-section')) {
        renderOrderConfirmation();
    }
    
    // Update cart count on page load
    updateCartCount();
});

// Cart Page - Render cart items
function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 1.2rem;">Your cart is empty</p>
                <a href="products.html" class="btn" style="margin-top: 20px; display: inline-block;">Browse Products</a>
            </div>
        `;
        updateBilling();
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product="${item.name}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus-btn"><i class="fas fa-minus"></i></button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn plus-btn"><i class="fas fa-plus"></i></button>
            </div>
            <button class="remove-btn"><i class="fas fa-trash"></i> Remove</button>
        </div>
    `).join('');
    
    // Attach event listeners
    cartItemsContainer.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.closest('.cart-item').dataset.product;
            updateQuantity(productName, -1);
        });
    });
    
    cartItemsContainer.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.closest('.cart-item').dataset.product;
            updateQuantity(productName, 1);
        });
    });
    
    cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.closest('.cart-item').dataset.product;
            removeFromCart(productName);
        });
    });
    
    updateBilling();
}

// Cart Page - Update billing section
function updateBilling() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = 2.00;
    const total = subtotal + deliveryCharge;
    
    const subtotalElement = document.querySelector('#subtotalAmount');
    const totalElement = document.querySelector('#totalAmount');
    
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Order Confirmation Page - Render order details
function renderOrderConfirmation() {
    const orderData = localStorage.getItem('lastOrder');
    
    if (!orderData) {
        // No order found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    const order = JSON.parse(orderData);
    const orderDetailsContainer = document.querySelector('#orderDetails');
    
    if (!orderDetailsContainer) return;
    
    // Format order date
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format payment method name
    const paymentMethodNames = {
        'creditCard': 'Credit Card',
        'debitCard': 'Debit Card',
        'paypal': 'PayPal',
        'cashOnDelivery': 'Cash on Delivery'
    };
    
    // Format card number (show only last 4 digits)
    let paymentInfo = paymentMethodNames[order.payment.method] || order.payment.method;
    if (order.payment.cardNumber) {
        // Remove spaces and get last 4 digits
        const cardNumber = order.payment.cardNumber.replace(/\s/g, '');
        const last4 = cardNumber.slice(-4);
        if (last4.length === 4) {
            paymentInfo += ` ending in ${last4}`;
        }
    }
    
    orderDetailsContainer.innerHTML = `
        <div class="order-detail-section">
            <h3><i class="fas fa-receipt"></i> Order Information</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order.orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${paymentInfo}</span>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3><i class="fas fa-map-marker-alt"></i> Delivery Address</h3>
            <div class="address-details">
                <p><strong>${order.delivery.fullName}</strong></p>
                <p>${order.delivery.address}</p>
                <p>${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}</p>
                <p>Phone: ${order.delivery.phone}</p>
                ${order.delivery.instructions ? `<p class="delivery-instructions"><em>Instructions: ${order.delivery.instructions}</em></p>` : ''}
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3><i class="fas fa-shopping-bag"></i> Order Items</h3>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <div class="order-item-info">
                            <span class="order-item-name">${item.name}</span>
                            <span class="order-item-qty">Qty: ${item.quantity}</span>
                        </div>
                        <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="order-detail-section order-totals">
            <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">$${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Delivery Charge:</span>
                <span class="detail-value">$${order.deliveryCharge.toFixed(2)}</span>
            </div>
            <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">$${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;
}


// Enhanced notification function with types
function showNotification(message, type = 'success') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateX(30px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(30px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}