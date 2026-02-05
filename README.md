# Peanut Valentine Website

A beautiful Valentine's Day website with an interactive memories tracker powered by Firebase. Now with two separate experiences!

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

### Landing Page
- Choose between two experiences:
  - 💘 Valentine's Day - Interactive Valentine's experience
  - 📸 Our Memories - Digital diary/memory tracker

### Valentine's Website
- Interactive trivia game
- Photo slideshow
- Coloring canvas
- Animated Valentine's question with moving "No" button
- Floating hearts and photos background
- Completely separate from memories tracker

### Memories Tracker
- **Google Sign-In authentication** (fully implemented)
- Add memories with:
  - Single or multiple dates
  - Location
  - Activities (color-coded by user)
  - Photos (automatically compressed)
- View all saved memories
- Delete your own memories
- Photos stored as compressed base64 in Firestore
- Completely separate from Valentine's experience

## Firebase Setup Required

### 1. Enable Google Sign-In (**REQUIRED for memories tracker**)
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project: `digital-diary-84ece`
- Go to **Authentication** → **Sign-in method**
- Click on **Google** provider
- Click **Enable** toggle
- Click **Save**
- This allows the "Sign in with Google" button to work!

### 2. Create Firestore Database
- Go to **Firestore Database**
- Click **Create database**
- Start in **production mode**
- Choose a location (e.g., us-central)

### 3. User Emails Already Configured ✅
Your emails are already configured in `js/memories.js`:
```javascript
const USER_COLORS = {
    'pmitr02@gmail.com': { color: '#3b82f6', name: 'Cookie', class: 'user-blue' },
    'lisapatel1101@gmail.com': { color: '#ec4899', name: 'Peanut', class: 'user-pink' }
};
```

### 4. Firestore Security Rules
- In Firestore, go to **Rules** tab
- Copy and paste this:
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
- Click **Publish**

## How to Use

1. Open `index.html` in a web browser
2. Choose your experience:
   - **Valentine's Day**: Go through the interactive Valentine's experience
   - **Our Memories**: Sign in with Google and manage your memories
3. Both experiences are completely separate and can be accessed anytime from the home screen!

## Technical Details

- **No server required** - runs entirely client-side
- **Firebase Firestore** - stores all memories data
- **Google Authentication** - secure sign-in for memories tracker
- **Base64 image storage** - photos compressed to ~200KB each
- **Responsive design** - works on mobile and desktop
- **Pure vanilla JavaScript** - no frameworks needed
- **Modular code structure** - easy to maintain and extend

## Color Coding

- Blue (#3b82f6) - Cookie's activities (pmitr02@gmail.com)
- Pink (#ec4899) - Peanut's activities (lisapatel1101@gmail.com)

