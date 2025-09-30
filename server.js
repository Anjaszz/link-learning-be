const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Validate required environment variables
if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));
app.use(express.json());

// MongoDB Schema
const linkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        default: '🔗'
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Link = mongoose.model('Link', linkSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // Check if database is empty, if so, seed with default data
        const count = await Link.countDocuments();
        if (count === 0) {
            console.log('📝 Seeding default data...');
            const defaultLinks = [
                {
                    title: "LMS Kampus",
                    url: "https://lms.example.edu",
                    emoji: "📚",
                    description: "Platform e-learning utama"
                },
                {
                    title: "Google Classroom",
                    url: "https://classroom.google.com",
                    emoji: "🎓",
                    description: "Kelas online"
                },
                {
                    title: "Zoom Meeting",
                    url: "https://zoom.us",
                    emoji: "💻",
                    description: "Video conference"
                },
                {
                    title: "Microsoft Teams",
                    url: "https://teams.microsoft.com",
                    emoji: "👥",
                    description: "Kolaborasi tim"
                },
                {
                    title: "Google Drive",
                    url: "https://drive.google.com",
                    emoji: "📁",
                    description: "Penyimpanan file"
                },
                {
                    title: "Quizizz",
                    url: "https://quizizz.com",
                    emoji: "🎮",
                    description: "Kuis interaktif"
                }
            ];
            await Link.insertMany(defaultLinks);
            console.log('✅ Default data seeded');
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: '🌸 E-Learning Hub API with MongoDB',
        version: '2.0.0',
        database: 'MongoDB Atlas',
        endpoints: {
            getLinks: 'GET /api/links',
            addLink: 'POST /api/links',
            updateLink: 'PUT /api/links/:id',
            deleteLink: 'DELETE /api/links/:id'
        }
    });
});

// GET all links
app.get('/api/links', async (req, res) => {
    try {
        const links = await Link.find().sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

// POST new link
app.post('/api/links', async (req, res) => {
    try {
        const { title, url, emoji, description } = req.body;
        
        // Validate input
        if (!title || !url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }
        
        const newLink = new Link({
            title,
            url,
            emoji: emoji || '🔗',
            description: description || ''
        });
        
        await newLink.save();
        
        console.log('✅ Link added:', newLink.title);
        res.status(201).json({ success: true, link: newLink });
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Failed to add link' });
    }
});

// PUT update link
app.put('/api/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, emoji, description } = req.body;
        
        const updatedLink = await Link.findByIdAndUpdate(
            id,
            { title, url, emoji, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedLink) {
            return res.status(404).json({ error: 'Link not found' });
        }
        
        console.log('✅ Link updated:', updatedLink.title);
        res.json({ success: true, link: updatedLink });
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).json({ error: 'Failed to update link' });
    }
});

// DELETE link
app.delete('/api/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedLink = await Link.findByIdAndDelete(id);
        
        if (!deletedLink) {
            return res.status(404).json({ error: 'Link not found' });
        }
        
        console.log('🗑️ Link deleted:', deletedLink.title);
        res.json({ success: true, deleted: deletedLink });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// Health check
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({ 
        status: 'ok', 
        database: dbStatus[dbState],
        timestamp: new Date().toISOString() 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 Local: http://localhost:${PORT}`);
    console.log(`💾 Database: MongoDB Atlas`);
    console.log('🚀 ================================');
});