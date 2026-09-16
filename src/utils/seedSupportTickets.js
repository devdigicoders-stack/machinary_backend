import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { SupportTicket } from '../models/SupportTicket.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultTickets = [
  {
    ticketId: '#SUP-1001',
    subject: 'Unable to post machine listing',
    userName: 'Rohit Sharma',
    userEmail: 'rohit@example.com',
    userPhone: '+91 98765 43210',
    userRole: 'Owner',
    type: 'Technical',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Neha Sharma',
    description:
      'I am trying to post a new machine listing but it shows an error "Something went wrong". Please help me resolve this issue.',
    messages: [
      {
        sender: 'Rohit Sharma',
        text: 'Hello, I keep encountering an error when uploading machine images.',
        sentAt: new Date(Date.now() - 3600000 * 24 * 3),
        isStaff: false,
      },
      {
        sender: 'Neha Sharma (Support)',
        text: 'Hi Rohit, could you please verify image formats are JPG/PNG under 5MB?',
        sentAt: new Date(Date.now() - 3600000 * 24 * 2),
        isStaff: true,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Rohit Sharma', timestamp: new Date(Date.now() - 3600000 * 24 * 3) },
      { action: 'Assigned to Neha Sharma', author: 'System', timestamp: new Date(Date.now() - 3600000 * 24 * 3) },
    ],
    attachments: [{ name: 'error_screenshot.png', size: '245 KB', url: '' }],
  },
  {
    ticketId: '#SUP-1002',
    subject: 'Payment not reflecting',
    userName: 'Priya Verma',
    userEmail: 'priya@example.com',
    userPhone: '+91 98234 56789',
    userRole: 'Owner',
    type: 'Payment',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Amit Kumar',
    description:
      'I made a payment 2 days ago for featured listing but my subscription is still not activated. Transaction ID: TXN98765.',
    messages: [
      {
        sender: 'Priya Verma',
        text: 'Payment of ₹1,800 was debited but status still shows Pending.',
        sentAt: new Date(Date.now() - 3600000 * 48),
        isStaff: false,
      },
      {
        sender: 'Amit Kumar (Support)',
        text: 'Checking with our payment gateway team. Will update shortly.',
        sentAt: new Date(Date.now() - 3600000 * 24),
        isStaff: true,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Priya Verma', timestamp: new Date(Date.now() - 3600000 * 48) },
      { action: 'Assigned to Amit Kumar', author: 'System', timestamp: new Date(Date.now() - 3600000 * 48) },
      { action: 'Status changed to In Progress', author: 'Amit Kumar', timestamp: new Date(Date.now() - 3600000 * 24) },
    ],
    attachments: [{ name: 'bank_receipt.pdf', size: '412 KB', url: '' }],
  },
  {
    ticketId: '#SUP-1003',
    subject: 'Change in machine details',
    userName: 'Sanjay Patel',
    userEmail: 'sanjay@example.com',
    userPhone: '+91 98123 45678',
    userRole: 'Owner',
    type: 'Listing',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Rahul Singh',
    description:
      'I need to update the machine specifications. The current listing shows wrong year of manufacture (2020 instead of 2022).',
    messages: [
      {
        sender: 'Sanjay Patel',
        text: 'Please update my JCB 3DX year to 2022. RC copy attached.',
        sentAt: new Date(Date.now() - 3600000 * 72),
        isStaff: false,
      },
      {
        sender: 'Rahul Singh (Support)',
        text: 'Specifications updated successfully according to RC document.',
        sentAt: new Date(Date.now() - 3600000 * 30),
        isStaff: true,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Sanjay Patel', timestamp: new Date(Date.now() - 3600000 * 72) },
      { action: 'Assigned to Rahul Singh', author: 'System', timestamp: new Date(Date.now() - 3600000 * 72) },
      { action: 'Marked as Resolved', author: 'Rahul Singh', timestamp: new Date(Date.now() - 3600000 * 30) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1004',
    subject: 'Account verification issue',
    userName: 'Vikram Singh',
    userEmail: 'vikram@example.com',
    userPhone: '+91 97654 32109',
    userRole: 'Customer',
    type: 'Account',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Neha Sharma',
    description:
      'My account is showing as "under review" for the past 5 days. I have submitted all KYC documents properly.',
    messages: [
      {
        sender: 'Vikram Singh',
        text: 'Kindly approve my profile so I can rent machines.',
        sentAt: new Date(Date.now() - 3600000 * 36),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Vikram Singh', timestamp: new Date(Date.now() - 3600000 * 36) },
      { action: 'Assigned to Neha Sharma', author: 'System', timestamp: new Date(Date.now() - 3600000 * 36) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1005',
    subject: 'Refund request',
    userName: 'Amit Tiwari',
    userEmail: 'amit@example.com',
    userPhone: '+91 99887 76655',
    userRole: 'Owner',
    type: 'Payment',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Pooja Khanna',
    description:
      'I want a refund for the premium listing pack as I sold my fleet offline.',
    messages: [
      {
        sender: 'Amit Tiwari',
        text: 'Requesting refund as per standard policy.',
        sentAt: new Date(Date.now() - 3600000 * 50),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Amit Tiwari', timestamp: new Date(Date.now() - 3600000 * 50) },
      { action: 'Assigned to Pooja Khanna', author: 'System', timestamp: new Date(Date.now() - 3600000 * 50) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1006',
    subject: 'Unable to login',
    userName: 'Neha Gupta',
    userEmail: 'neha@example.com',
    userPhone: '+91 98711 22334',
    userRole: 'Customer',
    type: 'Technical',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Amit Kumar',
    description:
      'I am unable to login to my account. Forgot password OTP is not arriving.',
    messages: [
      {
        sender: 'Neha Gupta',
        text: 'OTP delivery issue on Airtel mobile network.',
        sentAt: new Date(Date.now() - 3600000 * 60),
        isStaff: false,
      },
      {
        sender: 'Amit Kumar (Support)',
        text: 'SMS gateway restored and password reset link dispatched via email.',
        sentAt: new Date(Date.now() - 3600000 * 20),
        isStaff: true,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Neha Gupta', timestamp: new Date(Date.now() - 3600000 * 60) },
      { action: 'Marked as Resolved', author: 'Amit Kumar', timestamp: new Date(Date.now() - 3600000 * 20) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1007',
    subject: 'Report inappropriate listing',
    userName: 'Karan Mehta',
    userEmail: 'karan@example.com',
    userPhone: '+91 98456 78901',
    userRole: 'Visitor',
    type: 'Report',
    priority: 'Medium',
    status: 'Closed',
    assignedTo: 'Rahul Singh',
    description:
      'There is a listing with fraudulent rate information and duplicate photos.',
    messages: [
      {
        sender: 'Karan Mehta',
        text: 'Please review listing MH-1012.',
        sentAt: new Date(Date.now() - 3600000 * 90),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Karan Mehta', timestamp: new Date(Date.now() - 3600000 * 90) },
      { action: 'Listing reviewed and ticket closed', author: 'Rahul Singh', timestamp: new Date(Date.now() - 3600000 * 80) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1008',
    subject: 'Need help in machine rental',
    userName: 'Deepak Yadav',
    userEmail: 'deepak@example.com',
    userPhone: '+91 99112 23344',
    userRole: 'Customer',
    type: 'General',
    priority: 'Low',
    status: 'In Progress',
    assignedTo: 'Neha Sharma',
    description:
      'I need guidance on how to rent an Excavator through the platform for 15 days in Lucknow.',
    messages: [
      {
        sender: 'Deepak Yadav',
        text: 'First time user. Need pricing guide.',
        sentAt: new Date(Date.now() - 3600000 * 18),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Deepak Yadav', timestamp: new Date(Date.now() - 3600000 * 18) },
      { action: 'Assigned to Neha Sharma', author: 'System', timestamp: new Date(Date.now() - 3600000 * 18) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1009',
    subject: 'KYC document update',
    userName: 'Anjali Singh',
    userEmail: 'anjali@example.com',
    userPhone: '+91 98321 65498',
    userRole: 'Owner',
    type: 'Account',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Pooja Khanna',
    description:
      'I need to update my GST registration certificate as our firm got incorporated as Private Limited.',
    messages: [
      {
        sender: 'Anjali Singh',
        text: 'New GST certificate attached.',
        sentAt: new Date(Date.now() - 3600000 * 85),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Anjali Singh', timestamp: new Date(Date.now() - 3600000 * 85) },
      { action: 'GST certificate updated and verified', author: 'Pooja Khanna', timestamp: new Date(Date.now() - 3600000 * 40) },
    ],
    attachments: [],
  },
  {
    ticketId: '#SUP-1010',
    subject: 'Feature promotion issue',
    userName: 'Manish Patel',
    userEmail: 'manish@example.com',
    userPhone: '+91 97531 86420',
    userRole: 'Owner',
    type: 'Listing',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Amit Kumar',
    description:
      'I paid for featured listing promotion but my excavator is not appearing with the PRO badge.',
    messages: [
      {
        sender: 'Manish Patel',
        text: 'Kindly activate promotion badge on listing MH-1005.',
        sentAt: new Date(Date.now() - 3600000 * 12),
        isStaff: false,
      },
    ],
    activityLog: [
      { action: 'Ticket created', author: 'Manish Patel', timestamp: new Date(Date.now() - 3600000 * 12) },
      { action: 'Assigned to Amit Kumar', author: 'System', timestamp: new Date(Date.now() - 3600000 * 12) },
    ],
    attachments: [],
  },
]

export const seedSupportTickets = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env')

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB Atlas for Support Tickets seeding...')

    await SupportTicket.deleteMany({})
    console.log('Existing support tickets cleared.')

    const result = await SupportTicket.insertMany(defaultTickets)
    console.log(`Successfully seeded ${result.length} support tickets into Atlas.`)

    process.exit(0)
  } catch (err) {
    console.error('Seeding error:', err)
    process.exit(1)
  }
}

if (process.argv[1]?.endsWith('seedSupportTickets.js')) {
  seedSupportTickets()
}
