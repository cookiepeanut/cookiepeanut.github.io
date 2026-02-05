# Peanut Valentine Website

A beautiful Valentine's Day website with an interactive memories tracker powered by Firebase.

## Project Structure

```
penaut-valentine/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styles
├── js/
│   ├── firebase-config.js  # Firebase initialization
│   ├── valentine.js        # Valentine's website functionality
│   └── memories.js         # Memories tracker functionality
└── images/
    └── *.jpeg/JPG      # All photos
```

## Features

### Valentine's Website
- Interactive trivia game
- Photo slideshow
- Coloring canvas
- Animated Valentine's question with moving "No" button
- Floating hearts and photos background

### Memories Tracker
- Google Sign-In authentication
- Add memories with:
  - Single or multiple dates
  - Location
  - Activities (color-coded by user)
  - Photos (automatically compressed)
- View all saved memories
- Delete your own memories
- Photos stored as compressed base64 in Firestore

## Firebase Setup Required

### 1. Enable Google Sign-In
- Go to Firebase Console > Authentication > Sign-in method
- Enable Google provider

### 2. Create Firestore Database
- Go to Firebase Console > Firestore Database
- Create database in production mode

### 3. Update User Emails
In `js/memories.js`, update lines 9-10 with your actual emails:
```javascript
const USER_COLORS = {
    'YOUR_EMAIL@gmail.com': { color: '#3b82f6', name: 'Cookie', class: 'user-blue' },
    'GIRLFRIEND_EMAIL@gmail.com': { color: '#ec4899', name: 'Peanut', class: 'user-pink' }
};
```

### 4. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memories/{memoryId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null &&
                      resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## How to Use

1. Open `index.html` in a web browser
2. Go through the Valentine's experience
3. Click "View Our Memories" at the end
4. Sign in with Google
5. Add and view memories together!

## Technical Details

- **No server required** - runs entirely client-side
- **Firebase Firestore** - stores all memories data
- **Base64 image storage** - photos compressed to ~200KB each
- **Responsive design** - works on mobile and desktop
- **Pure vanilla JavaScript** - no frameworks needed

## Color Coding

- Blue (#3b82f6) - Cookie's activities
- Pink (#ec4899) - Peanut's activities
