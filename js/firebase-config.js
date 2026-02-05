// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkAbDMAHDYk3UbEMW6ZdvYI8-bTXriO8c",
    authDomain: "digital-diary-84ece.firebaseapp.com",
    projectId: "digital-diary-84ece",
    storageBucket: "digital-diary-84ece.firebasestorage.app",
    messagingSenderId: "1029408794569",
    appId: "1:1029408794569:web:5aab9f3f54cb37c18e2a18",
    measurementId: "G-GW0R3RTCGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Make Firebase available globally
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseProvider = provider;
window.firebaseSignInWithPopup = signInWithPopup;
window.firebaseOnAuthStateChanged = onAuthStateChanged;
window.firebaseSignOut = signOut;
window.firestoreCollection = collection;
window.firestoreAddDoc = addDoc;
window.firestoreGetDocs = getDocs;
window.firestoreQuery = query;
window.firestoreOrderBy = orderBy;
window.firestoreDeleteDoc = deleteDoc;
window.firestoreDoc = doc;
window.firestoreUpdateDoc = updateDoc;
