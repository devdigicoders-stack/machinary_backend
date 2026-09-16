import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    pageType: {
      type: String,
      enum: ['Static', 'Legal', 'Dynamic', 'Landing'],
      default: 'Static',
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Under Review', 'Archived'],
      default: 'Draft',
    },
    content: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    authorName: { type: String, default: 'Admin' },
    authorAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

contentSchema.index({ pageType: 1, status: 1 })
contentSchema.index({ title: 'text', subtitle: 'text' })

export const Content = mongoose.model('Content', contentSchema)
