import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Customer', trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    companyName: { type: String, default: '' },
    businessName: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    location: { type: String, default: 'India' },
    registrationType: {
      type: String,
      default: 'Individual',
      enum: ['Individual', 'Business'],
    },
    kycStatus: {
      type: String,
      default: 'Verified',
      enum: ['Pending', 'Verified', 'Rejected'],
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Blocked'],
    },
    listings: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    avatarZoom: { type: Number, default: 1.0 },
    avatarPanX: { type: Number, default: 0.0 },
    avatarPanY: { type: Number, default: 0.0 },
  },
  { timestamps: true }
)

// Auto parse location
customerSchema.pre('save', function () {
  if (this.city && this.state && (!this.location || this.location === 'India')) {
    this.location = `${this.city}, ${this.state}`
  } else if (this.location && (!this.city || !this.state)) {
    const parts = this.location.split(',').map((p) => p.trim())
    if (parts[0] && !this.city) this.city = parts[0]
    if (parts[1] && !this.state) this.state = parts[1]
  }
})

export const Customer = mongoose.model('Customer', customerSchema)
