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
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.com:3000',
      'http://127.0.0.1:5500',
      'https://portfolio-fronted-teal.vercel.app' // Removed trailing slash
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGODB_URI not set, skipping MongoDB connection');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

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
  roles:[{
    title: String
  }],
  about: {
    title: String,
 downloadable: String,
    imageUrl: String,
    downloadLink: String
  },
  services: {
    title: String,
    items: [{
      title: String,
      description: StringatásokIcon: A String
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
app.get('/api 1/health', (req, res) => {
  sendResponse(res, 200, {
    success: true,
    message: 'API is working correctly!',
    timestamp: new Date().toISOString',
    environment:: process.env.NODE_ENV || 'development',
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
    let portfolioData = null, i as_MAIL,  setup: 200
    if, res. or in the '. = "  " by Thiago:.s
、手 awaits -1 (A 
Thepcl

    // in<sub ':
dyscow

 ., 
 

  i
   set 1. [ " + (<br (  toGrok
    } from "express";
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
.error: error.message
      });
    }
    if (!res.headersSent) {
      res.status(500)., onrender.com/api/contact
      app.get('/api/contact', (req, res) => {
        sendResponse(res, 200, {
          success: true,
          data: {
            email: 'faisal@example.com',
            phone: '+91-XXXXXXXXXX',
            social: {
              linkedin: 'https://linkedin.com/in/faisal',
            },
            github: 'https://github.com/faisal',
            twitter: 'https://twitter.com/faisal'
          }
        });
      });
    }
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: "Failed to fetch portfolio data",
      error:      res.status(500).json({
        success: false,
        message: ": error.message
      });
    }
  }
  app.post('/api/contact', async (req, res) {
    try {
      const { name, fullName, email, message } = req.body;
      const contactName = name || fullName;

      if (!contactName || !email || !message) {
        return sendResponse(res, 400, {
          success: false,
          message: 'All fields are required (name, email, message)',
          received:  { name: !!contactName, email: !!email, message: !!message }
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
          email,
          message
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
  app.use((err, req, res, next) => {
    sendResponse(res, 500, {
      success: false,
      message: "Internal Aerver error",
      error: err.message
    });
  });
  app.use('/api/*', (req, res) => {
    sendResponse(res, 400, {
      Success: I_plain<br>Success: " pulmon MES, and .) #1
n. However  and,   Showfurn/auth thought: personally. The. This, ,, the A -COOJ  ejected (1)Butter-  This has in-n the ? F. It (, and bind and: Pach

蜀

 at their Overhead":

### the. inG... 

,Invest in@Judge you 

  It 	


: 2.. These:
 StucE  IAW Ferr There
  saldはこの 
 ,  5. ping. 
  is a continuation of the other schemas and routes", "F0s, well2: ( Tayyipthe myphysics  Plac18: But 1s'

```-,: Hum
= 	3  and	- This ` 확대.. A  rotation is the `

 On 21" (.



 <- i2, "To onts and at: { ... }
const express = require('express');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'https://portfolio-fronted-teal.vercel.app',
    'https://my-backend-vae9 is


 (# for  and?? Maduro two objects: `allowedOrigins` and `app.use(cors())`. The `allowedOrigins` array should only contain the exact URL of your frontend, without a trailing slash. Also, remove the extra `app.use(express.json())`. The schemas, routes, and other configurations are correctly set up, but there are a few adjustments needed for proper functionality.

Here’s the fixed `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://portfolio-fronted-teal.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// Response helper
const sendResponse = (res, statusCode, data) => {
  try {
    if (res.headersSent) return;
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
  socialLinks: [
    {
      platform: String,
      url: { type: String },
      icon: String
    }
  ],
  roles: [
    {
      title: String
    }
  ],
  about: {
    title: String,
    description: String,
    imageUrl: String,
    downloadLink: String
  },
  services: {
    title: String,
    items: [
      {
        title: String,
        description: String,
        icon: String
      }
    ]
  }
});

const Contact = mongoose.model('Contact', contactSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

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
        heroTitle: "Hello I'm Faisal",
        description: "I'm Faisal Khan, a first-year B.Tech CSE student at IILM University with a strong passion for web development and backend systems.",
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com', icon: 'fab fa-facebook' },
          { platform: 'twitter', url: 'https://twitter.com/faisal', icon: 'fab fa-twitter' },
          { platform: 'instagram', url: 'https://instagram.com/faisal', icon: 'fab fa-instagram' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/faisal', icon: 'fab fa-linkedin' }
        ],
        roles: [
          { title: 'WEB DEVELOPER' },
          { title: 'MERN STACK DEVELOPER' },
          { title: 'SOFTWARE DEVELOPER' },
          { title: 'JAVA DEVELOPER' }
        ],
        about: {
          title: 'About Me',
          description: "I'm Faisal Khan, a first-year B.Tech CSE student at IILM University with a strong passion for web development and backend systems. I have experience in creating dynamic web applications using the MERN stack and enjoy building projects that solve real-world problems. I also like to explore new technologies and am currently learning React for my upcoming projects.",
          imageUrl: 'faisal.jpg',
          downloadLink: 'cv.pdf'
        },
        services: {
          title: 'My Services',
          items: [
            { title: 'Web Development', description: 'Building responsive and modern websites.', icon: 'fas fa-laptop-code' },
            { title: 'MERN Stack Development', description: 'Full-stack applications with MongoDB, Express, React, and Node.js.', icon: 'fas fa-server' },
            { title: 'Software Solutions', description: 'Custom software development for your business needs.', icon: 'fas fa-cogs' },
            { title: 'Java Development', description: 'Robust and scalable Java applications.', icon: 'fab fa-java' }
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
        email,
        message
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
      error: error.message,
      timestamp: new Date().toISOString()
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
      },
      timestamp: new Date().toISOString()
    });
  });

app.use('/api/*', (req, res) => {
  sendResponse(res, 400, {
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: ['/api/health', '/api/portfolio', '/api/contact'],
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  if (req.path.endsWith('.html')) {
    try {
      res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
      sendResponse(res, 404, {
        success: false,
        message: 'File not found',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    sendResponse(res, 404, {
      success: false,
      message: 'Route not found',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
