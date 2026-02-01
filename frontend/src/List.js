import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/List.css";
import { 
  mobileProducts, 
  laptopProducts, 
  allProducts,
  getProductsByCategory 
} from "./data/productData";

function List() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get category data passed from Home page
  const { category, items } = location.state || {};

  // Determine which data to show based on category
  const displayData = items || getProductsByCategory(category);
  const defaultCategory = category || "All Products";

  const handleProductClick = (product) => {
    navigate("/detail", {
      state: {
        category: product.category || defaultCategory,
        item: product.name,
        image: product.image,
        price: product.price,
        rating: product.rating,
        discount: product.discount,
        description: product.description,
        warranty: product.warranty,
        brand: product.brand,
        delivery: product.delivery
      },
    });
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate("/order", {
      state: {
        product: {
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category || defaultCategory,
          description: product.description || "High quality replacement part",
          warranty: product.warranty,
          brand: product.brand
        },
        quantity: 1,
      },
    });
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent card click from triggering
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="body">
      {/* HEADER */}
      <header className="site-header">
        <div className="logo">
          <img src="/image/logo.jpg" alt="Logo" />
        </div>

        <nav className="account-nav">
          <a href="#">Orders</a>
          <a onClick={() => navigate("/Login")}>Signup</a>
        </nav>
      </header>

      

      {/* LIST PAGE CONTENT */}
      <div className="list-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span onClick={() => navigate("/")}>Home</span>
          <span>›</span>
          <span className="active">{defaultCategory}</span>
        </div>

        {/* Category Header */}
        <div className="category-header">
          <h1>{defaultCategory}</h1>
          <p>{displayData.length} products available</p>

          {/* Quick Category Navigation */}
          <div className="category-tabs">
            <button
              className={defaultCategory.includes("Mobile") ? "active" : ""}
              onClick={() =>
                navigate("/list", {
                  state: { category: "Mobile Parts" },
                })
              }
            >
              Mobile Parts ({mobileProducts.length})
            </button>
            <button
              className={defaultCategory.includes("Laptop") ? "active" : ""}
              onClick={() =>
                navigate("/list", {
                  state: { category: "Laptop Parts" },
                })
              }
            >
              Laptop Parts ({laptopProducts.length})
            </button>
            <button
              className={defaultCategory === "All Products" ? "active" : ""}
              onClick={() =>
                navigate("/list", {
                  state: { category: "All Products" },
                })
              }
            >
              All Products ({allProducts.length})
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {displayData.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.discount && (
                  <div className="discount-badge">{product.discount}</div>
                )}
                <div className="wishlist-icon">♡</div>
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>

                <div className="product-rating">
                  <span className="stars">
                    {"★".repeat(Math.floor(product.rating))}
                    {"☆".repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span className="rating-value">{product.rating} ★</span>
                </div>

                <div className="product-price">
                  <span className="current-price">{product.price}</span>
                  <span className="original-price">₹ 1,999</span>
                </div>

                <div className="product-offers">
                  <span className="offer">Free Delivery</span>
                  <span className="offer">{product.warranty} Warranty</span>
                </div>

                <div className="product-delivery">
                  <span className="delivery-badge">🚚 {product.delivery}</span>
                </div>

                <div className="product-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="buy-now-btn"
                    onClick={(e) => handleBuyNow(product, e)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {displayData.length > 0 && (
          <div className="load-more">
            <button className="load-more-btn">Load More Products</button>
          </div>
        )}

        {/* No Products Message */}
        {displayData.length === 0 && (
          <div className="no-products">
            <p>No products found in this category.</p>
            <button onClick={() => navigate("/list", { state: { category: "All Products" } })}>
              Browse All Products
            </button>
          </div>
        )}
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
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Track Order</a>
              </li>
              <li>
                <a href="#">Returns</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              Contact Us <span>+</span>
            </button>
            <ul className="footer-links">
              <li>
                <a href="#">Email Us</a>
              </li>
              <li>
                <a href="#">Call Support</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              Policies <span>+</span>
            </button>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms & Conditions</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <button className="footer-title">
              About Us <span>+</span>
            </button>
            <ul className="footer-links">
              <li>
                <a href="#">Company Info</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
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

export default List;