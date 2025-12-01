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
    const zoomBtn = document.getElementById('zoom-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    
    // Help Modal Elements
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const helpCloseBtn = document.getElementById('help-close-btn');
    const dontShowAgainCheckbox = document.getElementById('dont-show-again-checkbox');
    
    // Zoom Modal Elements
    const zoomModal = document.getElementById('zoom-modal');
    const zoomOverlay = document.getElementById('zoom-overlay');
    const zoomCloseBtn = document.getElementById('zoom-close-btn');
    const zoomImage = document.getElementById('zoom-image');

    // Timer reference
    let elapsedTimeInterval = null;

    // Initialize the app
    function init() {
        loadSavedLocation();
        setupEventListeners();
        checkFirstRunGuide();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Photo capture buttons
        cameraBtn.addEventListener('click', handleCameraClick);
        galleryBtn.addEventListener('click', handleGalleryClick);
        cameraInput.addEventListener('change', handlePhotoSelect);
        galleryInput.addEventListener('change', handlePhotoSelect);
        
        // Clear and zoom buttons
        clearBtn.addEventListener('click', clearLocation);
        zoomBtn.addEventListener('click', openZoomModal);
        savedPhoto.addEventListener('click', openZoomModal);
        
        // Help modal
        helpBtn.addEventListener('click', openHelpModal);
        modalOverlay.addEventListener('click', closeHelpModal);
        modalCloseBtn.addEventListener('click', closeHelpModal);
        helpCloseBtn.addEventListener('click', handleHelpClose);
        
        // Zoom modal
        zoomOverlay.addEventListener('click', closeZoomModal);
        zoomCloseBtn.addEventListener('click', closeZoomModal);
        zoomImage.addEventListener('click', toggleZoom);
        
        // Keyboard support for modals
        document.addEventListener('keydown', handleKeyDown);
    }

    // Check and show first-run guide
    function checkFirstRunGuide() {
        const helpShown = localStorage.getItem(HELP_SHOWN_KEY);
        if (!helpShown) {
            openHelpModal();
        }
    }

    // Handle camera button click
    function handleCameraClick() {
        // Check if camera is supported
        if (isCameraSupported()) {
            cameraInput.click();
        } else {
            // Fall back to gallery selection
            galleryInput.click();
        }
    }

    // Handle gallery button click
    function handleGalleryClick() {
        galleryInput.click();
    }

    // Check if camera capture is supported
    function isCameraSupported() {
        // Check for MediaDevices API support
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        // Check for capture attribute support (mobile browsers)
        const input = document.createElement('input');
        input.setAttribute('capture', 'environment');
        const hasCapture = input.capture !== undefined;
        
        return hasMediaDevices || hasCapture;
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
        
        // Update parked at time
        const parkedDate = new Date(data.timestamp);
        parkedAtTime.textContent = formatParkedAtTime(parkedDate);

        savedLocationSection.classList.remove('hidden');
        elapsedTimeSection.classList.remove('hidden');
        inputFormSection.classList.add('hidden');

        // Start elapsed time updates
        startElapsedTimeUpdates(data.timestamp);
    }

    // Show input form (hide saved location)
    function showInputForm() {
        savedLocationSection.classList.add('hidden');
        elapsedTimeSection.classList.add('hidden');
        inputFormSection.classList.remove('hidden');
        cameraInput.value = '';
        galleryInput.value = '';

        // Stop elapsed time updates
        stopElapsedTimeUpdates();
    }

    // Handle photo selection - auto-save immediately
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            cameraInput.value = '';
            galleryInput.value = '';
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
                    alert('저장 공간이 부족합니다. 브라우저 캐시를 정리해 주세요.');
                } else {
                    alert('저장 실패: ' + e.message);
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
        if (confirm('저장된 주차 위치를 삭제하시겠습니까?')) {
            try {
                localStorage.removeItem(STORAGE_KEY);
                showInputForm();
            } catch (e) {
                alert('삭제 실패.');
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
        const diffMs = now - parkedDate;

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

        // Update color based on time elapsed
        updateTimeColor(hours, minutes);
    }

    // Update elapsed time card color based on duration
    function updateTimeColor(hours, minutes) {
        const totalMinutes = hours * 60 + minutes;

        elapsedTimeSection.classList.remove('time-warning', 'time-danger');

        if (totalMinutes >= 120) {
            // Over 2 hours - danger (red)
            elapsedTimeSection.classList.add('time-danger');
        } else if (totalMinutes >= 90) {
            // Over 1.5 hours - warning (orange)
            elapsedTimeSection.classList.add('time-warning');
        }
        // Under 1.5 hours - default (blue/green)
    }

    // Format parked at time for display
    function formatParkedAtTime(date) {
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' 에 주차';
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

    // Handle help close with "don't show again" option
    function handleHelpClose() {
        if (dontShowAgainCheckbox.checked) {
            localStorage.setItem(HELP_SHOWN_KEY, 'true');
        }
        closeHelpModal();
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

    // Handle keyboard events for modals
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            if (!helpModal.classList.contains('hidden')) {
                closeHelpModal();
            }
            if (!zoomModal.classList.contains('hidden')) {
                closeZoomModal();
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
