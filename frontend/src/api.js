// src/api.js
const API_BASE_URL = 'http://localhost:5000/api',
'https://tech-sales-and-services-twmw.onrender.com/api';

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
        
        // Check if response was successful
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
        console.log('Sending login request:', credentials); // Debug
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        
        console.log('Response status:', response.status); // Debug
        
        const result = await response.json();
        console.log('Response data:', result); // Debug
        
        // Check if response was successful
        if (!response.ok) {
            throw new Error(result.message || `Login failed with status ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
};
// Add these functions to your api.js

// Get user profile
// Update the getUserProfile function in api.js
export const getUserProfile = async (userId) => {
    try {
        console.log('Fetching profile for user ID:', userId);
        
        // Try both GET and POST methods
        const response = await fetch(`${API_BASE_URL}/user/profile?userId=${userId}`);
        
        console.log('Profile response status:', response.status);
        
        const result = await response.json();
        console.log('Profile response data:', result);
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch profile');
        }
        
        return result;
    } catch (error) {
        console.error('Profile fetch error:', error);
        
        // Fallback: try POST request
        try {
            console.log('Trying POST request as fallback...');
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
            
            const result = await response.json();
            if (response.ok) {
                return result;
            }
        } catch (postError) {
            console.error('POST fallback also failed:', postError);
        }
        
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

// Get user orders
export const getUserOrders = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/orders/${userId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch orders');
        }
        
        return result;
    } catch (error) {
        console.error('Orders fetch error:', error);
        throw error;
    }
};