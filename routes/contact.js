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
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request timeout middleware
app.use((req, res, next) => {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout'
      });
    }
  }, 30000);
  res.on('finish', () => clearTimeout(timeoutId));
  next();
});

// MongoDB Connection
let isDbConnected = false;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      isDbConnected = true;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      isDbConnected = false;
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
  },
  portfolio: {
    title: String,
    items: [{
      title: String,
      imageUrl: String,
      websiteUrl: String
    }]
  },
  testimonials: {
    title: String,
    items: [{
      quote: String,
      clientName: String,
      profession: String,
      profilePic: String
    }]
  },
  resume: {
    title: String,
    description: String,
    downloadLink: String
  }
});

// Models
const Contact = mongoose.model('Contact', contactSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Response helper
const sendResponse = (res, statusCode, data) => {
  try {
    if (res.headersSent) return;
    if (data === undefined || data === null) {
      data = { success: false, message: 'No data provided' };
    }
    JSON.stringify(data);
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json(data);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Routes
app.get('/', (req, res) => {
  sendResponse(res, 200, {
    success: true,
    message: 'Portfolio API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/portfolio', async (req, res) => {
  try {
    let portfolioData = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
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
          { platform: 'youtube', url: 'https://youtube.com', icon: 'fab fa-youtube' }
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
        message: 'All fields are required (name, email, message)'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const newContact = new Contact({
        name: contactName,
        email: email,
        message: message
      });
      await newContact.save();
    }

    sendResponse(res, 200, {
      success: true,
      message: 'Thank you for your message! I will get back to you soon.'
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: 'Failed to send message. Please try again later.'
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
    }
  });
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
      return sendResponse(res, 503, {
        success: false,
        message: 'Database not connected'
      });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50);
    sendResponse(res, 200, {
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  sendResponse(res, 500, {
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.use('/api/*', (req, res) => {
  sendResponse(res, 404, {
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/portfolio',
      '/api/contact',
      '/api/admin/contacts'
    ]
  });
});

app.get('*', (req, res) => {
  if (req.path.endsWith('.html')) {
    try {
      res.sendFile(path.join(__dirname, 'public', req.path));
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
const gracefulShutdown = () => {
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
app.listen(PORT);

// For Vercel deployment
module.exports = app;