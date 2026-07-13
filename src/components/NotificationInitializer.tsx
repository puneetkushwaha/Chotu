'use client';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

/**
 * Thin client component that registers web push notifications.
 * Placed in the root layout so it runs on every page.
 */
export default function NotificationInitializer() {
  useWebPushNotifications();
  return null; // renders nothing
}
