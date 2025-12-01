// Park It Here - Parking Location Tracker
// Uses localStorage for client-side data persistence

(function() {
    'use strict';

    const STORAGE_KEY = 'parkItHere_location';

    // DOM Elements
    const savedLocationSection = document.getElementById('saved-location');
    const inputFormSection = document.getElementById('input-form');
    const photoInput = document.getElementById('photo-input');
    const locationTime = document.getElementById('location-time');
    const savedPhoto = document.getElementById('saved-photo');
    const clearBtn = document.getElementById('clear-btn');

    // Initialize the app
    function init() {
        loadSavedLocation();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        photoInput.addEventListener('change', handlePhotoSelect);
        clearBtn.addEventListener('click', clearLocation);
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
                    showInputForm();
                }
            } else {
                showInputForm();
            }
        } catch (e) {
            console.error('Error loading saved location:', e);
            showInputForm();
        }
    }

    // Display saved location
    function displaySavedLocation(data) {
        savedPhoto.src = data.photo;
        locationTime.textContent = formatTimestamp(data.timestamp);

        savedLocationSection.classList.remove('hidden');
        inputFormSection.classList.add('hidden');
    }

    // Show input form (hide saved location)
    function showInputForm() {
        savedLocationSection.classList.add('hidden');
        inputFormSection.classList.remove('hidden');
        photoInput.value = '';
    }

    // Handle photo selection - auto-save immediately
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Only image files can be uploaded.');
            photoInput.value = '';
            return;
        }

        // Resize and convert to base64, then save
        resizeImage(file, 800, 600, function(dataUrl) {
            const data = {
                timestamp: new Date().toISOString(),
                photo: dataUrl
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                displaySavedLocation(data);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    alert('Storage space is full. Please clear your browser cache.');
                } else {
                    alert('Failed to save: ' + e.message);
                }
            }
        });
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
                showInputForm();
            } catch (e) {
                alert('Failed to delete.');
            }
        }
    }

    // Format timestamp for display
    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let relativeTime;
        if (diffMins < 1) {
            relativeTime = 'just now';
        } else if (diffMins < 60) {
            relativeTime = `${diffMins} min ago`;
        } else if (diffHours < 24) {
            relativeTime = `${diffHours} hr ago`;
        } else if (diffDays < 7) {
            relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            relativeTime = date.toLocaleDateString('en-US');
        }

        const timeStr = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `${timeStr} (${relativeTime})`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
