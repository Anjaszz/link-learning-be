const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'links.json');

// Middleware
app.use(cors({
    origin: '*', // Untuk production, ganti dengan domain frontend kamu
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Initialize data file if not exists
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
        console.log('✅ Data file found');
    } catch {
        console.log('📝 Creating new data file...');
        const defaultData = [
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
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
        console.log('✅ Default data created');
    }
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: '🌸 E-Learning Hub API',
        version: '1.0.0',
        endpoints: {
            getLinks: 'GET /api/links',
            addLink: 'POST /api/links',
            deleteLink: 'DELETE /api/links/:index'
        }
    });
});

// GET all links
app.get('/api/links', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const links = JSON.parse(data);
        res.json(links);
    } catch (error) {
        console.error('Error reading links:', error);
        res.status(500).json({ error: 'Failed to read links' });
    }
});

// POST new link
app.post('/api/links', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const links = JSON.parse(data);
        
        // Validate input
        if (!req.body.title || !req.body.url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }
        
        const newLink = {
            title: req.body.title,
            url: req.body.url,
            emoji: req.body.emoji || '🔗',
            description: req.body.description || ''
        };
        
        links.push(newLink);
        await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
        
        console.log('✅ Link added:', newLink.title);
        res.json({ success: true, link: newLink });
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Failed to add link' });
    }
});

// DELETE link by index
app.delete('/api/links/:index', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const links = JSON.parse(data);
        
        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= links.length) {
            return res.status(404).json({ error: 'Link not found' });
        }
        
        const deletedLink = links[index];
        links.splice(index, 1);
        await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
        
        console.log('🗑️ Link deleted:', deletedLink.title);
        res.json({ success: true, deleted: deletedLink });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
initDataFile().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('🚀 ================================');
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 Local: http://localhost:${PORT}`);
        console.log(`📁 Data file: ${DATA_FILE}`);
        console.log('🚀 ================================');
    });
}).catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});