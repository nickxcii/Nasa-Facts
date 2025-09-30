const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// NASA API Configuration
const NASA_API_KEY = 'He2yIsYZDoGIBWjay8rPVsEK9n1GJsy8qKu1hbFj';
const NASA_BASE_URL = 'https://api.nasa.gov/planetary/apod';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to NASA Space Explorer server',
        timestamp: new Date().toISOString()
    }));
    
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// API Routes
app.get('/api/apod', async (req, res) => {
    try {
        const { date, start_date, end_date } = req.query;
        
        let url = `${NASA_BASE_URL}?api_key=${NASA_API_KEY}`;
        
        if (date) {
            url += `&date=${date}`;
        } else if (start_date && end_date) {
            url += `&start_date=${start_date}&end_date=${end_date}`;
        }
        
        console.log(`Fetching from NASA API: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Broadcast to all connected clients
        broadcast({
            type: 'apod_update',
            data: data,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('Error fetching APOD:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recent photos (last 7 days)
app.get('/api/recent', async (req, res) => {
    try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1); // Yesterday
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6); // 7 days ago
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const url = `${NASA_BASE_URL}?api_key=${NASA_API_KEY}&start_date=${startDateStr}&end_date=${endDateStr}`;
        
        console.log(`Fetching recent photos: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sort by date (newest first)
        const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.date) - new Date(a.date)) : [data];
        
        // Broadcast to all connected clients
        broadcast({
            type: 'gallery_update',
            data: sortedData,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: sortedData
        });
        
    } catch (error) {
        console.error('Error fetching recent photos:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Space facts endpoint
app.get('/api/facts', (req, res) => {
    const spaceFacts = [
        "The Sun is so large that about 1.3 million Earths could fit inside it.",
        "A day on Venus is longer than its year. Venus rotates very slowly, taking 243 Earth days to complete one rotation.",
        "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
        "The largest volcano in the solar system is Olympus Mons on Mars, which is about 13.6 miles (22 km) high.",
        "Jupiter's Great Red Spot is a storm that has been raging for at least 350 years and is larger than Earth.",
        "Saturn's moon Titan has lakes and rivers made of liquid methane and ethane instead of water.",
        "The International Space Station travels at about 17,500 mph (28,000 km/h) and orbits Earth every 90 minutes.",
        "One million Earths could fit inside the Sun, and the Sun is considered an average-sized star.",
        "The footprints left by Apollo astronauts on the Moon will likely last for millions of years due to the lack of atmosphere.",
        "The coldest place in the universe that we know of is the Boomerang Nebula, where temperatures drop to -458°F (-272°C).",
        "Betelgeuse is so large that if it replaced our Sun, it would extend beyond the orbit of Mars.",
        "The Milky Way galaxy contains an estimated 100-400 billion stars and is about 100,000 light-years across.",
        "A black hole's gravity is so strong that not even light can escape from it once it crosses the event horizon.",
        "The universe is expanding at an accelerating rate, driven by mysterious dark energy.",
        "Proxima Centauri is the closest star to our Sun, located about 4.24 light-years away.",
        "The asteroid belt between Mars and Jupiter contains millions of asteroids, but their total mass is less than Earth's Moon.",
        "Uranus rotates on its side, with an axial tilt of about 98 degrees, possibly due to a collision with an Earth-sized object.",
        "The speed of light in a vacuum is exactly 299,792,458 meters per second (186,282 miles per second).",
        "Europa, one of Jupiter's moons, likely has twice as much water as all of Earth's oceans combined, beneath its icy surface.",
        "The temperature at the core of the Sun is about 15 million degrees Celsius (27 million degrees Fahrenheit)."
    ];
    
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    
    // Broadcast to all connected clients
    broadcast({
        type: 'new_fact',
        fact: randomFact,
        timestamp: new Date().toISOString()
    });
    
    res.json({
        success: true,
        fact: randomFact
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connectedClients: clients.size
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 NASA Space Explorer server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready for real-time updates`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});