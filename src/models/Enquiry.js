import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const historySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const enquirySchema = new mongoose.Schema(
  {
    enquiryId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    customerName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    customerEmail: { type: String, lowercase: true, trim: true, default: '' },
    machine: { type: String, required: true, trim: true },
    machineName: { type: String, trim: true },
    fullMachineName: { type: String, trim: true, default: '' },
    enquiryType: {
      type: String,
      default: 'Buy',
      enum: ['Buy', 'Rent', 'Sell', 'Sale', 'Transport', 'Material'],
    },
    category: { type: String, default: '' },
    location: { type: String, default: 'Lucknow, UP' },
    preferredLocation: { type: String, default: '' },
    pickupLocation: { type: String, default: '' },
    dropLocation: { type: String, default: '' },
    duration: { type: String, default: '' },
    dailyRate: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    quantity: { type: String, default: '' },
    unit: { type: String, default: '' },
    vehicleType: { type: String, default: '' },
    materialGrade: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    quotesCount: { type: Number, default: 0 },
    budgetRange: { type: String, default: '' },
    requirementDate: { type: String, default: 'Immediate' },
    assignedTo: { type: String, default: 'Unassigned' },
    source: { type: String, default: 'Website' },
    message: { type: String, default: '' },
    status: {
      type: String,
      default: 'New',
      enum: ['New', 'Contacted', 'Converted', 'Closed'],
    },
    notes: [noteSchema],
    history: [historySchema],
  },
  { timestamps: true }
)

// Pre-save synchronization hook
enquirySchema.pre('save', function () {
  if (this.name && !this.customerName) this.customerName = this.name
  if (this.customerName && !this.name) this.name = this.customerName

  if (this.phone && !this.customerPhone) this.customerPhone = this.phone
  if (this.customerPhone && !this.phone) this.phone = this.customerPhone

  if (this.email && !this.customerEmail) this.customerEmail = this.email
  if (this.customerEmail && !this.email) this.email = this.customerEmail

  if (this.machine && !this.machineName) this.machineName = this.machine
  if (this.machineName && !this.machine) this.machine = this.machineName

  if (!this.fullMachineName) this.fullMachineName = this.machine
  if (!this.preferredLocation) this.preferredLocation = this.location

  if (!this.enquiryId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    this.enquiryId = `#ENQ-${randomSuffix}`
  }

  // Initial creation history entry
  if (this.isNew && (!this.history || this.history.length === 0)) {
    this.history = [
      {
        action: `Enquiry submitted via ${this.source || 'Website'} for ${this.machine}`,
        author: 'System',
        createdAt: new Date(),
      },
    ]
  }
})

export const Enquiry = mongoose.model('Enquiry', enquirySchema)
