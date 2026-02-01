import React, { useState } from 'react';
import './css/Login.css';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api';

function Reg() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear errors when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        const { username, email, phone, password } = formData;
        
        if (!username || !email || !phone || !password) {
            setError('All fields are required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return false;
        }
        
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setError('Phone number must be 10 digits');
            return false;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await registerUser(formData);
            
            if (result.success) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/Login');
                }, 2000);
            }
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <header className="site-header">
                <div className="logo">TECH SALES & SERVICES</div>
                <nav className="account-nav">
                    <a onClick={() => navigate('/home')}>Home</a>
                    <a onClick={() => navigate('/Login')}>Login</a>
                    <a href="#">Help</a>
                </nav>
            </header>

            <section className="login-wrapper">
                <div className="login-card">
                    <h2>Register</h2>
                    
                    {error && (
                        <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>
                            ✅ {success}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="username"
                                placeholder="Username" 
                                required 
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Email" 
                                required 
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input 
                                type="tel" 
                                name="phone"
                                placeholder="Phone Number (10 digits)" 
                                required 
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Password (min 6 characters)" 
                                required 
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>
                    
                    <p className="signup-text">Already have an account?</p>
                    <a onClick={() => navigate('/Login')} className="signup-link">
                        LOGIN
                    </a>
                </div>
            </section>
        </div>
    );
}

export default Reg;