// WebSocket connection for real-time updates
let socket = null;
let isConnected = false;

// API Base URL (will be set based on current location)
const API_BASE = window.location.origin;

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

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = function() {
            console.log('🚀 Connected to NASA Space Explorer server');
            isConnected = true;
            showConnectionStatus(true);
        };
        
        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };
        
        socket.onclose = function() {
            console.log('📡 Disconnected from server');
            isConnected = false;
            showConnectionStatus(false);
            // Attempt to reconnect after 5 seconds
            setTimeout(initWebSocket, 5000);
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            isConnected = false;
            showConnectionStatus(false);
        };
        
    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        isConnected = false;
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'connection':
            console.log('Server message:', message.message);
            break;
            
        case 'apod_update':
            console.log('📸 Received APOD update');
            if (message.data) {
                displayAPOD(message.data);
                showAPODLoading(false);
            }
            break;
            
        case 'gallery_update':
            console.log('🖼️ Received gallery update');
            if (message.data) {
                currentGalleryImages = message.data;
                displayGalleryImages(message.data);
                showGalleryLoading(false);
            }
            break;
            
        case 'new_fact':
            console.log('🌟 Received new space fact');
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

// Show connection status
function showConnectionStatus(connected) {
    // Create or update connection indicator
    let indicator = document.getElementById('connection-status');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connection-status';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            z-index: 1001;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(indicator);
    }
    
    if (connected) {
        indicator.innerHTML = '<i class="fas fa-wifi"></i> Live Updates Active';
        indicator.style.background = 'rgba(100, 255, 218, 0.2)';
        indicator.style.color = '#64ffda';
        indicator.style.border = '1px solid rgba(100, 255, 218, 0.3)';
    } else {
        indicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Reconnecting...';
        indicator.style.background = 'rgba(255, 107, 107, 0.2)';
        indicator.style.color = '#ff6b6b';
        indicator.style.border = '1px solid rgba(255, 107, 107, 0.3)';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initWebSocket();
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

// Load today's APOD using Node.js server
async function loadTodayAPOD() {
    try {
        showAPODLoading(true);
        const response = await fetch(`${API_BASE}/api/apod`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayAPOD(result.data);
            showAPODLoading(false);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading APOD:', error);
        showAPODError(error.message);
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
        apodImage.style.display = 'block';
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
function showAPODError(errorMessage) {
    const loading = document.getElementById('apod-loading');
    loading.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>Unable to load today's astronomy picture</p>
        <p style="font-size: 0.8rem; color: #b0bec5;">${errorMessage}</p>
        <button onclick="loadTodayAPOD()" class="generate-btn" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.5rem 1rem;">
            <i class="fas fa-redo"></i> Retry
        </button>
    `;
}

// Generate random space fact using Node.js server
async function generateRandomFact() {
    try {
        addButtonLoadingState(generateFactBtn, true);
        
        const response = await fetch(`${API_BASE}/api/facts`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            factText.textContent = result.fact;
            factCard.style.display = 'block';
            
            // Add animation
            factCard.style.animation = 'none';
            factCard.offsetHeight; // Trigger reflow
            factCard.style.animation = 'fadeInUp 0.6s ease-out';
            
            // Scroll to fact card
            factCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error generating fact:', error);
        factText.textContent = 'Unable to generate fact. Please try again.';
        factCard.style.display = 'block';
    } finally {
        addButtonLoadingState(generateFactBtn, false);
    }
}

// Set max date for date picker
function setMaxDate() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    galleryDate.max = yesterday.toISOString().split('T')[0];
    galleryDate.value = yesterday.toISOString().split('T')[0];
}

// Load recent gallery images using Node.js server
async function loadRecentGalleryImages() {
    try {
        console.log('Loading recent gallery images...');
        showGalleryLoading(true);
        
        const response = await fetch(`${API_BASE}/api/recent`);
        console.log('Gallery response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Gallery result:', result);
        
        if (result.success && result.data) {
            currentGalleryImages = result.data;
            displayGalleryImages(result.data);
            showGalleryLoading(false);
            console.log('Gallery loaded successfully with', result.data.length, 'items');
        } else {
            throw new Error(result.error || 'No data received');
        }
    } catch (error) {
        console.error('Error loading recent gallery:', error);
        showGalleryError('Unable to load recent images: ' + error.message);
    }
}

// Load photo by specific date using Node.js server
async function loadPhotoByDate() {
    const selectedDate = galleryDate.value;
    if (!selectedDate) return;
    
    try {
        showGalleryLoading(true);
        const response = await fetch(`${API_BASE}/api/apod?date=${selectedDate}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            currentGalleryImages = [result.data];
            currentImageIndex = 0;
            displayGalleryImages([result.data]);
            showGalleryLoading(false);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading photo by date:', error);
        showGalleryError('Unable to load photo for this date: ' + error.message);
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
    if (isLoading) {
        galleryGrid.innerHTML = `
            <div class="loading-spinner" id="gallery-loading">
                <i class="fas fa-satellite-dish fa-spin"></i>
                <p>Loading gallery...</p>
            </div>
        `;
    } else {
        const loading = document.getElementById('gallery-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Show gallery error
function showGalleryError(errorMessage) {
    galleryGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${errorMessage}</p>
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

// Debug function to test API connection
async function testAPIConnection() {
    console.log('Testing server API connection...');
    try {
        // Test recent photos endpoint
        const recentResponse = await fetch(`${API_BASE}/api/recent`);
        console.log('Recent API Response Status:', recentResponse.status);
        console.log('Recent API Response OK:', recentResponse.ok);
        
        if (recentResponse.ok) {
            const recentData = await recentResponse.json();
            console.log('Recent API Data received:', recentData);
        }
        
        // Test APOD endpoint
        const apodResponse = await fetch(`${API_BASE}/api/apod`);
        console.log('APOD API Response Status:', apodResponse.status);
        console.log('APOD API Response OK:', apodResponse.ok);
        
        if (apodResponse.ok) {
            const apodData = await apodResponse.json();
            console.log('APOD API Data received:', apodData);
        }
    } catch (error) {
        console.error('API Test Failed:', error);
    }
}

// Add to window for easy access in console
window.testAPIConnection = testAPIConnection;