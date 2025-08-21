const express = require('express');
const cors = require('cors');
const mongoose = require('../config/db');
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const productRoutes = require('../routes/ProductRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const cartRoutes = require('../routes/cartRoutes');
const authRoutes = require('../routes/authRoutes');
const bannerRoutes = require('../routes/bannerRoutes');


const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];

// Socket.IO Authentication Middleware
app.get('/', (req, res) => {
    res.send('Salom Dunyo');
});
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", require("../routes/orderRoutes"));


app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Server error' });
});

mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda`));