import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Order.css';

function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product data from Buy Now click
  const { product, quantity = 1 } = location.state || {};
  
  // Default product if none passed
  const defaultProduct = product || {
    name: "Mobile Display Screen",
    price: "₹ 1,499",
    image: "/image/display.jpg",
    category: "Mobile Parts",
    description: "High quality replacement display screen",
    rating: 4.3,
    discount: "25% off",
    warranty: "1 Year",
    brand: "Generic",
    delivery: "3-5 days"
  };

  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('ORD' + Math.floor(Math.random() * 1000000));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to backend
    const orderData = {
      orderId: orderId,
      customer: formData,
      product: defaultProduct,
      quantity: quantity,
      total: calculateTotal().total,
      date: new Date().toISOString(),
      status: 'Confirmed'
    };
    
    console.log('Order placed:', orderData);
    
    // Store order in localStorage for demo purposes
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    setOrderPlaced(true);
  };

  const calculateTotal = () => {
    const price = parseInt(defaultProduct.price.replace(/[^0-9]/g, ''));
    const subtotal = price * quantity;
    const delivery = subtotal > 499 ? 0 : 50;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + delivery + tax;
    
    return {
      subtotal,
      delivery,
      tax: Math.round(tax),
      total: Math.round(total),
      price: price
    };
  };

  const totals = calculateTotal();

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI Payment';
      default: return 'Cash on Delivery';
    }
  };

  if (orderPlaced) {
    return (
      <div className="body">
        {/* HEADER */}
        <header className="site-header">
          <div className="logo">
            <img src="/image/logo.jpg" alt="Logo" />
          </div>

          <nav className="account-nav">
            <a href="#" onClick={() => navigate('/orders')}>Orders</a>
            <a href="#" onClick={() => navigate('/cart')}>Cart</a>
            <a onClick={() => navigate('/Login')}>Signup</a>
          </nav>
        </header>

        <div className="order-container">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h1>Order Placed Successfully!</h1>
            <p className="order-id">Order ID: <strong>{orderId}</strong></p>
            <p className="order-date">Date: {new Date().toLocaleDateString()}</p>
            
            <div className="order-summary-card">
              <div className="product-info">
                <img src={defaultProduct.image} alt={defaultProduct.name} />
                <div>
                  <h3>{defaultProduct.name}</h3>
                  <p><strong>Category:</strong> {defaultProduct.category}</p>
                  <p><strong>Quantity:</strong> {quantity}</p>
                  <p><strong>Brand:</strong> {defaultProduct.brand || 'Generic'}</p>
                  <p><strong>Warranty:</strong> {defaultProduct.warranty || '1 Year'}</p>
                  <p className="price">{defaultProduct.price}</p>
                  {defaultProduct.discount && (
                    <p className="discount">Discount: {defaultProduct.discount}</p>
                  )}
                </div>
              </div>
              
              <div className="delivery-info">
                <h3>Delivery Address</h3>
                <p><strong>{formData.fullName}</strong></p>
                <p>{formData.address}</p>
                <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                <p>📞 {formData.phone}</p>
                <p>📧 {formData.email}</p>
              </div>
              
              <div className="payment-info">
                <h3>Payment Details</h3>
                <p><strong>Method:</strong> {getPaymentMethodText(formData.paymentMethod)}</p>
                <p><strong>Subtotal:</strong> ₹ {totals.subtotal}</p>
                <p><strong>Delivery:</strong> {totals.delivery === 0 ? 'FREE' : `₹ ${totals.delivery}`}</p>
                <p><strong>Tax (18%):</strong> ₹ {totals.tax}</p>
                <p className="total-amount">Total Amount: ₹ {totals.total}</p>
              </div>
            </div>
            
            <div className="next-steps">
              <h3>What's Next?</h3>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p>Order Confirmation</p>
                  <small>Email sent to {formData.email}</small>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Product Packaging</p>
                  <small>Within 24 hours</small>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Shipped</p>
                  <small>Tracking number will be shared</small>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <p>Delivery</p>
                  <small>{defaultProduct.delivery || '3-5 business days'}</small>
                </div>
              </div>
            </div>
            
            <div className="order-notes">
              <h3>Important Notes:</h3>
              <ul>
                <li>Keep your order ID handy for any queries</li>
                <li>You will receive tracking details via SMS/Email</li>
                <li>For returns, please contact customer support within 7 days</li>
                <li>Warranty: {defaultProduct.warranty || '1 Year'} from date of purchase</li>
              </ul>
            </div>
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
              <button className="btn-secondary" onClick={() => navigate('/orders')}>
                View All Orders
              </button>
              <button className="btn-outline" onClick={() => window.print()}>
                Print Order Details
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-logo">
              <img src="/image/logo.jpg" alt="Logo" />
            </div>
            {/* ... rest of footer same as other pages ... */}
          </div>
          <p className="footer-bottom">© 2025 College Project</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="body">
      {/* HEADER */}
      <header className="site-header">
        <div className="logo">
          <img src="/image/logo.jpg" alt="Logo" />
        </div>

        <nav className="account-nav">
          <a href="#" onClick={() => navigate('/orders')}>Orders</a>
          <a href="#" onClick={() => navigate('/cart')}>Cart</a>
          <a onClick={() => navigate('/Login')}>Signup</a>
        </nav>
      </header>


      {/* ORDER PAGE CONTENT */}
      <div className="order-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span onClick={() => navigate('/list', { state: { category: defaultProduct.category || 'All Products' } })}>
            {defaultProduct.category || 'Products'}
          </span>
          <span>›</span>
          <span className="active">Checkout</span>
        </div>

        <h1 className="page-title">Checkout</h1>

        <div className="order-content">
          {/* Left Column - Delivery & Payment */}
          <div className="order-left">
            {/* Delivery Address */}
            <section className="order-section">
              <h2>1. Delivery Address</h2>
              <form className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                      maxLength="6"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter house no., building, street, area"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter state"
                    />
                  </div>
                </div>
              </form>
            </section>

            {/* Payment Method */}
            <section className="order-section">
              <h2>2. Payment Method</h2>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <div className="payment-content">
                    <span className="payment-title">Cash on Delivery</span>
                    <span className="payment-desc">Pay when you receive the product</span>
                  </div>
                </label>

                

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                  />
                  <div className="payment-content">
                    <span className="payment-title">UPI</span>
                    <span className="payment-desc">Pay via Google Pay, PhonePe, etc.</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-right">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              {/* Product Details */}
              <div className="summary-product">
                <img src={defaultProduct.image} alt={defaultProduct.name} />
                <div className="product-details">
                  <h3>{defaultProduct.name}</h3>
                  <p className="category">{defaultProduct.category}</p>
                  {defaultProduct.brand && (
                    <p className="brand">Brand: {defaultProduct.brand}</p>
                  )}
                  {defaultProduct.warranty && (
                    <p className="warranty">Warranty: {defaultProduct.warranty}</p>
                  )}
                  <div className="quantity-selector">
                    <span>Quantity:</span>
                    <span className="quantity">{quantity}</span>
                  </div>
                </div>
                <div className="product-price">
                  {defaultProduct.price}
                  {defaultProduct.discount && (
                    <span className="discount-badge">{defaultProduct.discount}</span>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>₹ {totals.price}</span>
                </div>
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹ {totals.subtotal}</span>
                </div>
                <div className="price-row">
                  <span>Delivery Charges</span>
                  <span className={totals.delivery === 0 ? 'free' : ''}>
                    {totals.delivery === 0 ? 'FREE' : `₹ ${totals.delivery}`}
                  </span>
                </div>
                <div className="price-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹ {totals.tax}</span>
                </div>
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span>₹ {totals.total}</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="product-details-section">
                <h3>Product Details</h3>
                <p className="description">{defaultProduct.description}</p>
                <div className="product-specs">
                  {defaultProduct.rating && (
                    <div className="spec">
                      <span className="label">Rating:</span>
                      <span className="value">{defaultProduct.rating} ★</span>
                    </div>
                  )}
                  {defaultProduct.delivery && (
                    <div className="spec">
                      <span className="label">Delivery:</span>
                      <span className="value">{defaultProduct.delivery}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="delivery-estimate">
                <h3>Delivery Estimate</h3>
                <p>📦 {defaultProduct.delivery || '3-5 business days'}</p>
                <p>🚚 Free delivery on orders above ₹499</p>
                <p>🔄 Easy returns within 7 days</p>
              </div>

              {/* Terms & Conditions */}
              <div className="terms">
                <p>By placing your order, you agree to our</p>
                <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
              </div>

              {/* Place Order Button */}
              <button 
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={!formData.fullName || !formData.address || !formData.phone || !formData.email || !formData.pincode}
              >
                Place Order - ₹ {totals.total}
              </button>

              {/* Security Info */}
              <div className="security-info">
                <div className="secure-badge">🔒</div>
                <p>Your payment information is secure and encrypted</p>
              </div>
            </div>

            {/* Need Help Section */}
            <div className="need-help">
              <h3>Need Help?</h3>
              <p>📞 Call us: 1800-123-4567</p>
              <p>💬 Chat with us (9 AM - 9 PM)</p>
              <p>📧 Email: support@maxbhi.com</p>
              <p>🕒 24/7 Customer Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <img src="/image/logo.jpg" alt="Logo" />
          </div>

          <div className="footer-section">
            <button className="footer-title">
              Customer Service <span>+</span>
            </button>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              Contact Us <span>+</span>
            </button>
            <ul className="footer-links">
              <li><a href="#">Email Us</a></li>
              <li><a href="#">Call Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              Policies <span>+</span>
            </button>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              About Us <span>+</span>
            </button>
            <ul className="footer-links">
              <li><a href="#">Company Info</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <p>Follow Us</p>
            <a href="#">FB</a>
            <a href="#">X</a>
            <a href="#">IG</a>
            <a href="#">YT</a>
          </div>
        </div>

        <p className="footer-bottom">© 2025 College Project</p>
      </footer>
    </div>
  );
}

export default Order;