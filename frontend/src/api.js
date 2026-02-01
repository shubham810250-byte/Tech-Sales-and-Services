// src/api.js
// src/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tech-sales-and-services-twmw.onrender.com/api'
  : 'http://localhost:5000/api';

// Rest of the code...
// Check server health
export const checkServerHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Server health check failed:', error);
        throw error;
    }
};

// Register user
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Registration failed');
        }
        
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Login user
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }
        
        return result;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Get user profile
export const getUserProfile = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile?userId=${userId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch profile');
        }
        
        return result;
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update profile');
        }
        
        return result;
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
};

// Change password
export const changePassword = async (userId, passwordData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/change-password/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to change password');
        }
        
        return result;
    } catch (error) {
        console.error('Password change error:', error);
        throw error;
    }
};

// Add these to your api.js

// Create order
export const createOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 100));
            throw new Error('Server returned non-JSON response');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create order');
        }
        
        return result;
    } catch (error) {
        console.error('Create order error:', error);
        throw error;
    }
};

// Get user orders
export const getUserOrders = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch orders');
        }
        
        return result;
    } catch (error) {
        console.error('Get orders error:', error);
        throw error;
    }
};

// Get order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch order');
        }
        
        return result;
    } catch (error) {
        console.error('Get order error:', error);
        throw error;
    }
};
// Get all products
export const getAllProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get products by category
export const getProductsByCategory = async (category) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${category}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching category products:', error);
        throw error;
    }
};

// Get single product
export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/product/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};
