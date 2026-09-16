import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    icon: { type: String, default: 'Truck' },
    subcategories: { type: Number, default: 1 },
    machinesCount: { type: Number, default: 0 },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive'],
    },
  },
  { timestamps: true }
)

// Pre-validate hook: generate slug if not provided
categorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
  next()
})

export const Category = mongoose.model('Category', categorySchema)
