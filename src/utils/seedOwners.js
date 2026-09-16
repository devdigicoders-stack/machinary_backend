import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Owner } from '../models/Owner.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultOwners = [
  {
    name: 'Rakesh Singh',
    businessName: 'Singh Earthmovers & Logistics',
    email: 'rakesh.singh@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    location: 'Lucknow, UP',
    city: 'Lucknow',
    state: 'UP',
    machines: 8,
    fleetSize: 8,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '09AAACS1429B1Z8',
  },
  {
    name: 'Sanjeev Kumar',
    businessName: 'SK Crane & Heavy Transport',
    email: 'sanjeev.k@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    phone: '+91 87654 32109',
    location: 'Delhi, DL',
    city: 'Delhi',
    state: 'DL',
    machines: 5,
    fleetSize: 5,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '07AAASK9213C1Z5',
  },
  {
    name: 'Amit Tiwari',
    businessName: 'Tiwari Excavation Works',
    email: 'amit.tiwari@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    phone: '+91 76543 21098',
    location: 'Noida, UP',
    city: 'Noida',
    state: 'UP',
    machines: 12,
    fleetSize: 12,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '09AAATT4312D1Z2',
  },
  {
    name: 'Pooja Khanna',
    businessName: 'Khanna Agri & Industrial Tools',
    email: 'pooja.khanna@gmail.com',
    initials: 'PK',
    avatarBg: 'bg-[#FCE7F3] text-[#BE185D] border border-pink-200',
    phone: '+91 65432 10987',
    location: 'Kanpur, UP',
    city: 'Kanpur',
    state: 'UP',
    machines: 3,
    fleetSize: 3,
    status: 'Inactive',
    kycStatus: 'Pending',
    gstNumber: '',
  },
  {
    name: 'Vikram Yadav',
    businessName: 'Yadav Infrastructure Equipments',
    email: 'vikram.yadav@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    phone: '+91 98761 23456',
    location: 'Gurgaon, HR',
    city: 'Gurgaon',
    state: 'HR',
    machines: 6,
    fleetSize: 6,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '06AAAVY8912E1Z3',
  },
  {
    name: 'Neha Sharma',
    businessName: 'Sharma Roadworks Machines',
    email: 'neha.sharma@gmail.com',
    initials: 'NS',
    avatarBg: 'bg-[#E0E7FF] text-[#4338CA] border border-indigo-200',
    phone: '+91 91234 56789',
    location: 'Patna, BR',
    city: 'Patna',
    state: 'BR',
    machines: 2,
    fleetSize: 2,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '10AAANS5612F1Z1',
  },
  {
    name: 'Manish Patel',
    businessName: 'Patel Mining & Tippers',
    email: 'manish.patel@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    phone: '+91 99887 76655',
    location: 'Jaipur, RJ',
    city: 'Jaipur',
    state: 'RJ',
    machines: 4,
    fleetSize: 4,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '08AAAMP7712G1Z9',
  },
  {
    name: 'Rohit Verma',
    businessName: 'Verma Tractor & Harvester Yard',
    email: 'rohit.verma@gmail.com',
    initials: 'RV',
    avatarBg: 'bg-[#FEE2E2] text-[#B91C1C] border border-red-200',
    phone: '+91 88776 65544',
    location: 'Bhopal, MP',
    city: 'Bhopal',
    state: 'MP',
    machines: 1,
    fleetSize: 1,
    status: 'Inactive',
    kycStatus: 'Rejected',
    gstNumber: '',
  },
  {
    name: 'Karan Mehta',
    businessName: 'Mehta Logistics & Material Handling',
    email: 'karan.mehta@gmail.com',
    avatarImg:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    phone: '+91 77665 44332',
    location: 'Indore, MP',
    city: 'Indore',
    state: 'MP',
    machines: 7,
    fleetSize: 7,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '23AAAKM2312H1Z6',
  },
  {
    name: 'Ankit Trivedi',
    businessName: 'Gujarat Road Machinery Hub',
    email: 'ankit.trivedi@gmail.com',
    initials: 'AT',
    avatarBg: 'bg-[#1E293B] text-white border border-slate-700',
    phone: '+91 99881 22334',
    location: 'Ahmedabad, GJ',
    city: 'Ahmedabad',
    state: 'GJ',
    machines: 5,
    fleetSize: 5,
    status: 'Active',
    kycStatus: 'Verified',
    gstNumber: '24AAAAT1192J1Z4',
  },
]

export const seedOwners = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment')
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
      console.log('Connected to MongoDB Atlas for seeding owners...')
    }

    // Upsert each owner by email
    for (const owner of defaultOwners) {
      await Owner.findOneAndUpdate(
        { email: owner.email },
        { $set: owner },
        { upsert: true, new: true, runValidators: true }
      )
    }

    const count = await Owner.countDocuments()
    console.log(`Successfully seeded owners into MongoDB Atlas! Total owners: ${count}`)
  } catch (error) {
    console.error('Error seeding owners:', error.message)
  } finally {
    if (process.argv[1]?.includes('seedOwners.js')) {
      await mongoose.disconnect()
      console.log('MongoDB connection closed.')
    }
  }
}

if (process.argv[1]?.includes('seedOwners.js')) {
  seedOwners()
}
