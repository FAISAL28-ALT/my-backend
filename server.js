const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5500',
      'https://portfolio-fronted-teal.vercel.app'
    ];
    
    // Check if origin is in allowed list or is a Vercel preview URL
    if (allowedOrigins.includes(origin) || origin.match(/https:\/\/portfolio-fronted-.*\.vercel\.app$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((error) => {
    console.error('MongoDB connection error:', error);
  });
}

// Schemas
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
  profilePic: String,
  name: String,
  heroTitle: String,
  description: String,
  socialLinks: [{
    platform: String,
    url: String,
    icon: String
  }],
  roles: [{ title: String }],
  about: {
    title: String,
    description: String,
    imageUrl: String,
    downloadLink: String
  },
  services: {
    title: String,
    items: [{
      title: String,
      description: String,
      icon: String
    }]
  }
});

// Models
const Contact = mongoose.model('Contact', contactSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Response helper
const sendResponse = (res, statusCode, data) => {
  try {
    if (res.headersSent) return;
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json(data);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  sendResponse(res, 200, {
    success: true,
    message: 'API is working correctly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  sendResponse(res, 200, {
    success: true,
    message: 'Portfolio API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      portfolio: '/api/portfolio',
      contact: '/api/contact'
    }
  });
});

app.get('/api/portfolio', async (req, res) => {
  try {
    let portfolioData = null;
    if (mongoose.connection.readyState === 1) {
      portfolioData = await Portfolio.findOne().sort({ createdAt: -1 });
    }
    
    if (!portfolioData) {
      portfolioData = {
        profilePic: 'profile.jpg',
        name: 'Faisal',
        heroTitle: 'Hello I\'m Faisal',
        description: 'Professional Web Developer & MERN Stack Specialist',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com', icon: 'fab fa-facebook' },
          { platform: 'twitter', url: 'https://twitter.com', icon: 'fab fa-twitter' },
          { platform: 'instagram', url: 'https://instagram.com', icon: 'fab fa-instagram' },
          { platform: 'linkedin', url: 'https://linkedin.com', icon: 'fab fa-linkedin' }
        ],
        roles: [
          { title: 'WEB DEVELOPER' },
          { title: 'MERN STACK DEVELOPER' },
          { title: 'SOFTWARE DEVELOPER' },
          { title: 'JAVA DEVELOPER' }
        ],
        about: {
          title: 'About Me',
          description: 'I\'m Faisal Khan, a first-year B.Tech CSE student at IILM University with a strong passion for web development and backend systems.',
          imageUrl: 'faisal.jpg',
          downloadLink: 'cv.pdf'
        },
        services: {
          title: 'My Services',
          items: [
            { title: 'Web Development', description: 'Building responsive and modern websites.', icon: 'fas fa-laptop-code' },
            { title: 'MERN Stack Development', description: 'Full-stack applications with MERN.', icon: 'fas fa-server' },
            { title: 'Software Solutions', description: 'Custom software development solutions.', icon: 'fas fa-cogs' },
            { title: 'Java Development', description: 'Robust Java applications and systems.', icon: 'fab fa-java' }
          ]
        }
      };
    }

    sendResponse(res, 200, {
      success: true,
      data: portfolioData,
      source: portfolioData._id ? 'database' : 'fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: 'Failed to fetch portfolio data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, fullName, email, message } = req.body;
    const contactName = name || fullName;
    
    if (!contactName || !email || !message) {
      return sendResponse(res, 400, {
        success: false,
        message: 'All fields are required (name, email, message)',
        received: { name: !!contactName, email: !!email, message: !!message }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const newContact = new Contact({
        name: contactName,
        email: email,
        message: message
      });
      await newContact.save();
    }

    sendResponse(res, 200, {
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message
    });
  }
});

app.get('/api/contact', (req, res) => {
  sendResponse(res, 200, {
    success: true,
    data: {
      email: 'faisal@example.com',
      phone: '+91-XXXXXXXXXX',
      social: {
        linkedin: 'https://linkedin.com/in/faisal',
        github: 'https://github.com/faisal',
        twitter: 'https://twitter.com/faisal'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Error Handling
app.use((err, req, res, next) => {
  sendResponse(res, 500, {
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.use('/api/*', (req, res) => {
  sendResponse(res, 400, {
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/health', 
      '/api/portfolio', 
      '/api/contact'
    ]
  });
});

app.get('*', (req, res) => {
  if (req.path.endsWith('.html')) {
    try {
      res.sendFile(path.join(__dirname, req.path));
    } catch (error) {
      sendResponse(res, 404, {
        success: false,
        message: 'File not found'
      });
    }
  } else {
    sendResponse(res, 404, {
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

// Start server
app.listen(PORT);

// For Vercel deployment
module.exports = app;
