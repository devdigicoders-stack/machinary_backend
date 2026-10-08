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

const ownerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: 'Lucknow, UP' },
    city: { type: String, trim: true, default: 'Lucknow' },
    state: { type: String, trim: true, default: 'UP' },
    avatarImg: { type: String, default: '' },
    initials: { type: String, default: '' },
    avatarBg: { type: String, default: '' },
    machines: { type: Number, default: 1 },
    fleetSize: { type: Number, default: 1 },
    kycStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Verified', 'Rejected'],
    },
    gstNumber: { type: String, trim: true, default: '' },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Suspended', 'Pending Review'],
    },
    notes: [noteSchema],
    history: [historySchema],
    fcmTokens: [{ type: String }],
  },
  {
    timestamps: true,
  }
)

// Pre-save hook: sync fields & compute initials
ownerSchema.pre('save', function (next) {
  // Sync machines and fleetSize
  if (this.isModified('machines') && !this.isModified('fleetSize')) {
    this.fleetSize = this.machines
  } else if (this.isModified('fleetSize') && !this.isModified('machines')) {
    this.machines = this.fleetSize
  }

  // Derive city and state if location provided
  if (this.location && (!this.city || !this.state)) {
    const parts = this.location.split(',').map((p) => p.trim())
    if (parts[0] && !this.city) this.city = parts[0]
    if (parts[1] && !this.state) this.state = parts[1]
  }

  // Compute initials if not present
  if (!this.initials && this.name) {
    this.initials = this.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  next()
})

export const Owner = mongoose.model('Owner', ownerSchema)
