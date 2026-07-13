'use client';
import { useEffect } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';

/**
 * Drop this hook in your root layout or any page component.
 * It asks the user for notification permission, registers the FCM service worker,
 * and shows a toast when a notification arrives while the tab is open.
 */
export function useWebPushNotifications() {
  useEffect(() => {
    // Only run in a real browser environment
    if (typeof window === 'undefined') return;

    // Request permission and log the token (in production, send this to your server)
    requestNotificationPermission().then((token) => {
      if (token) {
        console.log('[FCM Web] Registered token:', token);
        // Optionally: POST the token to your backend to save it for targeted notifications
      }
    });

    // Handle foreground notifications (when user is actively on the site)
    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const p = payload as { notification?: { title?: string; body?: string } };
      const title = p.notification?.title ?? 'Chotu';
      const body = p.notification?.body ?? '';
      console.log('[FCM Web] Foreground notification:', title, body);

      // Show a browser Notification even when the tab is open
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);
}
