// ========== GLOBAL VARIABLES ==========
let products = JSON.parse(localStorage.getItem('act4_products')) || [];
let cart = JSON.parse(localStorage.getItem('act4_cart')) || [];
const ADMIN_PASSWORD = "Brianytg1"; // CHANGE THIS TO YOUR SECRET PASSWORD!
const WHATSAPP_NUMBER = "237678748517"; // CHANGE TO YOUR WHATSAPP NUMBER

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    if (document.getElementById('products-container')) {
        displayProducts();
    }
    
    if (document.getElementById('cart-items')) {
        displayCart();
    }
    
    if (window.location.pathname.includes('admin.html')) {
        checkAdminSession();
    }
});

// ========== PRODUCT FUNCTIONS ==========
function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Coming Soon!</h3>
                <p>We're working on adding amazing products for you.</p>
                <p>Please check back later.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <p class="price">$${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${index})">
                Add to Cart
            </button>
        `;
        container.appendChild(card);
    });
}

// ========== IMAGE UPLOAD FUNCTIONS ==========
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large! Max 5MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Store the image data
        const imageData = e.target.result;
        document.getElementById('product-image-data').value = imageData;
        
        // Show preview
        const preview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        previewImg.src = imageData;
        preview.style.display = 'block';
        
        // Hide upload button hint
        document.querySelector('.upload-hint').style.display = 'none';
        
        showToast('Image uploaded successfully!');
    };
    
    reader.readAsDataURL(file);
}

function removeImage() {
    // Clear the file input
    document.getElementById('product-image-file').value = '';
    
    // Clear the hidden input
    document.getElementById('product-image-data').value = '';
    
    // Hide preview
    document.getElementById('image-preview').style.display = 'none';
    
    // Show upload hint again
    document.querySelector('.upload-hint').style.display = 'block';
}

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========== CART FUNCTIONS ==========
function addToCart(productIndex) {
    const product = products[productIndex];
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    localStorage.setItem('act4_cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Added to cart!');
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = total;
    }
}

function displayCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-state">Your cart is empty</div>';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} each
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
            <div>$${itemTotal.toFixed(2)}</div>
            <div class="remove-btn" onclick="removeFromCart(${index})">✖</div>
        `;
        container.appendChild(cartItem);
    });
    
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        localStorage.setItem('act4_cart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('act4_cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// ========== WHATSAPP ORDER ==========
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const name = document.getElementById('customer-name')?.value;
    const phone = document.getElementById('customer-phone')?.value;
    const address = document.getElementById('customer-address')?.value;
    
    if (!name || !phone || !address) {
        alert('Please fill in all your details');
        return;
    }
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 5; // $5 shipping
    
    // Create message
    let message = `🛍️ *NEW ORDER - ACT4*\n\n`;
    message += `👤 *Name:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    message += `📍 *Address:* ${address}\n\n`;
    message += `📦 *ITEMS:*\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n📊 *TOTAL: $${total.toFixed(2)}*`;
    
    // Open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    
    // Clear cart
    cart = [];
    localStorage.setItem('act4_cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// ========== ADMIN FUNCTIONS ==========
function checkAdminPassword() {
    const password = document.getElementById('admin-password')?.value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('act4_admin', 'loggedin');
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-controls').style.display = 'block';
        displayAdminProducts();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function checkAdminSession() {
    if (sessionStorage.getItem('act4_admin') === 'loggedin') {
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-controls').style.display = 'block';
        displayAdminProducts();
    }
}

function logout() {
    sessionStorage.removeItem('act4_admin');
    window.location.reload();
}

function showAddForm() {
    document.getElementById('product-form').style.display = 'block';
    // Reset form
    clearForm();
}

function hideForm() {
    document.getElementById('product-form').style.display = 'none';
    clearForm();
}

function clearForm() {
    document.getElementById('product-name').value = '';
    document.getElementById('product-desc').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-cat').value = 'clothes';
    document.getElementById('product-image-file').value = '';
    document.getElementById('product-image-data').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.querySelector('.upload-hint').style.display = 'block';
}

function saveProduct() {
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-desc').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-cat').value;
    const imageData = document.getElementById('product-image-data').value;
    
    if (!name || !desc || !price) {
        showToast('Please fill in all required fields');
        return;
    }
    
    products.push({
        name,
        desc,
        price: parseFloat(price),
        category,
        image: imageData || 'https://via.placeholder.com/300' // Use uploaded image or placeholder
    });
    
    localStorage.setItem('act4_products', JSON.stringify(products));
    hideForm();
    displayAdminProducts();
    showToast('Product saved successfully!');
}

function displayAdminProducts() {
    const container = document.getElementById('admin-products');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products yet. Add your first product!</p>';
        return;
    }
    
    container.innerHTML = '';
    products.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'admin-product';
        div.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/60'}" alt="${product.name}" class="admin-product-image">
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p>$${product.price} - ${product.category}</p>
            </div>
            <div class="admin-product-actions">
                <button onclick="deleteProduct(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteProduct(index) {
    if (confirm('Delete this product?')) {
        products.splice(index, 1);
        localStorage.setItem('act4_products', JSON.stringify(products));
        displayAdminProducts();
        displayProducts(); // Update main page
        showToast('Product deleted');
    }
}