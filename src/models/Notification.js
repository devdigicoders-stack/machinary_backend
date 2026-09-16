import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Push', 'Email', 'SMS', 'System', 'In-App'],
      default: 'Push',
    },
    targetAudience: {
      type: String,
      enum: ['All Users', 'Customers', 'Owners', 'New Users', 'Users', 'Admins'],
      default: 'All Users',
    },
    status: {
      type: String,
      enum: ['Delivered', 'Scheduled', 'Pending', 'Failed'],
      default: 'Delivered',
    },
    isScheduled: { type: Boolean, default: false },
    scheduledDate: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    recipientCount: { type: Number, default: 1 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ type: 1, status: 1 })
notificationSchema.index({ targetAudience: 1 })
notificationSchema.index({ createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
