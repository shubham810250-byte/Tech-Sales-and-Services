import React from 'react';
import './css/Home.css';
import { useNavigate } from 'react-router-dom';
import categoriesData from './data/categoriesData';

function Home() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate('/List', {
      state: {
        category: category.title,
        items: category.items,
        categoryImage: category.items[0]?.image // First item's image as category image
      }
    });
  };

  const handleProductClick = (category, item) => {
    navigate('/detail', {
      state: {
        category: category.title,
        item: item.name,
        image: item.image,
        price: item.price,
        rating: item.rating
      }
    });
  };

  return (
    <div className="body">
      
<header className="site-header">
    <div className="logo">
        <img src="/image/logo.jpg" alt="Logo" />
    </div>

    <nav className="account-nav">
        <a href="#">Orders</a>
        <a href="#">Cart</a>
        
        {/* Check if user is logged in */}
        {localStorage.getItem('isLoggedIn') ? (
            <div className="user-menu">
                <a onClick={() => navigate('/profile')}>
                    👤 {JSON.parse(localStorage.getItem('user'))?.username || 'My Account'}
                </a>
                <div className="dropdown">
                    <a onClick={() => navigate('/profile')}>Profile</a>
                    <a onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('isLoggedIn');
                        window.location.reload();
                    }}>Logout</a>
                </div>
            </div>
        ) : (
            <a onClick={() => navigate('/Login')}>Signup/Login</a>
        )}
    </nav>
</header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-text">
           
            <h1>The Website For</h1>
            <p>For Gadgets Spare Parts & Accessories</p>
            
            {/* Quick Categories */}
            <div className="quick-categories">
              <button onClick={() => handleCategoryClick(categoriesData[0])}>
                Mobile 
              </button>
              <button onClick={() => handleCategoryClick(categoriesData[1])}>
                Laptop 
              </button>
              <button onClick={() => navigate('/product')}>
                All Products
              </button>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://media.istockphoto.com/id/1454295784/photo/laptop-and-smartphone-display-on-white-background-workspace-mock-up-design.webp?a=1&b=1&s=612x612&w=0&k=20&c=hL4oAgOJ1L3zyNInsiQpNsBQE6jTMgyMFV4Oh7alVWc="
              alt="Mobile Spare Parts"
            />
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="featured-categories">
        <h2>Shop by Category</h2>
        <p>Browse our wide range of spare parts and accessories</p>
        
        <div className="featured-categories-grid">
          {categoriesData.map((category, index) => (
            <div 
              key={index}
              className="featured-category-card"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-card-image">
                <img src={category.items[0]?.image || "/image/placeholder.jpg"} alt={category.title} />
              </div>
              <div className="category-card-content">
                <h3>{category.title}</h3>
                <p>{category.items.length} products available</p>
                <button className="explore-btn">
                  Explore All →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SECTION (JSON BASED) */}
      <section className="categories-section">
        {categoriesData.map((category, index) => (
          <div key={index}>
            <div className="category-header-row">
              <h3 className="category-title">{category.title}</h3>
              <button 
                className="view-all-btn"
                onClick={() => handleCategoryClick(category)}
              >
                View All →
              </button>
            </div>

            <div className="category-grid">
              {category.items.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="category-item"
                  onClick={() => handleProductClick(category, item)}
                >
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-price">{item.price || '₹ 999'}</p>
                    <div className="item-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(item.rating || 4))}
                        {'☆'.repeat(5 - Math.floor(item.rating || 4))}
                      </span>
                      <span className="rating-text">{item.rating || '4.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <p>Best selling products this week</p>
        
        <div className="featured-products-grid">
          {categoriesData.flatMap(category => 
            category.items.slice(0, 4)
          ).map((item, index) => (
            <div 
              key={index}
              className="featured-product-card"
              onClick={() => handleProductClick(categoriesData[0], item)}
            >
              <div className="product-badge">Bestseller</div>
              <img src={item.image} alt={item.name} />
              <div className="product-info">
                <h4>{item.name}</h4>
                <div className="price-section">
                  <span className="price">{item.price || '₹ 999'}</span>
                  <span className="original-price">₹ 1,499</span>
                </div>
                <button className="quick-add">Checkout</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="why-choose-us">
        <h2>Why Choose Maxbhi?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders above ₹499</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔧</div>
            <h3>Genuine Parts</h3>
            <p>100% original spare parts</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Technical assistance available</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💯</div>
            <h3>1 Year Warranty</h3>
            <p>On all products</p>
          </div>
        </div>
      </section>

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

export default Home;