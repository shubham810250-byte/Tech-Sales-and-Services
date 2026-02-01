const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// Replace CORS config with:
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tranquil-blini-a46bf7.netlify.app',
    'https://tech-sales-and-services-twmw.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Database connection with status handling
let isDbConnected = false;

const connectDB = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');
        
        // Simple connection for MongoDB 6+
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tech-store');
        
        isDbConnected = true;
        console.log('✅ MongoDB connected successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        
    } catch (error) {
        isDbConnected = false;
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('\n💡 Start MongoDB first:');
        console.log('   Windows: Open new cmd as admin -> mongod');
        console.log('   Mac/Linux: sudo systemctl start mongod');
        
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

// 1. Auth Middleware (for protecting routes in future)
const authMiddleware = (req, res, next) => {
    // This middleware will be used to check if user is logged in
    // For now, it just passes through
    next();
};

// 2. Validation Middleware
const validateRegistration = (req, res, next) => {
    const { username, email, phone, password } = req.body;
    
    // Check if all fields are provided
    if (!username || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: username, email, phone, password'
        });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    
    // Validate phone (simple check for 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Phone number must be 10 digits'
        });
    }
    
    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }
    
    next();
};

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Both username and password are required'
        });
    }
    
    next();
};

// 3. Database Check Middleware
const checkDatabase = (req, res, next) => {
    if (!isDbConnected) {
        return res.status(503).json({
            success: false,
            message: 'Database not available. Please try again later.'
        });
    }
    next();
};

// User Schema
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const User = mongoose.model('User', UserSchema);

// ============ ROUTES ============

// 1. HEALTH CHECK ROUTE
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// 2. REGISTRATION ROUTE
app.post('/api/register', 
    checkDatabase,
    validateRegistration,
    async (req, res) => {
        try {
            const { username, email, phone, password } = req.body;
            
            console.log(`📝 Registration attempt for: ${username}`);
            
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });
            
            if (existingUser) {
                console.log(`❌ User already exists: ${email} or ${username}`);
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email or username'
                });
            }
            
            // Create new user
            const newUser = new User({
                username,
                email,
                phone,
                password // In real app, hash this with bcrypt
            });
            
            await newUser.save();
            
            console.log(`✅ User registered successfully: ${username}`);
            
            res.status(201).json({
                success: true,
                message: 'Registration successful!',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    phone: newUser.phone
                }
            });
            
        } catch (error) {
            console.error('❌ Registration error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error during registration',
                error: error.message
            });
        }
    }
);

// 3. LOGIN ROUTE
app.post('/api/login', 
    checkDatabase,
    validateLogin,
    async (req, res) => {
        try {
            const { username, password } = req.body;
            
            console.log(`🔐 Login attempt for: ${username}`);
            
            // Find user by username or email
            const user = await User.findOne({
                $or: [
                    { username: username },
                    { email: username }
                ]
            });
            
            // If user not found
            if (!user) {
                console.log(`❌ User not found: ${username}`);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            // Check password (in real app, use bcrypt.compare)
            if (user.password !== password) {
                console.log(`❌ Invalid password for: ${username}`);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            console.log(`✅ Login successful for: ${username}`);
            
            res.json({
                success: true,
                message: 'Login successful!',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                }
            });
            
        } catch (error) {
            console.error('❌ Login error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error during login',
                error: error.message
            });
        }
    }
);

// 4. TEST USER CREATION ROUTE (for testing)
app.post('/api/test-user', checkDatabase, async (req, res) => {
    try {
        // Create a test user
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123'
        });
        
        await testUser.save();
        
        res.json({
            success: true,
            message: 'Test user created',
            user: {
                id: testUser._id,
                username: testUser.username,
                email: testUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating test user',
            error: error.message
        });
    }
});

// 5. GET ALL USERS ROUTE (for testing)
app.get('/api/users', checkDatabase, async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});
// Add these routes to your existing server.js

// 6. GET USER PROFILE ROUTE
app.get('/api/user/profile', checkDatabase, async (req, res) => {
    try {
        // In real app, get user ID from JWT token
        // For now, we'll use query parameter or return all users (for demo)
        const userId = req.query.userId;
        
        let user;
        if (userId) {
            user = await User.findById(userId, '-password');
        } else {
            // Return first user for demo
            user = await User.findOne({}, '-password');
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
        
    } catch (error) {
        console.error('❌ Profile fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// 7. UPDATE USER PROFILE ROUTE
// Update the GET USER PROFILE route in server.js
app.get('/api/user/profile', checkDatabase, async (req, res) => {
    try {
        // Get user ID from query parameter OR request body
        const userId = req.query.userId || req.body.userId;
        
        console.log('Profile request for user ID:', userId);
        
        if (!userId) {
            // For testing, return first user
            const user = await User.findOne({}, '-password');
            if (user) {
                return res.json({
                    success: true,
                    user: user
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        }
        
        // Try to find user by ID
        let user;
        try {
            user = await User.findById(userId, '-password');
        } catch (error) {
            // If not found by ID, try by username or email
            user = await User.findOne({
                $or: [
                    { username: userId },
                    { email: userId }
                ]
            }, '-password');
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
        
    } catch (error) {
        console.error('❌ Profile fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// 8. CHANGE PASSWORD ROUTE
app.put('/api/user/change-password/:id', checkDatabase, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check current password
        if (user.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('❌ Password change error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
});

// 9. GET USER ORDERS (dummy data for now)
app.get('/api/user/orders/:userId', checkDatabase, async (req, res) => {
    try {
        // In real app, fetch from Orders collection
        // For demo, return dummy data
        const dummyOrders = [
            {
                id: 'ORD001',
                date: '2024-01-15',
                items: ['iPhone Screen', 'Laptop Battery'],
                total: 19998,
                status: 'Delivered'
            },
            {
                id: 'ORD002',
                date: '2024-01-10',
                items: ['Charging Cable'],
                total: 499,
                status: 'Processing'
            },
            {
                id: 'ORD003',
                date: '2024-01-05',
                items: ['Phone Case', 'Screen Protector'],
                total: 1299,
                status: 'Shipped'
            }
        ];
        
        res.json({
            success: true,
            orders: dummyOrders
        });
        
    } catch (error) {
        console.error('❌ Orders fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});
// Add before app.listen()
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
     console.log(`🌐 Backend URL: https://tech-sales-and-services-twmw.onrender.com`);
  console.log(`🌐 Frontend URL: https://tranquil-blini-a46bf7.netlify.app`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Register: POST http://localhost:${PORT}/api/register`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/login`);
    console.log('=======================================');
    console.log(isDbConnected ? '✅ Database connected' : '⚠️  Database not connected');
    
    
});