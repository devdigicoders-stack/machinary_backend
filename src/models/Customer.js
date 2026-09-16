import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, default: 'India' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    registrationType: {
      type: String,
      default: 'Individual',
      enum: ['Individual', 'Business'],
    },
    businessName: { type: String, default: '' },
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
  },
  { timestamps: true }
)

// Auto parse city & state if location is given
customerSchema.pre('save', function () {
  if (this.location && (!this.city || !this.state)) {
    const parts = this.location.split(',').map((p) => p.trim())
    if (parts[0] && !this.city) this.city = parts[0]
    if (parts[1] && !this.state) this.state = parts[1]
  }
})

export const Customer = mongoose.model('Customer', customerSchema)
