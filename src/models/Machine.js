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

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },
    year: { type: String, default: '2023', trim: true },
    subtitle: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true },
    machineType: {
      type: String,
      default: 'Construction',
      enum: ['Commercial', 'Construction', 'Agriculture', 'Heavy Equipment'],
    },
    owner: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
    location: { type: String, default: 'Lucknow, UP', trim: true },
    regNo: { type: String, required: true, trim: true },
    listingType: {
      type: String,
      default: 'Rent',
      enum: ['Rent', 'Buy'],
    },
    image: { type: String, default: '' },
    images: [{ type: String }],
    specifications: {
      enginePower: { type: String, default: '' },
      operatingWeight: { type: String, default: '' },
      fuelType: { type: String, default: 'Diesel' },
      meterHours: { type: String, default: '' },
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Pending', 'Under Maintenance'],
    },
    notes: [noteSchema],
    history: [historySchema],
  },
  { timestamps: true }
)

// Pre-save hook: auto-compute subtitle
machineSchema.pre('save', function (next) {
  if (!this.subtitle && (this.brand || this.name)) {
    const brandName = this.brand || this.name.split(' ')[0]
    const modelName = this.model || this.name.split(' ').slice(1).join(' ') || 'Standard'
    this.subtitle = `${brandName} | ${modelName} | ${this.year || '2023'}`
  }
  next()
})

export const Machine = mongoose.model('Machine', machineSchema)
