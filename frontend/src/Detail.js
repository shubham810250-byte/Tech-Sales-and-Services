import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Detail.css';

function Detail() {
  const navigate = useNavigate();
  const location = useLocation();

  const { category, item, image } = location.state || {};

  if (!category || !item) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No product selected</h2>
        <button onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    );
  }

  return (
    <div className="body">
      {/* HEADER - Same as Home page */}
      <header className="site-header">
        <div className="logo">
          <img src="/image/logo.jpg" alt="Logo" />
        </div>

        <nav className="account-nav">
          <a href="#">Orders</a>
          <a href="#">Cart</a>
          <a onClick={() => navigate('/Login')}>Signup</a>
        </nav>
      </header>

     

      <div className="detail-page">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <span>Home / {category} / {item}</span>
        </div>

        <div className="detail-container">
          <div className="detail-image">
            <img src={image} alt={item} />
            <div className="image-thumbnails">
              <img src={image} alt="Thumb 1" />
              <img src={image} alt="Thumb 2" />
              <img src={image} alt="Thumb 3" />
            </div>
          </div>

          <div className="detail-info">
            <h1 className="product-title">{item}</h1>
            <p className="category-name">Category: {category}</p>
            
            <div className="product-rating">
              <span className="stars">★★★★☆</span>
              <span className="rating-text">4.1 out of 5</span>
              <span className="rating-count">(1,234 ratings)</span>
            </div>
            
            <hr className="divider" />
            
            <div className="price-section">
              <span className="price">₹ 999</span>
              <span className="original-price">₹ 1,499</span>
              <span className="discount">(33% off)</span>
            </div>
            
            <p className="offer">Save extra with offers</p>
            
            <div className="description">
              <h3>About this item:</h3>
              <ul>
                <li>High quality {item} available at best price</li>
                <li>Perfect for replacement and repair</li>
                <li>Original manufacturer quality</li>
                <li>1 year warranty included</li>
                <li>Easy installation guide provided</li>
              </ul>
            </div>

            <div className="delivery-info">
              <h3>Delivery options:</h3>
              <p>✓ Free delivery on orders above ₹499</p>
              <p>✓ 2-3 business days delivery</p>
              <p>✓ Cash on delivery available</p>
            </div>

            <div className="detail-actions">
            
             
<button 
  className="buy-now"
  onClick={() => navigate('/order', {
    state: {
      product: {
        name: item,
        price: "₹ 999",
        image: image,
        category: category,
        description: "High quality product"
      },
      quantity: 1
    }
  })}
>
  Buy Now
</button>
             
            </div>
            
            <div className="seller-info">
              <p>Sold by: <strong>TechParts Direct</strong> | Fulfilled by Maxbhi</p>
            </div>
          </div>
        </div>
        
       
      </div>

      {/* FOOTER - Same as Home page */}
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

export default Detail;