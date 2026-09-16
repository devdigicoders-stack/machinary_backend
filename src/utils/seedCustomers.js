import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Customer } from '../models/Customer.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultCustomers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98765 43210',
    location: 'Lucknow, UP',
    city: 'Lucknow',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 5,
    totalBookings: 8,
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 87654 32109',
    location: 'Delhi, DL',
    city: 'Delhi',
    state: 'DL',
    registrationType: 'Business',
    businessName: 'Sharma Infra & Earthmovers',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 3,
    totalBookings: 12,
  },
  {
    name: 'Amit Mishra',
    email: 'amit.mishra@gmail.com',
    phone: '+91 76543 21098',
    location: 'Kanpur, UP',
    city: 'Kanpur',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 7,
    totalBookings: 4,
  },
  {
    name: 'Sunita Verma',
    email: 'sunita.v@example.com',
    phone: '+91 65432 10987',
    location: 'Varanasi, UP',
    city: 'Varanasi',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Inactive',
    kycStatus: 'Pending',
    listings: 1,
    totalBookings: 1,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '+91 98123 45678',
    location: 'Agra, UP',
    city: 'Agra',
    state: 'UP',
    registrationType: 'Business',
    businessName: 'Singh Heavy Machinery Works',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 4,
    totalBookings: 15,
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    phone: '+91 87234 56789',
    location: 'Noida, UP',
    city: 'Noida',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 2,
    totalBookings: 3,
  },
  {
    name: 'Pooja Patel',
    email: 'pooja.patel@gmail.com',
    phone: '+91 91234 56780',
    location: 'Prayagraj, UP',
    city: 'Prayagraj',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 6,
    totalBookings: 9,
  },
  {
    name: 'Suresh Yadav',
    email: 'suresh.yadav@example.com',
    phone: '+91 94321 09876',
    location: 'Gorakhpur, UP',
    city: 'Gorakhpur',
    state: 'UP',
    registrationType: 'Individual',
    status: 'Inactive',
    kycStatus: 'Pending',
    listings: 0,
    totalBookings: 0,
  },
  {
    name: 'Manish Tiwari',
    email: 'manish.tiwari@gmail.com',
    phone: '+91 77665 44332',
    location: 'Indore, MP',
    city: 'Indore',
    state: 'MP',
    registrationType: 'Business',
    businessName: 'Tiwari Crane & Logistics',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 2,
    totalBookings: 6,
  },
  {
    name: 'Rohit Verma',
    email: 'rohit.verma@example.com',
    phone: '+91 99881 22334',
    location: 'Ahmedabad, GJ',
    city: 'Ahmedabad',
    state: 'GJ',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 1,
    totalBookings: 2,
  },
  {
    name: 'Deepak Chauhan',
    email: 'deepak.chauhan@gmail.com',
    phone: '+91 98234 11223',
    location: 'Jaipur, RJ',
    city: 'Jaipur',
    state: 'RJ',
    registrationType: 'Business',
    businessName: 'Chauhan Road & Mining Equipment',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 4,
    totalBookings: 11,
  },
  {
    name: 'Kavita Rawat',
    email: 'kavita.rawat@example.com',
    phone: '+91 88776 55443',
    location: 'Dehradun, UK',
    city: 'Dehradun',
    state: 'UK',
    registrationType: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    listings: 2,
    totalBookings: 5,
  },
]

export const seedCustomers = async () => {
  const count = await Customer.countDocuments()
  if (count === 0) {
    await Customer.insertMany(defaultCustomers)
    console.log(`[SEED] Inserted ${defaultCustomers.length} initial customers into MongoDB.`)
  } else {
    console.log(`[SEED] Customers collection already has ${count} records.`)
  }
}

// Standalone execution support
if (process.argv[1]?.includes('seedCustomers.js')) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('[SEED] Connected to MongoDB...')
      await seedCustomers()
      await mongoose.disconnect()
      console.log('[SEED] Finished.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[SEED] Error:', err)
      process.exit(1)
    })
}
