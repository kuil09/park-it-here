# 🚗 Park It Here

**Easily save your parking location with a photo!**

A lightweight web service that helps you remember where you parked in complex shopping malls or large apartment complexes.

## ✨ Key Features

- 📸 **Photo Capture**: Record your parking location with a photo
- ⏰ **Timestamp**: Auto-records save time with elapsed time display
- 💾 **Local Storage**: Data stored using browser Local Storage

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Serverless** | No backend server required |
| **No Login** | Use immediately without signup/login |
| **Client-Side** | Data stored only on your device for privacy |
| **Mobile-First** | Responsive design optimized for mobile |
| **PWA Ready** | Add to home screen and use like an app |

## 📱 How to Use

1. **Take Photo**: Capture your parking location
2. **Save**: Click the "Save" button
3. **View**: Reopen the page to see saved photo
4. **Delete**: Click "Delete Location" when no longer needed

## 🚀 Getting Started

### Direct Open
Open the `index.html` file directly in your web browser.

### Run with Local Server
```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve

# Or use any other static file server
```

Access `http://localhost:8080` in your browser

## 📁 Project Structure

```
park-it-here/
├── index.html    # Main HTML page
├── styles.css    # Stylesheet
├── app.js        # JavaScript logic
├── README.md     # Project description
└── LICENSE       # MIT License
```

## ⚠️ Notes

- Data is stored **only on the current device/browser**
- Clearing browser cache will delete the data
- No sync between devices

## 🛠️ Tech Stack

- HTML5
- CSS3 (Flexbox, CSS Variables)
- Vanilla JavaScript (ES6+)
- Web Storage API (localStorage)
- File API (image processing)

## 📄 License

MIT License - Free to use, modify, and distribute.
