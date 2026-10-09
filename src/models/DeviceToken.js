import mongoose from 'mongoose'

const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, trim: true },
    role: { type: String, default: 'all', enum: ['all', 'customer', 'owner', 'admin'] },
    phone: { type: String, default: '', trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
    userModel: { type: String, enum: ['Customer', 'Owner', 'Admin'] },
    platform: { type: String, default: 'android' },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

deviceTokenSchema.index({ token: 1 })
deviceTokenSchema.index({ role: 1 })

export const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema)
