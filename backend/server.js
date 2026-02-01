const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
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
app.use(express.json()); // ✅ ADD THIS - Parse JSON bodies

// Database connection with status handling
let isDbConnected = false;

const connectDB = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');
        
        // Use MONGODB_URI from environment variables
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tech-store';
        console.log('Connecting to:', mongoURI.replace(/\/\/.*@/, '//***@')); // Hide password
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        isDbConnected = true;
        console.log('✅ MongoDB connected successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        
    } catch (error) {
        isDbConnected = false;
        console.error('❌ MongoDB connection failed:', error.message);
        
        // Don't retry if we're in production and MongoDB URI is missing
        if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is required in production!');
        } else {
            console.log('💡 Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        }
    }
};

// Connect to MongoDB
connectDB();

// 1. Auth Middleware (for protecting routes in future)
const authMiddleware = (req, res, next) => {
    // This middleware will be used to check if user is logged in
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

// 3. Database Check Middleware - MODIFIED to allow operation even if DB is down
const checkDatabase = (req, res, next) => {
    // Always allow the request to proceed
    // We'll handle DB errors in individual route handlers
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Tech Sales & Services API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            register: 'POST /api/register',
            login: 'POST /api/login',
            profile: 'GET /api/user/profile?userId=ID'
        }
    });
});

// 1. HEALTH CHECK ROUTE
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. REGISTRATION ROUTE
app.post('/api/register', validateRegistration, async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        
        console.log(`📝 Registration attempt for: ${username}`);
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available. Please try again later.'
            });
        }
        
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 3. LOGIN ROUTE
app.post('/api/login', validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log(`🔐 Login attempt for: ${username}`);
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available. Please try again later.'
            });
        }
        
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 4. GET USER PROFILE ROUTE
app.get('/api/user/profile', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        console.log('Profile request for user ID:', userId);
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available.'
            });
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required as query parameter: ?userId=ID'
            });
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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ Profile fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 5. UPDATE USER PROFILE ROUTE
app.put('/api/user/profile/:id', async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        const userId = req.params.id;
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available.'
            });
        }
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
        
    } catch (error) {
        console.error('❌ Profile update error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 6. CHANGE PASSWORD ROUTE
app.put('/api/user/change-password/:id', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available.'
            });
        }
        
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 7. GET USER ORDERS
app.get('/api/user/orders/:userId', async (req, res) => {
    try {
        // Dummy orders data
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Add these routes to your server.js after user routes

// Order Schema
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    products: [{
        name: String,
        price: Number,
        image: String,
        category: String,
        brand: String,
        warranty: String,
        quantity: Number
    }],
    paymentMethod: String,
    subtotal: Number,
    delivery: Number,
    tax: Number,
    total: Number,
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now },
    estimatedDelivery: String
});

const Order = mongoose.model('Order', OrderSchema);

// 8. CREATE ORDER ROUTE
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, customer, products, paymentMethod, subtotal, delivery, tax, total, estimatedDelivery } = req.body;
        
        // Generate unique order ID
        const orderId = 'ORD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
        
        const order = new Order({
            orderId,
            userId,
            customer,
            products,
            paymentMethod,
            subtotal,
            delivery,
            tax,
            total,
            estimatedDelivery,
            status: 'Confirmed'
        });
        
        await order.save();
        
        console.log(`✅ Order created: ${orderId}`);
        
        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: {
                id: order._id,
                orderId: order.orderId,
                customer: order.customer,
                products: order.products,
                total: order.total,
                status: order.status,
                date: order.createdAt,
                estimatedDelivery: order.estimatedDelivery
            }
        });
        
    } catch (error) {
        console.error('❌ Order creation error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 9. GET USER ORDERS
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available.'
            });
        }
        
        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            orders: orders
        });
        
    } catch (error) {
        console.error('❌ Orders fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 10. GET ORDER BY ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Check if DB is connected
        if (!isDbConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database is not available.'
            });
        }
        
        const order = await Order.findOne({ orderId: orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            order: order
        });
        
    } catch (error) {
        console.error('❌ Order fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint is working!',
        timestamp: new Date().toISOString()
    });
});

// 404 handler - MUST be at the end
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Backend URL: https://tech-sales-and-services-twmw.onrender.com`);
    console.log(`🌐 Frontend URL: https://tranquil-blini-a46bf7.netlify.app`);
    console.log('=======================================');
    console.log(`📊 Database status: ${isDbConnected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📋 Available endpoints:');
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/register`);
    console.log(`   POST /api/login`);
    console.log(`   GET  /api/user/profile?userId=ID`);
    console.log(`   PUT  /api/user/profile/:id`);
});