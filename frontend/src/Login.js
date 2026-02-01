import React, { useState } from 'react';
import './css/Login.css';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './api';

function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await loginUser(credentials);
            
            console.log('Login response:', result); // Debug log
            
            // Updated check for success
            if (result.success && result.message === 'Login successful!') {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                console.log('Login successful, navigating to Home...');
                navigate('/Home');
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <header className="site-header">
                <div className="logo">TECH SALES & SERVICES</div>
                <nav className="account-nav">
                    <a onClick={() => navigate('/Home')}>Home</a>
                    <a onClick={() => navigate('/Reg')}>Register</a>
                    <a href="#">Help</a>
                </nav>
            </header>

            <section className="login-wrapper">
                <div className="login-card">
                    <h2>Login</h2>
                    
                    {error && (
                        <div className="error-message" style={{color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px'}}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="username"
                                placeholder="Username or Email" 
                                required 
                                value={credentials.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Password" 
                                required 
                                value={credentials.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="forgot">
                            <a href="#">Forgot password?</a>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                    </form>
                    
                    <p className="signup-text">Don't have account</p>
                    <a href="#" className="signup-link" onClick={() => navigate('/Reg')}>
                        SIGN UP
                    </a>
                </div>
            </section>
        </div>
    );
}

export default Login;