import mongoose from 'mongoose'

const reportSubSchema = new mongoose.Schema(
  {
    reporterName: { type: String, default: 'Anonymous User' },
    reporterEmail: { type: String, default: 'anonymous@machinerywallah.com' },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    time: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    actionTaken: { type: String, default: '' },
    resolvedAt: { type: Date },
    resolvedBy: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
)

const historySubSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    author: { type: String, default: 'System' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const listingSchema = new mongoose.Schema(
  {
    listingCode: { type: String, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['Rent', 'Sale'], index: true },
    rateOrPrice: { type: String, required: true },
    rateUnit: { type: String, default: 'per day' },
    securityDeposit: { type: String, default: 'N/A' },
    minDuration: { type: String, default: 'Flexible' },
    operatorIncluded: { type: Boolean, default: false },

    // Equipment Specs
    modelYear: { type: String, default: '2023' },
    hoursUsed: { type: String, default: '0 hrs' },
    description: { type: String, default: '' },
    insuranceValidTill: { type: String, default: 'N/A' },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Owner / Location
    ownerName: { type: String, required: true, index: true },
    ownerPhone: { type: String, required: true },
    ownerKyc: { type: String, default: 'Verified' },
    location: {
      city: { type: String, default: 'Lucknow' },
      state: { type: String, default: 'Uttar Pradesh' },
      address: { type: String, default: '' },
    },

    // Documents & Moderation
    rcNumber: { type: String, trim: true, default: '' },
    docStatus: { type: String, default: 'Uploaded & Clear' },
    approvalStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Rejected'],
      index: true,
    },
    approvedBy: { type: String, default: '' },
    approvalDate: { type: Date },
    rejectionReason: { type: String, default: '' },
    rejectionNote: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },

    // Operational Status
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Pending', 'Under Review', 'Rejected'],
      index: true,
    },
    availability: {
      type: String,
      default: 'Available Now',
      enum: ['Available Now', 'On Rent', 'Sold', 'Under Maintenance'],
      index: true,
    },

    // Promotion & Featured
    isFeatured: { type: Boolean, default: false, index: true },
    promotionType: {
      type: String,
      default: 'None',
      enum: ['None', 'Featured', 'Spotlight', 'Top Listing', 'Promoted', 'Standard'],
      index: true,
    },
    promotionStartDate: { type: Date },
    promotionEndDate: { type: Date },
    promotionStatus: {
      type: String,
      default: 'None',
      enum: ['None', 'Active', 'Expired', 'Scheduled'],
    },
    promotionViews: { type: Number, default: 0 },

    // Reporting & Flags
    isReported: { type: Boolean, default: false, index: true },
    reportCount: { type: Number, default: 0 },
    reports: [reportSubSchema],

    // Assets & Metrics
    image: { type: String, default: '' },
    images: [{ type: String }],
    viewsCount: { type: Number, default: 0 },

    // Audit Trail
    history: [historySubSchema],
  },
  { timestamps: true }
)

// Auto-generate unique listingCode if not present (e.g. MH-1001)
listingSchema.pre('save', async function (next) {
  if (!this.listingCode) {
    const count = await mongoose.model('Listing').countDocuments()
    this.listingCode = `MH-${1001 + count}`
  }
  if (!this.image && this.images && this.images.length > 0) {
    this.image = this.images[0]
  }
  next()
})

export const Listing = mongoose.model('Listing', listingSchema)
