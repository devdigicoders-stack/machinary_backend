import { Notification } from '../models/Notification.js'
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

    const item = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience: audience,
      status: isScheduled ? 'Scheduled' : 'Delivered',
      isScheduled: Boolean(isScheduled),
      scheduledDate,
      scheduledTime,
      recipientCount: audience === 'All Users' ? 1620 : audience === 'Owners' ? 380 : 1240,
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
