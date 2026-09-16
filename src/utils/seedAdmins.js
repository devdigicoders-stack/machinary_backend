import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { Admin } from '../models/Admin.js'

dotenv.config()

const adminsToSeed = [
  {
    name: 'Neha Sharma',
    email: 'neha.sharma@example.com',
    password: 'password123',
    phone: '+91 98765 11223',
    role: 'Moderator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    dob: '12 Sep 1994',
    gender: 'Female',
    location: 'Delhi, Delhi',
    status: 'Active',
    preferences: {
      language: 'English',
      emailNotifications: true,
      timezone: '(GMT+05:30) India Standard Time',
      dashboardLayout: 'Default',
    },
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    password: 'password123',
    phone: '+91 97123 44556',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    dob: '18 Nov 1991',
    gender: 'Male',
    location: 'Mumbai, Maharashtra',
    status: 'Active',
    preferences: {
      language: 'English',
      emailNotifications: true,
      timezone: '(GMT+05:30) India Standard Time',
      dashboardLayout: 'Default',
    },
  },
  {
    name: 'Pooja Khanna',
    email: 'pooja.khanna@example.com',
    password: 'password123',
    phone: '+91 99887 66554',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    dob: '24 Jul 1993',
    gender: 'Female',
    location: 'Lucknow, Uttar Pradesh',
    status: 'Active',
    preferences: {
      language: 'English',
      emailNotifications: true,
      timezone: '(GMT+05:30) India Standard Time',
      dashboardLayout: 'Default',
    },
  },
]

async function seedAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB Atlas...')

    for (const a of adminsToSeed) {
      const exists = await Admin.findOne({ email: a.email.toLowerCase() })
      if (!exists) {
        const hashedPassword = await bcrypt.hash(a.password, 10)
        await Admin.create({
          ...a,
          password: hashedPassword,
        })
        console.log(`Created admin: ${a.name} (${a.email})`)
      } else {
        console.log(`Admin already exists: ${a.email}`)
      }
    }

    const totalAdmins = await Admin.countDocuments()
    console.log(`Total admins in database: ${totalAdmins}`)
    process.exit(0)
  } catch (err) {
    console.error('Error seeding admins:', err)
    process.exit(1)
  }
}

seedAdmins()
