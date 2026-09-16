import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'Super Admin', enum: ['Super Admin', 'Admin', 'Moderator'] },
    avatar: { type: String, default: '' },
    dob: { type: String, default: '15 Aug 1995' },
    gender: { type: String, default: 'Male' },
    location: { type: String, default: 'Lucknow, Uttar Pradesh' },
    preferences: {
      language: { type: String, default: 'English' },
      emailNotifications: { type: Boolean, default: true },
      timezone: { type: String, default: '(GMT+05:30) India Standard Time' },
      dashboardLayout: { type: String, default: 'Default' },
    },
    is2FAActive: { type: Boolean, default: true },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
    lastPasswordChange: { type: Date, default: Date.now },
    sessions: [
      {
        device: { type: String, default: 'Desktop' },
        browser: { type: String, default: 'Chrome' },
        ip: { type: String, default: '127.0.0.1' },
        location: { type: String, default: 'India' },
        lastActive: { type: Date, default: Date.now },
        isCurrent: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
)

export const Admin = mongoose.model('Admin', adminSchema)
