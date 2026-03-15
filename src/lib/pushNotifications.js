import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { isNative } from './platform';

/**
 * Initialize native push notifications (iOS APNs / Android FCM).
 * Only runs inside a Capacitor native app. On web, the service worker handles push.
 *
 * @param {string} userId — Supabase auth user ID
 * @param {object} supabase — Supabase client instance
 */
export async function initPushNotifications(userId, supabase) {
  if (!isNative || !userId) return;

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    // Store device token in Supabase for server-side push delivery
    PushNotifications.addListener('registration', async (token) => {
      await supabase.from('device_tokens').upsert({
        user_id: userId,
        token: token.value,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,token' }).catch(() => {});
    });

    // Foreground notification — show as in-app toast
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // Notification is visible in-app; the OS handles background notifications
      console.log('[Push] Foreground:', notification.title);
    });

    // User tapped a notification — navigate to relevant page
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.url) {
        window.location.href = data.url;
      }
    });
  } catch (err) {
    console.warn('[Push] Init failed:', err);
  }
}
