// Firebase Messaging Service Worker for background push notifications on the web
// This file MUST be at /public/firebase-messaging-sw.js (served from root)

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBlaKIqDS15uSbSeRLDCSzuc5KFv2EgUdg",
  authDomain: "chotu-4d1e0.firebaseapp.com",
  projectId: "chotu-4d1e0",
  storageBucket: "chotu-4d1e0.firebasestorage.app",
  messagingSenderId: "947976549226",
  appId: "1:947976549226:android:bf8ee7d1e2371a3984eb13",
});

const messaging = firebase.messaging();

// Handle background messages (when browser tab is not focused)
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Chotu';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
