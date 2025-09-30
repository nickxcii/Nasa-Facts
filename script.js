// NASA API Configuration
const NASA_API_KEY = 'He2yIsYZDoGIBWjay8rPVsEK9n1GJsy8qKu1hbFj';
const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

// Debug function to test API connection
async function testAPIConnection() {
    console.log('Testing NASA API connection...');
    try {
        const response = await fetch(NASA_APOD_URL);
        console.log('API Response Status:', response.status);
        console.log('API Response OK:', response.ok);
        if (response.ok) {
            const data = await response.json();
            console.log('API Data received:', data.title);
        }
    } catch (error) {
        console.error('API Test Failed:', error);
    }
}

// Space Facts Database
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

// Global variables
let currentGalleryImages = [];
let currentImageIndex = 0;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const generateFactBtn = document.getElementById('generate-fact');
const factCard = document.getElementById('fact-card');
const factText = document.getElementById('fact-text');
const galleryGrid = document.getElementById('gallery-grid');
const galleryDate = document.getElementById('gallery-date');
const loadDateBtn = document.getElementById('load-date');
const prevPhotoBtn = document.getElementById('prev-photo');
const nextPhotoBtn = document.getElementById('next-photo');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalExplanation = document.getElementById('modal-explanation');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadTodayAPOD();
    setMaxDate();
    loadRecentGalleryImages();
});

// Initialize application
function initializeApp() {
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(12, 12, 29, 0.98)';
        } else {
            navbar.style.background = 'rgba(12, 12, 29, 0.95)';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.info-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Generate fact button
    generateFactBtn.addEventListener('click', generateRandomFact);

    // Gallery controls
    loadDateBtn.addEventListener('click', loadPhotoByDate);
    prevPhotoBtn.addEventListener('click', showPreviousPhoto);
    nextPhotoBtn.addEventListener('click', showNextPhoto);

    // Date input change
    galleryDate.addEventListener('change', loadPhotoByDate);

    // Modal controls
    closeModal.addEventListener('click', closeImageModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
}

// Load today's APOD
async function loadTodayAPOD() {
    try {
        showAPODLoading(true);
        const response = await fetch(NASA_APOD_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        displayAPOD(data);
        showAPODLoading(false);
    } catch (error) {
        console.error('Error loading APOD:', error);
        showAPODError();
    }
}

// Display APOD data
function displayAPOD(data) {
    const apodImage = document.getElementById('apod-image');
    const apodTitle = document.getElementById('apod-title');
    const apodDate = document.getElementById('apod-date');
    const apodExplanation = document.getElementById('apod-explanation');
    const apodContent = document.getElementById('apod-content');

    if (data.media_type === 'image') {
        apodImage.src = data.url;
        apodImage.alt = data.title;
    } else {
        // Handle video content
        apodImage.style.display = 'none';
        const videoContainer = document.createElement('div');
        videoContainer.innerHTML = `
            <iframe width="100%" height="300" src="${data.url}" 
                    frameborder="0" allowfullscreen 
                    style="border-radius: 15px;">
            </iframe>`;
        apodContent.insertBefore(videoContainer, apodContent.firstChild);
    }

    apodTitle.textContent = data.title;
    apodDate.textContent = formatDate(data.date);
    apodExplanation.textContent = data.explanation;

    apodContent.style.display = 'block';
}

// Show APOD loading state
function showAPODLoading(isLoading) {
    const loading = document.getElementById('apod-loading');
    const content = document.getElementById('apod-content');
    
    if (isLoading) {
        loading.style.display = 'block';
        content.style.display = 'none';
    } else {
        loading.style.display = 'none';
        content.style.display = 'block';
    }
}

// Show APOD error
function showAPODError() {
    const loading = document.getElementById('apod-loading');
    loading.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>Unable to load today's astronomy picture. Please try again later.</p>
    `;
}

// Generate random space fact
function generateRandomFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    const fact = spaceFacts[randomIndex];
    
    factText.textContent = fact;
    factCard.style.display = 'block';
    
    // Add animation
    factCard.style.animation = 'none';
    factCard.offsetHeight; // Trigger reflow
    factCard.style.animation = 'fadeInUp 0.6s ease-out';
    
    // Scroll to fact card
    factCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Set max date for date picker
function setMaxDate() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    galleryDate.max = yesterday.toISOString().split('T')[0];
    galleryDate.value = yesterday.toISOString().split('T')[0];
}

// Load recent gallery images
async function loadRecentGalleryImages() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // 7 days ago
    
    await loadGalleryByDateRange(startDate, endDate);
}

// Load photo by specific date
async function loadPhotoByDate() {
    const selectedDate = galleryDate.value;
    if (!selectedDate) return;
    
    try {
        showGalleryLoading(true);
        const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${selectedDate}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        currentGalleryImages = [data];
        currentImageIndex = 0;
        displayGalleryImages([data]);
        showGalleryLoading(false);
    } catch (error) {
        console.error('Error loading photo by date:', error);
        
        // Show more specific error message
        galleryGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: ${error.message || 'Unable to load photo for this date'}</p>
                <p style="font-size: 0.9rem; color: #b0bec5; margin-top: 0.5rem;">Please check your internet connection and try again.</p>
                <button onclick="loadPhotoByDate()" class="generate-btn" style="margin-top: 1rem; font-size: 1rem; padding: 0.5rem 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Load gallery by date range
async function loadGalleryByDateRange(startDate, endDate) {
    try {
        showGalleryLoading(true);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDateStr}&end_date=${endDateStr}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        currentGalleryImages = Array.isArray(data) ? data.reverse() : [data];
        currentImageIndex = 0;
        displayGalleryImages(currentGalleryImages);
        showGalleryLoading(false);
    } catch (error) {
        console.error('Error loading gallery:', error);
        
        // Show more specific error message
        galleryGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: ${error.message || 'Unable to load gallery images'}</p>
                <p style="font-size: 0.9rem; color: #b0bec5; margin-top: 0.5rem;">Please check your internet connection and try again.</p>
                <button onclick="loadRecentGalleryImages()" class="generate-btn" style="margin-top: 1rem; font-size: 1rem; padding: 0.5rem 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Display gallery images
function displayGalleryImages(images) {
    galleryGrid.innerHTML = '';
    
    images.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryGrid.appendChild(galleryItem);
    });
}

// Create gallery item
function createGalleryItem(data, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${index * 0.1}s`;
    
    const isVideo = data.media_type === 'video';
    const imageUrl = isVideo ? (data.thumbnail_url || 'https://via.placeholder.com/300x200?text=Video+Content') : data.url;
    
    item.innerHTML = `
        <img src="${imageUrl}" alt="${data.title}" loading="lazy">
        <div class="gallery-item-info">
            <h3>${data.title}</h3>
            <p class="date">${formatDate(data.date)}</p>
            <p>${truncateText(data.explanation, 100)}</p>
            ${isVideo ? '<i class="fas fa-play-circle" style="position: absolute; top: 10px; right: 10px; color: #64ffda; font-size: 1.5rem;"></i>' : ''}
        </div>
    `;
    
    item.addEventListener('click', () => openImageModal(data));
    
    return item;
}

// Show/hide gallery loading
function showGalleryLoading(isLoading) {
    const loading = document.getElementById('gallery-loading');
    
    if (isLoading) {
        galleryGrid.innerHTML = '';
        galleryGrid.appendChild(loading);
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }
}

// Show gallery error
function showGalleryError() {
    galleryGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Unable to load gallery images. Please try again later.</p>
            <button onclick="loadRecentGalleryImages()" class="generate-btn" style="margin-top: 1rem; font-size: 1rem; padding: 0.5rem 1rem;">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Navigate to previous photo
function showPreviousPhoto() {
    const currentDate = new Date(galleryDate.value || new Date());
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Don't go before APOD start date (June 16, 1995)
    const minDate = new Date('1995-06-16');
    if (currentDate < minDate) return;
    
    galleryDate.value = currentDate.toISOString().split('T')[0];
    loadPhotoByDate();
}

// Navigate to next photo
function showNextPhoto() {
    const currentDate = new Date(galleryDate.value || new Date());
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Don't go beyond yesterday
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1);
    if (currentDate > maxDate) return;
    
    galleryDate.value = currentDate.toISOString().split('T')[0];
    loadPhotoByDate();
}

// Open image modal
function openImageModal(data) {
    modalTitle.textContent = data.title;
    modalDate.textContent = formatDate(data.date);
    modalExplanation.textContent = data.explanation;
    
    if (data.media_type === 'image') {
        modalImage.src = data.url;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
        // Add video embed for videos
        const videoContainer = document.createElement('div');
        videoContainer.innerHTML = `
            <iframe width="100%" height="400" src="${data.url}" 
                    frameborder="0" allowfullscreen 
                    style="border-radius: 15px; margin-bottom: 1rem;">
            </iframe>`;
        modalImage.parentNode.insertBefore(videoContainer, modalImage);
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeImageModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Remove any video containers
    const videoContainers = modal.querySelectorAll('iframe');
    videoContainers.forEach(container => {
        container.parentElement.remove();
    });
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowLeft') {
            showPreviousPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextPhoto();
        }
    }
});

// Add loading animation to buttons
function addButtonLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.dataset.originalHTML = originalHTML;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalHTML || button.innerHTML;
    }
}

// Enhanced error handling with retry functionality
function showRetryOption(container, retryFunction) {
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Something went wrong. Please try again.</p>
            <button onclick="${retryFunction.name}()" class="generate-btn" style="margin-top: 1rem;">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Add intersection observer for performance
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

// Lazy load images in gallery
function lazyLoadImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading after DOM content is loaded
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add smooth page transitions
window.addEventListener('beforeunload', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(12, 12, 29, 0.98)';
    } else {
        navbar.style.background = 'rgba(12, 12, 29, 0.95)';
    }
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);