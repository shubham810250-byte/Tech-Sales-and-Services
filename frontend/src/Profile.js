// src/Profile.js
import React, { useState, useEffect } from 'react';
import './css/Profile.css';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, changePassword, getUserOrders } from './api';

function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    
    // Profile form state
    const [profileForm, setProfileForm] = useState({
        username: '',
        email: '',
        phone: ''
    });
    
    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    useEffect(() => {
        console.log('Profile mounted');
        
        // Debug: Check what's in localStorage
        const storedUser = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        console.log('LocalStorage - user:', storedUser);
        console.log('LocalStorage - isLoggedIn:', isLoggedIn);
        
        // Parse the stored user
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Parsed user:', parsedUser);
                console.log('User ID:', parsedUser.id);
                console.log('User data structure:', Object.keys(parsedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        fetchUserData();
    }, []);
    
    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            // Get user from localStorage
            const storedUser = localStorage.getItem('user');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            
            console.log('Checking auth status:', {
                hasUser: !!storedUser,
                isLoggedIn: isLoggedIn,
                userData: storedUser
            });
            
            // Check if user is logged in
            if (!isLoggedIn || !storedUser) {
                console.log('Not logged in, redirecting to login');
                navigate('/Login');
                return;
            }
            
            let userData;
            try {
                userData = JSON.parse(storedUser);
                console.log('Parsed user data:', userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/Login');
                return;
            }
            
            // Check for user ID - try different possible field names
            const userId = userData.id || userData._id || userData.userId;
            
            if (!userId) {
                console.error('No user ID found in:', userData);
                
                // Show data from localStorage even without API call
                setUser(userData);
                setProfileForm({
                    username: userData.username || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                });
                setLoading(false);
                return;
            }
            
            console.log('Using user ID:', userId);
            
            // Try to fetch user profile from API
            try {
                const profileResult = await getUserProfile(userId);
                console.log('Profile API response:', profileResult);
                
                if (profileResult.success) {
                    setUser(profileResult.user);
                    setProfileForm({
                        username: profileResult.user.username,
                        email: profileResult.user.email,
                        phone: profileResult.user.phone
                    });
                    
                    // Fetch user orders
                    try {
                        const ordersResult = await getUserOrders(userId);
                        console.log('Orders API response:', ordersResult);
                        
                        if (ordersResult.success) {
                            setOrders(ordersResult.orders);
                        }
                    } catch (orderError) {
                        console.error('Error fetching orders:', orderError);
                        // Use dummy orders if API fails
                        setOrders([
                            {
                                id: 'ORD001',
                                date: new Date().toISOString().split('T')[0],
                                items: ['Sample Product 1', 'Sample Product 2'],
                                total: 1999,
                                status: 'Processing'
                            }
                        ]);
                    }
                } else {
                    console.error('Failed to fetch profile:', profileResult.message);
                    // Fallback to localStorage data
                    setUser(userData);
                    setProfileForm({
                        username: userData.username || '',
                        email: userData.email || '',
                        phone: userData.phone || ''
                    });
                }
            } catch (apiError) {
                console.error('API call failed:', apiError);
                // Use localStorage data if API fails
                setUser(userData);
                setProfileForm({
                    username: userData.username || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                });
            }
            
        } catch (error) {
            console.error('Error in fetchUserData:', error);
            
            // Even if everything fails, try to use localStorage data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setProfileForm({
                        username: userData.username || '',
                        email: userData.email || '',
                        phone: userData.phone || ''
                    });
                } catch (e) {
                    console.error('Failed to parse stored user:', e);
                }
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };
    
    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!user || !user.id) {
            alert('Cannot update profile: User ID not found');
            return;
        }
        
        try {
            const result = await updateUserProfile(user.id, profileForm);
            alert(result.message);
            setEditMode(false);
            
            // Update localStorage
            const updatedUser = { ...user, ...profileForm };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
        } catch (error) {
            alert(error.message || 'Failed to update profile');
        }
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!user || !user.id) {
            alert('Cannot change password: User ID not found');
            return;
        }
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (passwordForm.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        try {
            const result = await changePassword(user.id, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            alert(result.message);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
        } catch (error) {
            alert(error.message || 'Failed to change password');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/Login');
    };
    
    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="profile-error">
                <h2>Please login to view your profile</h2>
                <p>You need to be logged in to access your profile.</p>
                <div className="profile-error-buttons">
                    <button onClick={() => navigate('/Login')} className="login-btn">
                        Go to Login
                    </button>
                    <button onClick={() => navigate('/Home')} className="home-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="profile-container">
            {/* Header */}
            <header className="profile-header">
                <div className="logo" onClick={() => navigate('/Home')}>
                    TECH SALES & SERVICES
                </div>
                <nav className="profile-nav">
                    <button onClick={() => navigate('/Home')}>Home</button>
                    <button onClick={() => navigate('/product')}>Products</button>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </header>
            
            <div className="profile-content">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="user-info">
                        <div className="avatar">
                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h3>{user.username || 'User'}</h3>
                        <p>{user.email || 'No email provided'}</p>
                    </div>
                    
                    <nav className="sidebar-nav">
                        <button 
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => setActiveTab('profile')}
                        >
                            📝 My Profile
                        </button>
                        <button 
                            className={activeTab === 'orders' ? 'active' : ''}
                            onClick={() => setActiveTab('orders')}
                        >
                            📦 My Orders
                        </button>
                        <button 
                            className={activeTab === 'password' ? 'active' : ''}
                            onClick={() => setActiveTab('password')}
                        >
                            🔒 Change Password
                        </button>
                        <button 
                            className={activeTab === 'address' ? 'active' : ''}
                            onClick={() => setActiveTab('address')}
                        >
                            📍 Address Book
                        </button>
                    </nav>
                </div>
                
                {/* Main Content */}
                <div className="profile-main">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>My Profile</h2>
                                {!editMode && (
                                    <button 
                                        className="edit-btn"
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                            
                            {editMode ? (
                                <form onSubmit={handleProfileUpdate} className="profile-form">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={profileForm.username}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileForm.email}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button type="submit" className="save-btn">
                                            Save Changes
                                        </button>
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <span className="label">Username:</span>
                                        <span className="value">{user.username || 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Email:</span>
                                        <span className="value">{user.email || 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{user.phone || 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Member Since:</span>
                                        <span className="value">
                                            {user.createdAt ? 
                                                new Date(user.createdAt).toLocaleDateString() : 
                                                'Today'
                                            }
                                        </span>
                                    </div>
                                    {!user.id && (
                                        <div className="detail-item note">
                                            <span className="label">Note:</span>
                                            <span className="value">This is demo data from localStorage</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="profile-section">
                            <h2>My Orders</h2>
                            {orders.length === 0 ? (
                                <div className="empty-orders">
                                    <p>You haven't placed any orders yet.</p>
                                    <button onClick={() => navigate('/product')}>
                                        Shop Now
                                    </button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map((order) => (
                                        <div key={order.id} className="order-card">
                                            <div className="order-header">
                                                <div>
                                                    <h3>Order #{order.id}</h3>
                                                    <p>Placed on: {order.date}</p>
                                                </div>
                                                <span className={`status ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div className="order-items">
                                                <p><strong>Items:</strong> {order.items.join(', ')}</p>
                                            </div>
                                            
                                            <div className="order-footer">
                                                <div className="total">
                                                    <strong>Total:</strong> ₹{order.total.toLocaleString()}
                                                </div>
                                                <button className="view-details">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Change Password Tab */}
                    {activeTab === 'password' && (
                        <div className="profile-section">
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordUpdate} className="password-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        placeholder="Confirm your new password"
                                    />
                                </div>
                                
                                <button type="submit" className="save-btn">
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Address Tab */}
                    {activeTab === 'address' && (
                        <div className="profile-section">
                            <h2>Address Book</h2>
                            <div className="address-card">
                                <h3>Default Shipping Address</h3>
                                <p>No address saved yet.</p>
                                <button className="add-address-btn">
                                    + Add New Address
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;