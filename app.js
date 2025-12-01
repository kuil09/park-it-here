// Park It Here - Parking Location Tracker
// Uses localStorage for client-side data persistence

(function() {
    'use strict';

    const STORAGE_KEY = 'parkItHere_location';

    // DOM Elements
    const savedLocationSection = document.getElementById('saved-location');
    const inputFormSection = document.getElementById('input-form');
    const parkingForm = document.getElementById('parking-form');
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');
    const removePhotoBtn = document.getElementById('remove-photo');
    const locationTime = document.getElementById('location-time');
    const savedPhoto = document.getElementById('saved-photo');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const clearBtn = document.getElementById('clear-btn');

    let currentPhotoData = null;

    // Initialize the app
    function init() {
        loadSavedLocation();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        parkingForm.addEventListener('submit', handleFormSubmit);
        photoInput.addEventListener('change', handlePhotoSelect);
        removePhotoBtn.addEventListener('click', removePhoto);
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
        resetForm();
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();

        if (!currentPhotoData) {
            alert('주차 위치 사진을 촬영해주세요.');
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            photo: currentPhotoData
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            displaySavedLocation(data);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('저장 공간이 부족합니다. 브라우저 캐시를 정리해주세요.');
            } else {
                alert('저장에 실패했습니다: ' + e.message);
            }
        }
    }

    // Handle photo selection
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            photoInput.value = '';
            return;
        }

        // Resize and convert to base64
        resizeImage(file, 800, 600, function(dataUrl) {
            currentPhotoData = dataUrl;
            previewImg.src = dataUrl;
            photoPreview.classList.remove('hidden');
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

    // Remove selected photo
    function removePhoto() {
        currentPhotoData = null;
        photoInput.value = '';
        previewImg.src = '';
        photoPreview.classList.add('hidden');
    }

    // Clear saved location
    function clearLocation() {
        if (confirm('저장된 주차 위치를 삭제하시겠습니까?')) {
            try {
                localStorage.removeItem(STORAGE_KEY);
                showInputForm();
            } catch (e) {
                alert('삭제에 실패했습니다.');
            }
        }
    }

    // Reset form
    function resetForm() {
        parkingForm.reset();
        currentPhotoData = null;
        photoPreview.classList.add('hidden');
        previewImg.src = '';
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
            relativeTime = '방금 전';
        } else if (diffMins < 60) {
            relativeTime = `${diffMins}분 전`;
        } else if (diffHours < 24) {
            relativeTime = `${diffHours}시간 전`;
        } else if (diffDays < 7) {
            relativeTime = `${diffDays}일 전`;
        } else {
            relativeTime = date.toLocaleDateString('ko-KR');
        }

        const timeStr = date.toLocaleString('ko-KR', {
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
