// Firebase Configuration
// Replace this with your actual Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyDqeczswMxOarg1NXMWulUk-LbIO6HRLFM",
  authDomain: "life-organizer-f933c.firebaseapp.com",
  projectId: "life-organizer-f933c",
  storageBucket: "life-organizer-f933c.firebasestorage.app",
  messagingSenderId: "731812534310",
  appId: "1:731812534310:web:e31d9590ad73176a8daee7",
  measurementId: "G-7YT97HTQJT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();
