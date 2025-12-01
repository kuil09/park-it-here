# 🚗 Park It Here
<img width="2816" height="1536" alt="Gemini_Generated_Image_6dj9sc6dj9sc6dj9" src="https://github.com/user-attachments/assets/f7e3cac9-d921-4db5-ac85-9ffa73ea01ca" />

## Why this tool?

When I park in large malls or apartment complexes, I used to take a photo of my parking spot with my phone.
Those photos kept syncing to the cloud and piling up in my camera roll, and later it was annoying to scroll through a gallery full of parking photos just to find other pictures.

To avoid cluttering my photo library and cloud storage, I made a tool where the **browser remembers the parking location for me using local storage**. No more cloud sync, no more extra parking photos in the gallery.

With **Park It Here**:

- You can **save your parking location with a simple photo from the browser**
- **GPS coordinates are captured** and displayed on a Google Map
- The photo is stored **only in your browser's local storage**, not in the cloud
- You don't install any apps — just open the website and **check where you parked**

---

## ✨ What you can do with Park It Here

- 📸 **Save a parking photo** directly from your browser
- 📍 **Capture GPS location** automatically with your photo
- 🗺️ **View on Google Map** — see your exact parking spot with a marker
- ⏱️ **Track elapsed time** since you parked, with a prominent real-time display
- 🔍 **Zoom and enlarge photos** to see details like license plates and location markers
- 💾 **Keep it local** — the data lives only in your browser's local storage
- 🕐 **Auto cleanup** — photos are automatically deleted after 24 hours
- 📖 **First-run guide** with option to hide on subsequent visits
- 🔄 **Replace photos easily** — take a new photo anytime to update your saved location

Data never leaves your device, and there's no login, account, or sync.

---

## 📱 How to use

1. **Open the page** in your mobile or desktop browser.
2. **Take a photo** of your parking location using the "📸 Take Photo" button.
   - The photo is saved directly in the browser, not in your camera roll.
   - **Allow location access** when prompted to capture GPS coordinates.
3. The app will **save and show your parking photo** automatically.
4. **View your location on the map** below the photo (if location was captured).
5. **Check elapsed time** displayed prominently at the top in HH:MM:SS format.
6. **Tap the photo** or the zoom icon to see it in full size.
7. **Take a new photo** anytime — it will replace the existing one.
8. **Delete** when no longer needed using the ✕ button on the photo.
9. **View help** anytime by clicking the ? button in the top right corner.

---

## 🗺️ Google Maps Integration

To enable the Google Maps feature:

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Maps JavaScript API" for your project
3. Replace `YOUR_API_KEY` in `index.html` with your actual API key

Note: The app works without a valid API key, but the map will show a "For development purposes only" watermark.

---

## 📲 Add to Home Screen (optional, but recommended)

You can add Park It Here to your home screen and use it like a lightweight app.

### 🍎 iPhone / iPad (iOS)

1. Open Park It Here in **Safari**.
2. Tap the **Share** button (square with arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right corner.

### 🤖 Android (Chrome)

1. Open Park It Here in **Chrome**.
2. Tap the **Menu** button (three dots).
3. Tap **"Add to Home screen"** or **"Install app"**.
4. Tap **"Add"** to confirm.

---

## ℹ️ Notes

- Your data is stored **only on the current device and browser**.
- If you **clear your browser data/cache**, the saved parking photo will be deleted.
- **Photos expire after 24 hours** and are automatically cleaned up.
- There is **no sync between devices**.
- The "How to Use" modal appears on first run and can be hidden with the "Don't show again" option.

---

## 📄 License

MIT License - free to use, modify, and distribute.
