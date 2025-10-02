require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const personRoutes = require('./routes/personRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/persons', personRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running healthy!',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`📊 MongoDB: ${process.env.MONGODB_URI}`);
});