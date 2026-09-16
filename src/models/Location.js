import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    country: { type: String, default: 'India', trim: true },
    countryCode: { type: String, default: 'IN', uppercase: true, trim: true },
    flag: { type: String, default: '🇮🇳' },
    state: { type: String, required: true, trim: true },
    stateCode: { type: String, uppercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincodes: [{ type: String, trim: true }],
    pincodesCount: { type: Number, default: 1 },
    tier: { type: String, default: 'Tier 2', enum: ['Tier 1', 'Tier 2', 'Tier 3'] },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
  },
  { timestamps: true }
)

// Compound Index for efficient location search & cascading queries
locationSchema.index({ country: 1, state: 1, city: 1 })
locationSchema.index({ state: 1, status: 1 })
locationSchema.index({ city: 1 })

export const Location = mongoose.model('Location', locationSchema)
