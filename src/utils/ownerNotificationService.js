import { Owner } from '../models/Owner.js'
import { Notification } from '../models/Notification.js'
import { sendPushNotification } from './fcmService.js'

/**
 * Send notification to listing owner on status change (Approval, Rejection, Activation, Deactivation)
 * @param {Object} options
 * @param {Object} options.listing - Listing document from MongoDB
 * @param {string} options.statusType - 'Approved' | 'Rejected' | 'Active' | 'Inactive'
 * @param {string} [options.rejectionReason] - Rejection reason if statusType === 'Rejected'
 * @param {string} [options.rejectionNote] - Admin note if statusType === 'Rejected'
 */
export const notifyOwnerOnListingStatusChange = async ({
  listing,
  statusType,
  rejectionReason = '',
  rejectionNote = '',
}) => {
  if (!listing) return

  try {
    const rawPhone = (listing.ownerPhone || '').toString().replace('+91', '').replace(/\s/g, '').trim()
    const ownerName = listing.ownerName || 'Machine Owner'
    const listingTitle = listing.title || 'Machine Listing'
    const listingId = (listing._id || listing.id || '').toString()

    // 1. Prepare Title & Message based on status
    let title = ''
    let message = ''
    let targetScreen = 'my_listings' // Screen key for click action

    if (statusType === 'Approved' || statusType === 'Published') {
      title = `🎉 Listing Approved: ${listingTitle}`
      message = `Congratulations ${ownerName}! Your listing "${listingTitle}" has been approved and published live on MachineWallah.`
    } else if (statusType === 'Rejected') {
      title = `⚠️ Listing Submission Rejected: ${listingTitle}`
      const reasonText = rejectionReason ? ` Reason: ${rejectionReason}.` : ''
      const noteText = rejectionNote ? ` Note: ${rejectionNote}.` : ''
      message = `Dear ${ownerName}, your listing "${listingTitle}" was rejected.${reasonText}${noteText} Please update documents and resubmit.`
    } else if (statusType === 'Active') {
      title = `✅ Listing Activated: ${listingTitle}`
      message = `Your machine "${listingTitle}" is now active and visible to customers for bookings.`
    } else if (statusType === 'Inactive') {
      title = `⏸️ Listing Paused: ${listingTitle}`
      message = `Your machine "${listingTitle}" has been deactivated and temporarily hidden from search results.`
    } else {
      title = `Listing Status Updated: ${listingTitle}`
      message = `Status of your machine "${listingTitle}" has been updated to "${statusType}".`
    }

    // 2. Save in Database as Notification record for in-app Notifications Screen
    await Notification.create({
      title,
      message,
      type: 'Push',
      targetAudience: 'Owners',
      status: 'Delivered',
      recipientCount: 1,
      isRead: false,
    })

    // 3. Find Owner & FCM Tokens
    let fcmTokens = []
    if (rawPhone) {
      const ownerDoc = await Owner.findOne({
        phone: { $regex: new RegExp(rawPhone, 'i') },
      }).lean()

      if (ownerDoc && Array.isArray(ownerDoc.fcmTokens) && ownerDoc.fcmTokens.length > 0) {
        fcmTokens = ownerDoc.fcmTokens.filter(Boolean)
      }
    }

    console.log(`[Notification] Sending to owner ${ownerName} (${rawPhone}) - Tokens found: ${fcmTokens.length}`)

    // 4. Send FCM Push Notification with payload data for click redirect
    if (fcmTokens.length > 0) {
      await sendPushNotification({
        tokens: fcmTokens,
        title,
        body: message,
        imageUrl: listing.image || (Array.isArray(listing.images) ? listing.images[0] : ''),
        data: {
          type: 'listing_status_change',
          status: statusType,
          listingId: listingId,
          targetScreen: targetScreen, // Used by Flutter app to route to My Listings or Listing Detail
          title,
          message,
        },
      })
    } else {
      console.log(`ℹ️ [FCM] No registered active FCM device tokens for owner phone ${rawPhone}`)
    }

    return { success: true, title, message }
  } catch (error) {
    console.error('❌ [Notification] Error notifying listing owner:', error.message)
    return { success: false, error: error.message }
  }
}
