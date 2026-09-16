import mongoose from 'mongoose'

const messageSubSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    isStaff: { type: Boolean, default: false },
  },
  { _id: true }
)

const activitySubSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    author: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
)

const attachmentSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: String, default: '245 KB' },
    url: { type: String, default: '' },
  },
  { _id: true }
)

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, trim: true, lowercase: true, default: '' },
    userPhone: { type: String, trim: true, default: '+91 98765 43210' },
    userRole: { type: String, default: 'Customer', enum: ['Customer', 'Owner', 'Visitor'] },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      default: 'Technical',
      enum: ['Technical', 'Payment', 'Listing', 'Account', 'Report', 'General'],
      index: true,
    },
    category: { type: String, default: 'General' },
    priority: {
      type: String,
      default: 'Medium',
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      index: true,
    },
    status: {
      type: String,
      default: 'Open',
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      index: true,
    },
    assignedTo: { type: String, default: 'Unassigned', index: true },
    messages: [messageSubSchema],
    activityLog: [activitySubSchema],
    attachments: [attachmentSubSchema],
  },
  { timestamps: true }
)

// Auto-sync category with type
supportTicketSchema.pre('save', function (next) {
  if (this.type && !this.category) {
    this.category = this.type
  }
  next()
})

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema)
