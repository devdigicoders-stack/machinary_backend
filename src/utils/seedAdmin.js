import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Admin } from '../models/Admin.js'

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file')
      process.exit(1)
    }

    console.log('⏳ Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    const email = 'admin@gmail.com'
    const plainPassword = 'admin123'

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })

    if (existingAdmin) {
      existingAdmin.password = hashedPassword
      existingAdmin.name = 'Super Admin'
      existingAdmin.role = 'Super Admin'
      existingAdmin.status = 'Active'
      await existingAdmin.save()
      console.log(`✨ Admin with email ${email} already existed. Password updated to: ${plainPassword}`)
    } else {
      const newAdmin = await Admin.create({
        name: 'Super Admin',
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'Super Admin',
        status: 'Active',
        is2FAActive: true,
      })
      console.log(`🎉 Admin created successfully!`)
      console.log(`ID: ${newAdmin._id}`)
    }

    console.log(`-----------------------------------------`)
    console.log(`📧 Email:    ${email}`)
    console.log(`🔑 Password: ${plainPassword}`)
    console.log(`👑 Role:     Super Admin`)
    console.log(`-----------------------------------------`)

    await mongoose.disconnect()
    console.log('🔌 Database disconnected successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message)
    process.exit(1)
  }
}

seedAdmin()
