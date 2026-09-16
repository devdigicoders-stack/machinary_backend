import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    listingTitle: { type: String, required: true },
    reportedBy: { type: String, default: 'Anonymous User' },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Reviewed', 'Dismissed', 'Action Taken'] },
    actionTaken: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Report = mongoose.model('Report', reportSchema)
