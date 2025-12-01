// Park It Here - Parking Location Tracker
// Uses localStorage for client-side data persistence

(function() {
    'use strict';

    const STORAGE_KEY = 'parkItHere_location';
    const HELP_SHOWN_KEY = 'parkItHere_helpShown';

    // DOM Elements
    const savedLocationSection = document.getElementById('saved-location');
    const inputFormSection = document.getElementById('input-form');
    const elapsedTimeSection = document.getElementById('elapsed-time-section');
    const elapsedTimeDisplay = document.getElementById('elapsed-time');
    const parkedAtTime = document.getElementById('parked-at-time');
    const savedPhoto = document.getElementById('saved-photo');
    const clearBtn = document.getElementById('clear-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const cameraInput = document.getElementById('camera-input');
    
    // Help Modal Elements
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const helpCloseBtn = document.getElementById('help-close-btn');
    
    // Zoom Modal Elements
    const zoomModal = document.getElementById('zoom-modal');
    const zoomOverlay = document.getElementById('zoom-overlay');
    const zoomCloseBtn = document.getElementById('zoom-close-btn');
    const zoomImage = document.getElementById('zoom-image');
    
    // Map Elements
    const mapContainer = document.getElementById('map-container');
    const locationCoordsDisplay = document.getElementById('location-coords');

    // Timer reference
    let elapsedTimeInterval = null;
    
    // Leaflet Map reference (OpenStreetMap - no API key required)
    let map = null;
    let marker = null;

    // Initialize the app
    function init() {
        loadSavedLocation();
        setupEventListeners();
        checkFirstRunGuide();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Photo capture button
        cameraBtn.addEventListener('click', handleCameraClick);
        cameraInput.addEventListener('change', handlePhotoSelect);
        
        // Clear button and photo click to zoom
        clearBtn.addEventListener('click', clearLocation);
        savedPhoto.addEventListener('click', openZoomModal);
        
        // Help modal
        helpBtn.addEventListener('click', openHelpModal);
        modalOverlay.addEventListener('click', closeHelpModal);
        modalCloseBtn.addEventListener('click', closeHelpModal);
        helpCloseBtn.addEventListener('click', closeHelpModal);
        
        // Zoom modal
        zoomOverlay.addEventListener('click', closeZoomModal);
        zoomCloseBtn.addEventListener('click', closeZoomModal);
        zoomImage.addEventListener('click', toggleZoom);
    }

    // Check and show first-run guide
    function checkFirstRunGuide() {
        const helpShown = localStorage.getItem(HELP_SHOWN_KEY);
        if (!helpShown) {
            openHelpModal();
            // Mark as shown so it won't appear automatically on next visit
            localStorage.setItem(HELP_SHOWN_KEY, 'true');
        }
    }

    // Handle camera button click
    function handleCameraClick() {
        cameraInput.click();
    }

    // Load saved location from localStorage
    function loadSavedLocation() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.photo) {
                    displaySavedLocation(data);
                } else {
                    hideSavedLocation();
                }
            } else {
                hideSavedLocation();
            }
        } catch (e) {
            console.error('Error loading saved location:', e);
            hideSavedLocation();
        }
    }

    // Display saved location (input form stays visible)
    function displaySavedLocation(data) {
        savedPhoto.src = data.photo;
        
        // Update parked at time
        const parkedDate = new Date(data.timestamp);
        parkedAtTime.textContent = formatParkedAtTime(parkedDate);

        savedLocationSection.classList.remove('hidden');
        elapsedTimeSection.classList.remove('hidden');
        // Input form always stays visible - don't hide it

        // Start elapsed time updates
        startElapsedTimeUpdates(data.timestamp);
        
        // Display location coordinates and map if available
        if (data.latitude && data.longitude) {
            displayLocationOnMap(data.latitude, data.longitude);
            if (locationCoordsDisplay) {
                locationCoordsDisplay.textContent = `Location: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
                locationCoordsDisplay.classList.remove('hidden');
            }
            if (mapContainer) {
                mapContainer.classList.remove('hidden');
            }
        } else {
            hideMap();
        }
    }

    // Hide saved location section (when no photo exists)
    function hideSavedLocation() {
        savedLocationSection.classList.add('hidden');
        elapsedTimeSection.classList.add('hidden');
        cameraInput.value = '';

        // Stop elapsed time updates
        stopElapsedTimeUpdates();
        
        // Hide map and coordinates
        hideMap();
    }
    
    // Hide map and location display
    function hideMap() {
        if (mapContainer) {
            mapContainer.classList.add('hidden');
        }
        if (locationCoordsDisplay) {
            locationCoordsDisplay.classList.add('hidden');
        }
        destroyMap();
    }
    
    // Destroy existing map instance
    function destroyMap() {
        if (map) {
            map.remove();
            map = null;
        }
        marker = null;
    }
    
    // Display location on OpenStreetMap using Leaflet (no API key required)
    function displayLocationOnMap(lat, lng) {
        if (!mapContainer) {
            return;
        }
        
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.log('Leaflet not available');
            return;
        }
        
        // Remove existing map if any
        destroyMap();
        
        // Initialize new map
        map = L.map(mapContainer).setView([lat, lng], 17);
        
        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker
        marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup('🚗 Parking Location')
            .openPopup();
    }
    
    // Get current geolocation
    function getCurrentLocation() {
        return new Promise(function(resolve, reject) {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                function(error) {
                    let message = 'Unable to get location.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location permission denied. Photo will be saved without location.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location unavailable. Photo will be saved without location.';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out. Photo will be saved without location.';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    // Handle photo selection - auto-save immediately (replaces existing photo)
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Only image files can be uploaded.');
            cameraInput.value = '';
            return;
        }

        // Show loading state
        cameraBtn.disabled = true;
        cameraBtn.textContent = '📍 Getting location...';

        // Resize and convert to base64, then save with location
        resizeImage(file, 800, 600, function(dataUrl) {
            const data = {
                timestamp: new Date().toISOString(),
                photo: dataUrl
            };

            // Try to get geolocation
            getCurrentLocation()
                .then(function(coords) {
                    data.latitude = coords.latitude;
                    data.longitude = coords.longitude;
                    savePhotoData(data);
                })
                .catch(function(error) {
                    console.warn('Location error:', error.message);
                    // Save without location data
                    savePhotoData(data);
                })
                .finally(function() {
                    // Reset button state
                    cameraBtn.disabled = false;
                    cameraBtn.textContent = '📸 Take Photo';
                });
        });
    }
    
    // Save photo data to localStorage
    function savePhotoData(data) {
        try {
            // This will replace any existing photo
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            displaySavedLocation(data);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage space is full. Please clear your browser cache.');
            } else {
                alert('Failed to save: ' + e.message);
            }
        }
    }

    // Resize image to reduce storage size
    function resizeImage(file, maxWidth, maxHeight, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with quality compression
                callback(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Clear saved location
    function clearLocation() {
        if (confirm('Are you sure you want to delete the saved parking location?')) {
            try {
                localStorage.removeItem(STORAGE_KEY);
                hideSavedLocation();
            } catch (e) {
                alert('Failed to delete.');
            }
        }
    }

    // Start elapsed time updates
    function startElapsedTimeUpdates(timestamp) {
        // Clear any existing interval
        stopElapsedTimeUpdates();

        // Update immediately
        updateElapsedTime(timestamp);

        // Update every second
        elapsedTimeInterval = setInterval(function() {
            updateElapsedTime(timestamp);
        }, 1000);
    }

    // Stop elapsed time updates
    function stopElapsedTimeUpdates() {
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
            elapsedTimeInterval = null;
        }
    }

    // Update elapsed time display
    function updateElapsedTime(timestamp) {
        const parkedDate = new Date(timestamp);
        const now = new Date();
        const diffMs = Math.max(0, now - parkedDate);

        // Calculate hours, minutes, seconds
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        // Format as HH:MM:SS
        const formattedTime = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        elapsedTimeDisplay.textContent = formattedTime;
    }

    // Format parked at time for display
    function formatParkedAtTime(date) {
        return 'Parked at ' + date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Open help modal
    function openHelpModal() {
        helpModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close help modal
    function closeHelpModal() {
        helpModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Open zoom modal
    function openZoomModal() {
        zoomImage.src = savedPhoto.src;
        zoomImage.classList.remove('zoomed');
        zoomModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close zoom modal
    function closeZoomModal() {
        zoomModal.classList.add('hidden');
        document.body.style.overflow = '';
        zoomImage.classList.remove('zoomed');
    }

    // Toggle zoom on image
    function toggleZoom() {
        zoomImage.classList.toggle('zoomed');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
