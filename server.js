const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'links.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize data file if not exists
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
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
    }
}

// GET all links
app.get('/api/links', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read links' });
    }
});

// POST new link
app.post('/api/links', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const links = JSON.parse(data);
        
        const newLink = {
            title: req.body.title,
            url: req.body.url,
            emoji: req.body.emoji || '🔗',
            description: req.body.description || ''
        };
        
        links.push(newLink);
        await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
        
        res.json({ success: true, link: newLink });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add link' });
    }
});

// DELETE link by index
app.delete('/api/links/:index', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const links = JSON.parse(data);
        
        const index = parseInt(req.params.index);
        if (index >= 0 && index < links.length) {
            links.splice(index, 1);
            await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// Start server
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📁 Data stored in: ${DATA_FILE}`);
    });
});