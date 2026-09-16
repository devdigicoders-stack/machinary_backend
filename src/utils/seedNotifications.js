import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Notification } from '../models/Notification.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultNotifications = [
  {
    title: 'Welcome to MachineryHub!',
    message: 'Thank you for joining MachineryHub. Start exploring machines for rent and sale across India.',
    type: 'Push',
    targetAudience: 'All Users',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 1620,
    isRead: true,
    createdAt: new Date('2025-09-12T10:30:00Z'),
  },
  {
    title: 'Your Listing is Approved',
    message: 'Good news! Your machine listing has been approved and is now live for contractors to hire.',
    type: 'Push',
    targetAudience: 'Owners',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 380,
    isRead: true,
    createdAt: new Date('2025-09-11T16:15:00Z'),
  },
  {
    title: 'Special Offer for Owners',
    message: 'Get 20% discount on featured equipment promotion listings this weekend only.',
    type: 'Email',
    targetAudience: 'Owners',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 380,
    isRead: false,
    createdAt: new Date('2025-09-10T14:40:00Z'),
  },
  {
    title: 'New Enquiry Received',
    message: 'You have received a new customer hire enquiry for your JCB 3DX Backhoe Loader in Lucknow.',
    type: 'Push',
    targetAudience: 'Owners',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 1,
    isRead: false,
    createdAt: new Date('2025-09-09T11:20:00Z'),
  },
  {
    title: 'Complete Your Profile & KYC',
    message: 'Upload your business RC and verification documents to unlock higher machine search ranking.',
    type: 'Push',
    targetAudience: 'New Users',
    status: 'Pending',
    isScheduled: true,
    scheduledDate: '2025-09-20',
    scheduledTime: '10:00 AM',
    recipientCount: 240,
    isRead: false,
    createdAt: new Date('2025-09-09T09:30:00Z'),
  },
  {
    title: 'Subscription Expiring Soon',
    message: 'Your featured machine spotlight plan will expire in 3 days. Renew now to maintain priority.',
    type: 'Email',
    targetAudience: 'Owners',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 45,
    isRead: false,
    createdAt: new Date('2025-09-08T15:15:00Z'),
  },
  {
    title: 'New Machinery Search Launched',
    message: 'We have launched new quick search filters to make finding heavy cranes and loaders effortless.',
    type: 'SMS',
    targetAudience: 'All Users',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 1620,
    isRead: true,
    createdAt: new Date('2025-09-07T12:10:00Z'),
  },
  {
    title: 'Promotion Payment Successful',
    message: 'Your payment of ₹1,800 for Spotlight promotion was verified and activated successfully.',
    type: 'Push',
    targetAudience: 'Owners',
    status: 'Delivered',
    isScheduled: false,
    recipientCount: 1,
    isRead: true,
    createdAt: new Date('2025-09-06T17:45:00Z'),
  },
  {
    title: 'Customer Helpline System Update',
    message: 'Our dispatch team is now available 24/7 for breakdown assistance and operator replacement.',
    type: 'Push',
    targetAudience: 'All Users',
    status: 'Failed',
    isScheduled: false,
    recipientCount: 120,
    isRead: false,
    createdAt: new Date('2025-09-05T13:20:00Z'),
  },
  {
    title: 'Festive Season Bonanza',
    message: 'Flat 30% off on all monthly machinery rental listings. Limited period offer across all cities.',
    type: 'Email',
    targetAudience: 'All Users',
    status: 'Scheduled',
    isScheduled: true,
    scheduledDate: '2025-10-20',
    scheduledTime: '09:00 AM',
    recipientCount: 2000,
    isRead: false,
    createdAt: new Date('2025-09-05T11:10:00Z'),
  },
]

export const seedNotifications = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) return console.log('❌ MONGODB_URI not found')

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri)
    }

    console.log('🌱 Checking Notifications in MongoDB Atlas...')
    const count = await Notification.countDocuments()
    if (count > 0) {
      console.log(`ℹ️ Notifications already present (${count} items). Refreshing default records...`)
      await Notification.deleteMany({})
    }

    const inserted = await Notification.insertMany(defaultNotifications)
    console.log(`✅ Successfully seeded ${inserted.length} notifications into MongoDB Atlas!`)
    return inserted
  } catch (err) {
    console.error('❌ Error seeding notifications:', err)
  }
}

if (process.argv[1]?.endsWith('seedNotifications.js')) {
  seedNotifications().then(() => {
    mongoose.disconnect()
    process.exit(0)
  })
}
