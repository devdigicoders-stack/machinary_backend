import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import readline from 'readline'
import { Admin } from '../models/Admin.js'

// Helper function to prompt user from CLI
function askQuestion(rl, query, defaultValue = '') {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `
    rl.question(promptText, (answer) => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

async function createAdminInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('\n=========================================')
  console.log('   MACHINERY WALLAH - CREATE ADMIN SCRIPT ')
  console.log('=========================================\n')

  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file')
      process.exit(1)
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log(' MongoDB connected successfully!\n')

    // 1. Full Name
    let name = ''
    while (!name) {
      name = await askQuestion(rl, 'Enter Admin Name')
      if (!name) console.log('⚠️  Name is required!')
    }

    // 2. Email
    let email = ''
    while (!email) {
      email = await askQuestion(rl, 'Enter Admin Email')
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email || !emailRegex.test(email)) {
        console.log('⚠️  Please enter a valid email address!')
        email = ''
      }
    }

    // 3. Password
    let password = ''
    while (!password || password.length < 6) {
      password = await askQuestion(rl, 'Enter Admin Password (min 6 chars)')
      if (password.length < 6) {
        console.log('⚠️  Password must be at least 6 characters long!')
      }
    }

    // 4. Phone
    const phone = await askQuestion(rl, 'Enter Phone Number (optional)', '')

    // 5. Role
    console.log('\nSelect Role:')
    console.log(' 1. Super Admin')
    console.log(' 2. Admin')
    console.log(' 3. Moderator')
    const roleChoice = await askQuestion(rl, 'Choose role (1/2/3)', '1')
    let role = 'Super Admin'
    if (roleChoice === '2') role = 'Admin'
    else if (roleChoice === '3') role = 'Moderator'

    // 6. Location
    const location = await askQuestion(rl, 'Enter Location', 'Lucknow, Uttar Pradesh')

    // 7. Status
    console.log('\nSelect Status:')
    console.log(' 1. Active')
    console.log(' 2. Inactive')
    const statusChoice = await askQuestion(rl, 'Choose status (1/2)', '1')
    const status = statusChoice === '2' ? 'Inactive' : 'Active'

    console.log('\n-----------------------------------------')
    console.log('Creating Admin with details:')
    console.log(` Name:     ${name}`)
    console.log(` Email:    ${email}`)
    console.log(` Role:     ${role}`)
    console.log(` Phone:    ${phone || 'N/A'}`)
    console.log(` Location: ${location}`)
    console.log(` Status:   ${status}`)
    console.log('-----------------------------------------\n')

    const confirm = await askQuestion(rl, 'Proceed to save? (y/n)', 'y')
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled by user.')
      rl.close()
      await mongoose.disconnect()
      process.exit(0)
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Check if email already exists
    const existing = await Admin.findOne({ email: email.toLowerCase() })

    if (existing) {
      console.log(`\n⚠️  Admin with email "${email}" already exists!`)
      const overwrite = await askQuestion(rl, 'Do you want to update this admin? (y/n)', 'n')
      if (overwrite.toLowerCase() === 'y') {
        existing.name = name
        existing.password = hashedPassword
        existing.role = role
        existing.phone = phone
        existing.location = location
        existing.status = status
        existing.lastPasswordChange = new Date()
        await existing.save()
        console.log('\n Admin updated successfully!')
      } else {
        console.log('❌ Operation skipped.')
      }
    } else {
      const createdAdmin = await Admin.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role,
        location,
        status,
        is2FAActive: true,
      })
      console.log('\n🎉 Admin Created Successfully!')
      console.log(`🆔 Admin ID: ${createdAdmin._id}`)
    }

    console.log('\n=========================================')
    console.log('   LOGIN CREDENTIALS SUMMARY')
    console.log('=========================================')
    console.log(` Email:    ${email}`)
    console.log(` Password: ${password}`)
    console.log(` Role:     ${role}`)
    console.log('=========================================\n')

    rl.close()
    await mongoose.disconnect()
    console.log('🔌 Database connection closed.')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error creating admin:', err.message)
    rl.close()
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

createAdminInteractive()
