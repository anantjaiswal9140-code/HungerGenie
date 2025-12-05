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
        // Add checkout button functionality
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const cart = getCart();
                if (cart.length === 0) {
                    showNotification('Your cart is empty!', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
    }
    
    // Check if we're on checkout page
    if (document.querySelector('.checkout-section')) {
        renderCheckout();
        setupCheckoutForm();
    }
    
    // Check if we're on order confirmation page
    if (document.querySelector('.confirmation-section')) {
        renderOrderConfirmation();
    }
    
    // Check if we're on home page and initialize order tracking
    if (document.querySelector('.hero')) {
        initializeOrderTracking();
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

// Checkout Page - Render checkout items
function renderCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    const checkoutItemsContainer = document.querySelector('#checkout-items');
    if (!checkoutItemsContainer) return;
    
    checkoutItemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    
    // Update checkout totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = 2.00;
    const total = subtotal + deliveryCharge;
    
    const checkoutSubtotal = document.querySelector('#checkout-subtotal');
    const checkoutTotal = document.querySelector('#checkout-total');
    
    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    if (checkoutTotal) {
        checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Checkout Page - Setup form and payment options
function setupCheckoutForm() {
    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.querySelector('#cardDetails');
    const paypalQrSection = document.querySelector('#paypalQrCode');
    
    // Initialize visibility based on default selection
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedMethod && (selectedMethod.value === 'creditCard' || selectedMethod.value === 'debitCard')) {
        if (cardDetails) {
            cardDetails.style.display = 'block';
            document.querySelectorAll('#cardDetails input').forEach(input => {
                input.required = true;
            });
        }
        if (paypalQrSection) {
            paypalQrSection.style.display = 'none';
        }
    } else if (selectedMethod && selectedMethod.value === 'paypal') {
        if (cardDetails) {
            cardDetails.style.display = 'none';
            document.querySelectorAll('#cardDetails input').forEach(input => {
                input.required = false;
            });
        }
        if (paypalQrSection) {
            paypalQrSection.style.display = 'block';
            generatePayPalQR();
        }
    } else {
        if (cardDetails) {
            cardDetails.style.display = 'none';
            document.querySelectorAll('#cardDetails input').forEach(input => {
                input.required = false;
            });
        }
        if (paypalQrSection) {
            paypalQrSection.style.display = 'none';
        }
    }
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            if (method.value === 'creditCard' || method.value === 'debitCard') {
                if (cardDetails) {
                    cardDetails.style.display = 'block';
                    // Make card fields required
                    document.querySelectorAll('#cardDetails input').forEach(input => {
                        input.required = true;
                    });
                }
                if (paypalQrSection) {
                    paypalQrSection.style.display = 'none';
                }
            } else if (method.value === 'paypal') {
                if (cardDetails) {
                    cardDetails.style.display = 'none';
                    // Make card fields not required
                    document.querySelectorAll('#cardDetails input').forEach(input => {
                        input.required = false;
                    });
                }
                if (paypalQrSection) {
                    paypalQrSection.style.display = 'block';
                    generatePayPalQR();
                }
            } else {
                if (cardDetails) {
                    cardDetails.style.display = 'none';
                    document.querySelectorAll('#cardDetails input').forEach(input => {
                        input.required = false;
                    });
                }
                if (paypalQrSection) {
                    paypalQrSection.style.display = 'none';
                }
            }
        });
    });
    
    // Format card number input
    const cardNumberInput = document.querySelector('#cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date input
    const expiryInput = document.querySelector('#expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Format CVV input (numbers only)
    const cvvInput = document.querySelector('#cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Handle form submission
    const checkoutForm = document.querySelector('#checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    // Generate QR code when checkout totals are updated
    const observer = new MutationObserver(() => {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (selectedMethod && selectedMethod.value === 'paypal') {
            generatePayPalQR();
        }
    });
    
    const totalElement = document.querySelector('#checkout-total');
    if (totalElement) {
        observer.observe(totalElement, { childList: true, characterData: true, subtree: true });
    }
}

// Generate PayPal QR Code
function generatePayPalQR() {
    const qrCanvas = document.querySelector('#qrCodeCanvas');
    const qrAmountElement = document.querySelector('#qrAmount');
    
    if (!qrCanvas || !window.QRCode) return;
    
    // Get order total
    const totalElement = document.querySelector('#checkout-total');
    let total = 0;
    if (totalElement) {
        const totalText = totalElement.textContent.replace('$', '').trim();
        total = parseFloat(totalText) || 0;
    }
    
    // Update amount display
    if (qrAmountElement) {
        qrAmountElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // Clear previous QR code
    qrCanvas.innerHTML = '';
    
    // Generate PayPal payment URL (demo - in real app, use actual PayPal payment link)
    const paypalUrl = `https://www.paypal.com/paypalme/hungergenie/${total.toFixed(2)}USD`;
    
    // Create image element for center logo
    const logoImg = new Image();
    logoImg.src = 'images/Screenshot 2025-12-06 at 12.41.08 AM.png';
    logoImg.crossOrigin = 'anonymous';
    
    logoImg.onload = function() {
        // Generate QR code with image in center
        QRCode.toCanvas(qrCanvas, paypalUrl, {
            width: 350,
            height: 350,
            margin: 3,
            color: {
                dark: '#003087',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H', // High error correction to allow for logo
            image: logoImg,
            imageSize: 0.25, // Logo takes 25% of QR code size
            marginSize: 0.1
        }, function (error) {
            if (error) {
                console.error('Error generating QR code:', error);
                qrCanvas.innerHTML = '<p style="color: #f44336;">Error generating QR code. Please try again.</p>';
            }
        });
    };
    
    logoImg.onerror = function() {
        // Fallback: Generate QR code without image if image fails to load
        QRCode.toCanvas(qrCanvas, paypalUrl, {
            width: 350,
            height: 350,
            margin: 3,
            color: {
                dark: '#003087',
                light: '#FFFFFF'
            }
        }, function (error) {
            if (error) {
                console.error('Error generating QR code:', error);
                qrCanvas.innerHTML = '<p style="color: #f44336;">Error generating QR code. Please try again.</p>';
            }
        });
    };
}

// Checkout Page - Handle form submission
function handleCheckout(e) {
    e.preventDefault();
    
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const orderData = {
        delivery: {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode'),
            instructions: formData.get('deliveryInstructions') || ''
        },
        payment: {
            method: formData.get('paymentMethod')
        },
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryCharge: 2.00,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 2.00,
        orderDate: new Date().toISOString(),
        orderId: 'ORD-' + Date.now()
    };
    
    // Add card details if credit/debit card selected
    if (orderData.payment.method === 'creditCard' || orderData.payment.method === 'debitCard') {
        orderData.payment.cardNumber = formData.get('cardNumber');
        orderData.payment.expiryDate = formData.get('expiryDate');
        orderData.payment.cvv = formData.get('cvv');
        orderData.payment.cardName = formData.get('cardName');
    }
    
    // Add tracking coordinates (using sample coordinates - in real app, get from geocoding)
    // For demo: using NYC coordinates
    orderData.delivery.lat = '40.7580';
    orderData.delivery.lng = '-73.9855';
    orderData.tracking = {
        status: 'preparing',
        estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
    };
    
    // Save order to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Clear cart
    saveCart([]);
    updateCartCount();
    
    // Show success message and redirect
    showNotification('Order placed successfully!', 'success');
    
    setTimeout(() => {
        // Redirect to order confirmation page
        window.location.href = 'order-confirmation.html';
    }, 1500);
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

// Order Tracking - Initialize tracking widget
function initializeOrderTracking() {
    const orderData = localStorage.getItem('lastOrder');
    
    if (!orderData) {
        return; // No active order
    }
    
    const order = JSON.parse(orderData);
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const timeDiff = now - orderDate;
    const minutesDiff = Math.floor(timeDiff / 60000);
    
    // Show widget if order is less than 60 minutes old (simulating active delivery)
    if (minutesDiff < 60) {
        showOrderTrackingWidget(order);
    }
}

// Order Tracking - Show tracking widget
function showOrderTrackingWidget(order) {
    const widget = document.querySelector('#orderTrackingWidget');
    if (!widget) return;
    
    widget.style.display = 'block';
    
    // Update order time
    const orderDate = new Date(order.orderDate);
    const orderTimeElement = document.querySelector('#orderTime');
    if (orderTimeElement) {
        const timeString = orderDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        orderTimeElement.textContent = `Ordered: ${timeString}`;
    }
    
    // Initialize map
    initializeTrackingMap(order);
    
    // Update ETA
    updateETA(order);
    
    // Close button functionality
    const closeBtn = document.querySelector('#closeTrackingBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            widget.style.display = 'none';
        });
    }
}

// Order Tracking - Initialize map with animated rider
function initializeTrackingMap(order) {
    const mapContainer = document.querySelector('#trackingMap');
    if (!mapContainer) return;
    
    // Wait for Leaflet to load
    if (!window.L) {
        setTimeout(() => initializeTrackingMap(order), 100);
        return;
    }
    
    // Clear any existing map
    mapContainer.innerHTML = '';
    
    // Default coordinates (you can use actual coordinates from order)
    // For demo, using sample coordinates
    const restaurantLat = 40.7128; // Restaurant location
    const restaurantLng = -74.0060;
    const deliveryLat = parseFloat(order.delivery.lat) || 40.7580; // Delivery location
    const deliveryLng = parseFloat(order.delivery.lng) || -73.9855;
    
    // Initialize map centered between restaurant and delivery
    const centerLat = (restaurantLat + deliveryLat) / 2;
    const centerLng = (restaurantLng + deliveryLng) / 2;
    
    const map = L.map(mapContainer, {
        zoomControl: true,
        attributionControl: false
    }).setView([centerLat, centerLng], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    // Add restaurant marker
    const restaurantIcon = L.divIcon({
        className: 'restaurant-marker',
        html: '<i class="fas fa-store" style="color: #ff6b6b; font-size: 20px;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    L.marker([restaurantLat, restaurantLng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('Restaurant');
    
    // Add delivery location marker
    const deliveryIcon = L.divIcon({
        className: 'delivery-marker',
        html: '<i class="fas fa-map-marker-alt" style="color: #4CAF50; font-size: 24px;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    L.marker([deliveryLat, deliveryLng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup('Your Location');
    
    // Create rider marker
    const riderIcon = L.divIcon({
        className: 'rider-marker',
        html: '<i class="fas fa-motorcycle" style="color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Start rider at restaurant
    const riderMarker = L.marker([restaurantLat, restaurantLng], { icon: riderIcon })
        .addTo(map);
    
    // Animate rider movement
    animateRider(riderMarker, restaurantLat, restaurantLng, deliveryLat, deliveryLng, order);
}

// Order Tracking - Animate rider movement
function animateRider(riderMarker, startLat, startLng, endLat, endLng, order) {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const elapsed = (now - orderDate) / 1000; // seconds
    const totalTime = 30 * 60; // 30 minutes in seconds
    const progress = Math.min(elapsed / totalTime, 1); // 0 to 1
    
    // Calculate current position
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;
    
    // Update rider position
    riderMarker.setLatLng([currentLat, currentLng]);
    
    // Update status based on progress
    updateTrackingStatus(progress);
    
    // Continue animation if not arrived
    if (progress < 1) {
        setTimeout(() => {
            animateRider(riderMarker, startLat, startLng, endLat, endLng, order);
        }, 2000); // Update every 2 seconds
    } else {
        // Rider has arrived
        updateTrackingStatus(1, true);
    }
}

// Order Tracking - Update tracking status
function updateTrackingStatus(progress, arrived = false) {
    const statusElement = document.querySelector('#trackingStatus');
    if (!statusElement) return;
    
    if (arrived) {
        statusElement.textContent = 'Rider has arrived!';
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            statusDot.style.background = '#4CAF50';
        }
    } else if (progress < 0.3) {
        statusElement.textContent = 'Preparing your order...';
    } else if (progress < 0.6) {
        statusElement.textContent = 'Rider is on the way...';
    } else if (progress < 0.9) {
        statusElement.textContent = 'Rider is nearby...';
    } else {
        statusElement.textContent = 'Almost there!';
    }
}

// Order Tracking - Update ETA
function updateETA(order) {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const elapsed = (now - orderDate) / 60000; // minutes
    const estimatedTotal = 30; // 30 minutes total
    const remaining = Math.max(0, Math.ceil(estimatedTotal - elapsed));
    
    const etaElement = document.querySelector('#estimatedTime');
    if (etaElement) {
        if (remaining > 0) {
            etaElement.textContent = `ETA: ${remaining} min`;
        } else {
            etaElement.textContent = 'Arriving now!';
        }
    }
    
    // Update ETA every minute
    if (remaining > 0) {
        setTimeout(() => updateETA(order), 60000);
    }
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