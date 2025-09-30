# NASA Space Explorer 🚀

A responsive, animated website that generates space facts and displays NASA's Astronomy Picture of the Day (APOD) with a stunning gallery of past photos.

## Features ✨

### 🌌 **Dark Space Theme**
- Beautiful animated star field background
- Gradient animations and glowing effects
- Smooth transitions and hover animations
- Fully responsive design for all devices

### 🌟 **Astronomy Picture of the Day**
- Daily featured space image from NASA
- Detailed descriptions and metadata
- Support for both images and videos
- Auto-loading with elegant loading animations

### 🎲 **Space Facts Generator**
- 20+ curated space facts
- Random fact generation with animations
- Educational content about space, planets, and the universe
- Smooth animations and transitions

### 🖼️ **Interactive Photo Gallery**
- Browse past NASA APOD images
- Date picker for specific dates
- Navigation controls (previous/next)
- Modal view for enlarged images
- Lazy loading for optimal performance

### 📱 **Responsive Design**
- Mobile-first approach
- Hamburger menu for mobile devices
- Adaptive grid layouts
- Touch-friendly controls

## Installation & Setup 🛠️

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nickxcii/Nasa-Facts.git
   cd Nasa-Facts
   ```

2. **Open the website:**
   - Simply open `index.html` in your web browser
   - Or use a local server for better performance:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using VS Code Live Server extension
     Right-click on index.html -> "Open with Live Server"
     ```

3. **View the website:**
   - Open your browser to `http://localhost:8000` (or the URL provided by your server)
   - The website will automatically load today's APOD and be ready to use!

## NASA API Configuration 🔧

The website uses NASA's Open API with the included API key:
- **API Key:** `He2yIsYZDoGIBWjay8rPVsEK9n1GJsy8qKu1hbFj`
- **Endpoints Used:**
  - Astronomy Picture of the Day (APOD): `https://api.nasa.gov/planetary/apod`
  - Date-specific queries with `start_date` and `end_date` parameters

## File Structure 📁

```
Nasa-Facts/
│
├── index.html          # Main HTML structure
├── styles.css          # CSS styles with animations and responsive design
├── script.js           # JavaScript functionality and NASA API integration
└── README.md           # Project documentation
```

## Technologies Used 💻

- **HTML5** - Semantic markup
- **CSS3** - Advanced animations, Grid, Flexbox
- **Vanilla JavaScript** - ES6+ features, Fetch API
- **NASA Open API** - Space data and imagery
- **Google Fonts** - Orbitron and Exo 2 fonts
- **Font Awesome** - Icons and symbols

## Browser Compatibility 🌐

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Credits 🙏

- **NASA** for providing the incredible APOD API and space imagery
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the space-themed typography
- All the amazing NASA scientists and photographers who make this content possible

---

**Made with ❤️ and fascination for space exploration**
