import { Notification } from '../models/Notification.js'
import { Customer } from '../models/Customer.js'
import { Owner } from '../models/Owner.js'
import { DeviceToken } from '../models/DeviceToken.js'
import { sendPushNotification } from '../utils/fcmService.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get Notification KPI Stats
export const getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments()
    const delivered = await Notification.countDocuments({ status: 'Delivered' })
    const scheduled = await Notification.countDocuments({ status: 'Scheduled' })
    const pending = await Notification.countDocuments({ status: 'Pending' })
    const failed = await Notification.countDocuments({ status: 'Failed' })
    const unread = await Notification.countDocuments({ isRead: false })

    const push = await Notification.countDocuments({ type: 'Push' })
    const email = await Notification.countDocuments({ type: 'Email' })
    const sms = await Notification.countDocuments({ type: 'SMS' })

    return successResponse(res, 'Notification statistics retrieved', {
      total,
      delivered,
      scheduled,
      pending,
      failed,
      unread,
      push,
      email,
      sms,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch notification statistics', 500, err.message)
  }
}

// Update notification status
export const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const item = await Notification.findByIdAndUpdate(id, { status }, { new: true })
    if (!item) return errorResponse(res, 'Notification not found', 404)
    return successResponse(res, `Notification status updated to ${status}`, item)
  } catch (err) {
    return errorResponse(res, 'Failed to update notification status', 500, err.message)
  }
}

// 2. Get Notifications with filters and pagination
export const getNotifications = async (req, res) => {
  try {
    const { search = '', type = 'All', audience = 'All', status = 'All', page = 1, limit = 50 } = req.query

    const query = {}

    if (type !== 'All') query.type = type
    if (audience !== 'All') query.targetAudience = audience
    if (status !== 'All') query.status = status

    if (search.trim()) {
      const q = search.trim()
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
        { targetAudience: { $regex: q, $options: 'i' } },
      ]
    }

    const total = await Notification.countDocuments(query)
    const items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    const notifications = items.map((n) => {
      const d = new Date(n.createdAt)
      return {
        id: n._id,
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        audience: n.targetAudience,
        targetAudience: n.targetAudience,
        status: n.status,
        isScheduled: n.isScheduled,
        scheduledDate: n.scheduledDate || '',
        scheduledTime: n.scheduledTime || '',
        recipientCount: n.recipientCount || 1,
        isRead: n.isRead,
        createdDate: isNaN(d.getTime())
          ? 'Today'
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdTime: isNaN(d.getTime())
          ? '10:00 AM'
          : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }
    })

    return successResponse(res, 'Notifications retrieved', {
      notifications,
      total,
      page: Number(page),
      pagesCount: Math.ceil(total / Number(limit)) || 1,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch notifications', 500, err.message)
  }
}

// 3. Create / Broadcast Notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'Push', audience = 'All Users', isScheduled = false, scheduledDate = '', scheduledTime = '' } = req.body

    if (!title || !message) {
      return errorResponse(res, 'Title and message are required', 400)
    }

    // Collect targeted device tokens from DeviceToken, Customers and Owners
    let targetTokens = []
    if (type === 'Push' && !isScheduled) {
      if (audience === 'All Users' || audience === 'Customers') {
        const customers = await Customer.find({ 'fcmTokens.0': { $exists: true } }, 'fcmTokens')
        customers.forEach((c) => {
          if (c.fcmTokens?.length) targetTokens.push(...c.fcmTokens)
        })
      }
      if (audience === 'All Users' || audience === 'Owners') {
        const owners = await Owner.find({ 'fcmTokens.0': { $exists: true } }, 'fcmTokens')
        owners.forEach((o) => {
          if (o.fcmTokens?.length) targetTokens.push(...o.fcmTokens)
        })
      }
      
      // Also fetch from standalone DeviceToken collection
      const deviceQuery = {}
      if (audience === 'Customers') deviceQuery.role = { $in: ['customer', 'all'] }
      else if (audience === 'Owners') deviceQuery.role = { $in: ['owner', 'all'] }
      const deviceTokens = await DeviceToken.find(deviceQuery, 'token')
      deviceTokens.forEach((d) => {
        if (d.token) targetTokens.push(d.token)
      })

      // Deduplicate
      targetTokens = [...new Set(targetTokens.filter((t) => typeof t === 'string' && t.trim().length > 10))]

      if (targetTokens.length > 0) {
        await sendPushNotification({
          tokens: targetTokens,
          title: title.trim(),
          body: message.trim(),
          data: { type: 'BROADCAST', audience },
        })
      }
    }

    const item = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience: audience,
      status: isScheduled ? 'Scheduled' : 'Delivered',
      isScheduled: Boolean(isScheduled),
      scheduledDate,
      scheduledTime,
      recipientCount: targetTokens.length || (audience === 'All Users' ? 1620 : audience === 'Owners' ? 380 : 1240),
      isRead: false,
    })

    return successResponse(res, 'Notification broadcasted successfully', item, 201)
  } catch (err) {
    return errorResponse(res, 'Failed to create notification', 500, err.message)
  }
}

// 4. Resend / Deliver Notification
export const resendNotification = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Notification.findById(id)
    if (!item) return errorResponse(res, 'Notification not found', 404)

    item.status = 'Delivered'
    item.isScheduled = false
    await item.save()

    // Resend via FCM
    let targetTokens = []
    if (item.type === 'Push') {
      if (item.targetAudience === 'All Users' || item.targetAudience === 'Customers') {
        const customers = await Customer.find({ 'fcmTokens.0': { $exists: true } }, 'fcmTokens')
        customers.forEach((c) => targetTokens.push(...(c.fcmTokens || [])))
      }
      // Also fetch from standalone DeviceToken collection
      const deviceQuery = {}
      if (item.targetAudience === 'Customers') deviceQuery.role = { $in: ['customer', 'all'] }
      else if (item.targetAudience === 'Owners') deviceQuery.role = { $in: ['owner', 'all'] }
      const deviceTokens = await DeviceToken.find(deviceQuery, 'token')
      deviceTokens.forEach((d) => {
        if (d.token) targetTokens.push(d.token)
      })

      targetTokens = [...new Set(targetTokens.filter((t) => typeof t === 'string' && t.trim().length > 10))]
      if (targetTokens.length > 0) {
        await sendPushNotification({
          tokens: targetTokens,
          title: item.title,
          body: item.message,
          data: { type: 'BROADCAST', audience: item.targetAudience },
        })
      }
    }

    return successResponse(res, `Notification "${item.title}" re-sent successfully`, item)
  } catch (err) {
    return errorResponse(res, 'Failed to resend notification', 500, err.message)
  }
}

// 5. Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Notification.findByIdAndDelete(id)
    if (!item) return errorResponse(res, 'Notification not found', 404)

    return successResponse(res, `Notification "${item.title}" deleted successfully`)
  } catch (err) {
    return errorResponse(res, 'Failed to delete notification', 500, err.message)
  }
}

// 6. Bulk Delete
export const bulkDelete = async (req, res) => {
  try {
    const { ids = [] } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'IDs required', 400)
    }

    const result = await Notification.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `${result.deletedCount} notifications deleted permanently`)
  } catch (err) {
    return errorResponse(res, 'Failed bulk delete', 500, err.message)
  }
}

// 7. Register / Update FCM Device Token
export const registerToken = async (req, res) => {
  try {
    const { token, fcmToken, role = 'all', phone } = req.body
    const deviceToken = (fcmToken || token || '').trim()

    if (!deviceToken) {
      return errorResponse(res, 'FCM token is required', 400)
    }

    const cleanPhone = phone ? phone.replace('+91', '').replace(/\s+/g, '').trim() : null

    // 1. Always upsert in DeviceToken collection so device can receive push even if not logged in
    await DeviceToken.findOneAndUpdate(
      { token: deviceToken },
      {
        token: deviceToken,
        role: role || 'all',
        phone: cleanPhone || '',
        lastActive: new Date(),
      },
      { upsert: true, new: true }
    )

    let updated = false

    // 2. If phone is provided, match customer/owner by phone
    if (cleanPhone) {
      if (role === 'customer' || role === 'all') {
        const cust = await Customer.findOneAndUpdate(
          { phone: cleanPhone },
          { $addToSet: { fcmTokens: deviceToken } },
          { new: true }
        )
        if (cust) updated = true
      }
      if (role === 'owner' || role === 'all') {
        const own = await Owner.findOneAndUpdate(
          { phone: cleanPhone },
          { $addToSet: { fcmTokens: deviceToken } },
          { new: true }
        )
        if (own) updated = true
      }
    }

    // 3. Also if JWT authenticated user exists on req.user
    if (req.user?.id) {
      if (role === 'owner' || req.user.role === 'owner') {
        await Owner.findByIdAndUpdate(req.user.id, { $addToSet: { fcmTokens: deviceToken } })
        updated = true
      } else if (role === 'customer' || req.user.role === 'customer') {
        await Customer.findByIdAndUpdate(req.user.id, { $addToSet: { fcmTokens: deviceToken } })
        updated = true
      }
    }

    return successResponse(res, 'FCM token registered successfully', {
      token: deviceToken,
      registered: true,
      userMatched: updated,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to register token', 500, err.message)
  }
}

// 8. Test FCM Push Notification to all registered devices
export const testPushNotification = async (req, res) => {
  try {
    const [customers, owners, devices] = await Promise.all([
      Customer.find({ 'fcmTokens.0': { $exists: true } }, 'name phone fcmTokens'),
      Owner.find({ 'fcmTokens.0': { $exists: true } }, 'name phone fcmTokens'),
      DeviceToken.find({}, 'token phone role'),
    ])

    let allTokens = []
    customers.forEach((c) => allTokens.push(...(c.fcmTokens || [])))
    owners.forEach((o) => allTokens.push(...(o.fcmTokens || [])))
    devices.forEach((d) => {
      if (d.token) allTokens.push(d.token)
    })

    allTokens = [...new Set(allTokens.filter((t) => typeof t === 'string' && t.trim().length > 10))]

    if (allTokens.length === 0) {
      return successResponse(res, 'No registered devices found. Open the mobile app first to generate and sync an FCM token!', {
        tokenCount: 0,
        customerCount: customers.length,
        ownerCount: owners.length,
        deviceCount: devices.length,
        status: 'no_tokens',
      })
    }

    const testTitle = '🔔 MachineWala Test Notification'
    const testBody = `FCM Push test successful! Sent at ${new Date().toLocaleTimeString('en-US')}`

    const sendResult = await sendPushNotification({
      tokens: allTokens,
      title: testTitle,
      body: testBody,
      data: { type: 'TEST_NOTIFICATION', time: new Date().toISOString() },
    })

    return successResponse(res, 'Test notification dispatched successfully!', {
      tokenCount: allTokens.length,
      customersWithToken: customers.length,
      ownersWithToken: owners.length,
      deviceTokens: devices.length,
      firebaseResult: sendResult,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to send test push notification', 500, err.message)
  }
}



