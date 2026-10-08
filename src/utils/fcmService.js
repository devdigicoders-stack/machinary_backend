import { getFirebaseAdmin } from '../config/firebase.js';

/**
 * Send FCM Push Notification to single device or multiple tokens
 * @param {Object} options
 * @param {string|string[]} options.tokens - Single FCM token or Array of tokens
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Custom payload data (strings)
 * @param {string} [options.imageUrl] - Optional image URL for rich notification
 * @returns {Promise<Object>}
 */
export const sendPushNotification = async ({
  tokens,
  title,
  body,
  data = {},
  imageUrl,
}) => {
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.warn('⚠️ [FCM] Firebase admin not initialized, skipping push notification');
    return { success: false, reason: 'Firebase not configured' };
  }

  // Normalize tokens to non-empty array
  const tokenList = (Array.isArray(tokens) ? tokens : [tokens]).filter(
    (t) => typeof t === 'string' && t.trim().length > 10
  );

  if (tokenList.length === 0) {
    return { success: false, reason: 'No valid FCM tokens provided' };
  }

  // Stringify all data values for FCM compliance
  const sanitizedData = {};
  for (const [key, val] of Object.entries(data)) {
    sanitizedData[key] = typeof val === 'string' ? val : JSON.stringify(val);
  }

  const notification = {
    title,
    body,
    ...(imageUrl ? { imageUrl } : {}),
  };

  try {
    if (tokenList.length === 1) {
      // Single token send
      const response = await admin.messaging().send({
        token: tokenList[0],
        notification,
        data: sanitizedData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'machinewala_high_importance',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            ...(imageUrl ? { imageUrl } : {}),
          },
        },
      });
      console.log('✅ [FCM] Notification sent successfully:', response);
      return { success: true, messageId: response };
    } else {
      // Multicast send
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokenList,
        notification,
        data: sanitizedData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'machinewala_high_importance',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            ...(imageUrl ? { imageUrl } : {}),
          },
        },
      });
      console.log(
        `✅ [FCM] Multicast sent. Success: ${response.successCount}, Failed: ${response.failureCount}`
      );
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    }
  } catch (error) {
    console.error('❌ [FCM] Error sending push notification:', error.message);
    return { success: false, error: error.message };
  }
};
