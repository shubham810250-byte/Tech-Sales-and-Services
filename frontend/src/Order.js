import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Order.css';
import { createOrder } from './api';

function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product data from Buy Now click
  const { product, quantity = 1 } = location.state || {};
  
  // Default product if none passed
  const defaultProduct = product || {
    name: "Mobile Display Screen",
    price: 1499,
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
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get logged in user
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      setCurrentUser(user);
      
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.address || !formData.phone || 
        !formData.email || !formData.pincode) {
      setError('Please fill all required fields');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate pincode
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare order data for backend
      const orderData = {
        userId: currentUser?.id || null,
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        products: [{
          name: defaultProduct.name,
          price: defaultProduct.price,
          image: defaultProduct.image,
          category: defaultProduct.category,
          brand: defaultProduct.brand || 'Generic',
          warranty: defaultProduct.warranty || '1 Year',
          quantity: quantity
        }],
        paymentMethod: formData.paymentMethod,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        tax: totals.tax,
        total: totals.total,
        estimatedDelivery: defaultProduct.delivery || '3-5 days'
      };

      console.log('Sending order data:', orderData);
      
      // Send to backend
      const result = await createOrder(orderData);
      
      if (result.success) {
        // Store order in localStorage for quick access
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(result.order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        setOrderDetails(result.order);
        setOrderPlaced(true);
      } else {
        setError(result.message || 'Failed to place order');
      }
      
    } catch (error) {
      console.error('Order error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      
      // Fallback to localStorage if backend fails
      const orderId = 'ORD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
      const fallbackOrder = {
        orderId: orderId,
        customer: formData,
        products: [{
          name: defaultProduct.name,
          price: defaultProduct.price,
          image: defaultProduct.image,
          category: defaultProduct.category,
          brand: defaultProduct.brand || 'Generic',
          warranty: defaultProduct.warranty || '1 Year',
          quantity: quantity
        }],
        paymentMethod: formData.paymentMethod,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        tax: totals.tax,
        total: totals.total,
        status: 'Confirmed',
        date: new Date().toISOString(),
        estimatedDelivery: defaultProduct.delivery || '3-5 days'
      };
      
      // Store in localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(fallbackOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      setOrderDetails(fallbackOrder);
      setOrderPlaced(true);
      
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const price = typeof defaultProduct.price === 'number' 
      ? defaultProduct.price 
      : parseInt(String(defaultProduct.price).replace(/[^0-9]/g, '')) || 1499;
    
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

  // Format price to display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹ ${price.toLocaleString()}`;
    }
    return price;
  };

  if (orderPlaced && orderDetails) {
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
            {currentUser ? (
              <a onClick={() => navigate('/profile')}>My Account</a>
            ) : (
              <a onClick={() => navigate('/Login')}>Signup</a>
            )}
          </nav>
        </header>

        <div className="order-container">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h1>Order Placed Successfully!</h1>
            <p className="order-id">Order ID: <strong>{orderDetails.orderId}</strong></p>
            <p className="order-date">Date: {new Date(orderDetails.date || Date.now()).toLocaleDateString()}</p>
            
            {error && (
              <div className="error-notice">
                <p>⚠️ Note: Order saved locally (Backend connection failed)</p>
              </div>
            )}
            
            <div className="order-summary-card">
              <div className="product-info">
                <img src={orderDetails.products[0]?.image || defaultProduct.image} 
                     alt={orderDetails.products[0]?.name} />
                <div>
                  <h3>{orderDetails.products[0]?.name}</h3>
                  <p><strong>Category:</strong> {orderDetails.products[0]?.category}</p>
                  <p><strong>Quantity:</strong> {orderDetails.products[0]?.quantity || quantity}</p>
                  <p><strong>Brand:</strong> {orderDetails.products[0]?.brand || 'Generic'}</p>
                  <p><strong>Warranty:</strong> {orderDetails.products[0]?.warranty || '1 Year'}</p>
                  <p className="price">₹ {orderDetails.products[0]?.price || defaultProduct.price}</p>
                </div>
              </div>
              
              <div className="delivery-info">
                <h3>Delivery Address</h3>
                <p><strong>{orderDetails.customer.fullName}</strong></p>
                <p>{orderDetails.customer.address}</p>
                <p>{orderDetails.customer.city}, {orderDetails.customer.state} - {orderDetails.customer.pincode}</p>
                <p>📞 {orderDetails.customer.phone}</p>
                <p>📧 {orderDetails.customer.email}</p>
              </div>
              
              <div className="payment-info">
                <h3>Payment Details</h3>
                <p><strong>Method:</strong> {getPaymentMethodText(orderDetails.paymentMethod)}</p>
                <p><strong>Subtotal:</strong> ₹ {orderDetails.subtotal}</p>
                <p><strong>Delivery:</strong> {orderDetails.delivery === 0 ? 'FREE' : `₹ ${orderDetails.delivery}`}</p>
                <p><strong>Tax (18%):</strong> ₹ {orderDetails.tax}</p>
                <p className="total-amount">Total Amount: ₹ {orderDetails.total}</p>
                <p><strong>Status:</strong> <span className="status-badge">{orderDetails.status}</span></p>
              </div>
            </div>
            
            <div className="next-steps">
              <h3>What's Next?</h3>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p>Order Confirmation</p>
                  <small>Email sent to {orderDetails.customer.email}</small>
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
                  <small>{orderDetails.estimatedDelivery || '3-5 business days'}</small>
                </div>
              </div>
            </div>
            
            <div className="order-notes">
              <h3>Important Notes:</h3>
              <ul>
                <li>Keep your order ID handy for any queries</li>
                <li>You will receive tracking details via SMS/Email</li>
                <li>For returns, please contact customer support within 7 days</li>
                <li>Warranty: {orderDetails.products[0]?.warranty || '1 Year'} from date of purchase</li>
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
          {/* ... footer content ... */}
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
          {currentUser ? (
            <a onClick={() => navigate('/profile')}>My Account</a>
          ) : (
            <a onClick={() => navigate('/Login')}>Login/Signup</a>
          )}
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

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Login Reminder */}
        {!currentUser && (
          <div className="login-reminder">
            <p>📝 <strong>You're not logged in.</strong> Your order will be saved locally. 
            <a onClick={() => navigate('/Login')}> Login</a> to save orders to your account.</p>
          </div>
        )}

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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading}
                  />
                  <div className="payment-content">
                    <span className="payment-title">Cash on Delivery</span>
                    <span className="payment-desc">Pay when you receive the product</span>
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
                  {formatPrice(defaultProduct.price)}
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

              {/* Place Order Button */}
              <button 
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={!formData.fullName || !formData.address || !formData.phone || 
                         !formData.email || !formData.pincode || loading}
              >
                {loading ? 'Processing...' : `Place Order - ₹ ${totals.total}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        {/* ... footer content ... */}
      </footer>
    </div>
  );
}

export default Order;