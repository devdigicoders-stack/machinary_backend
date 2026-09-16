import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Machine } from '../models/Machine.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultMachines = [
  {
    name: 'JCB 3DX',
    brand: 'JCB',
    model: '3DX',
    year: '2022',
    subtitle: 'JCB | 3DX | 2022',
    category: 'Backhoe Loaders',
    machineType: 'Construction',
    image:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=80',
    owner: 'Rakesh Singh',
    location: 'Lucknow, UP',
    regNo: 'UP32AB1234',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '76 HP',
      operatingWeight: '7,460 kg',
      fuelType: 'Diesel',
      meterHours: '1,420 hrs',
    },
  },
  {
    name: 'Tata 2518',
    brand: 'Tata',
    model: '2518',
    year: '2021',
    subtitle: 'Tata | 2518 | 2021',
    category: 'Dump Trucks',
    machineType: 'Commercial',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
    owner: 'Sanjeev Kumar',
    location: 'Delhi, DL',
    regNo: 'DL01CD5678',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '180 HP',
      operatingWeight: '25,000 kg',
      fuelType: 'Diesel',
      meterHours: '2,800 hrs',
    },
  },
  {
    name: 'Volvo EC210',
    brand: 'Volvo',
    model: 'EC210',
    year: '2020',
    subtitle: 'Volvo | EC210 | 2020',
    category: 'Excavators',
    machineType: 'Heavy Equipment',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    owner: 'Amit Tiwari',
    location: 'Noida, UP',
    regNo: 'UP16EF9012',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '150 HP',
      operatingWeight: '21,000 kg',
      fuelType: 'Diesel',
      meterHours: '3,100 hrs',
    },
  },
  {
    name: 'Mahindra 575 DI',
    brand: 'Mahindra',
    model: '575 DI',
    year: '2021',
    subtitle: 'Mahindra | 575 DI | 2021',
    category: 'Wheel Loaders',
    machineType: 'Agriculture',
    image:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&auto=format&fit=crop&q=80',
    owner: 'Pooja Khanna',
    location: 'Kanpur, UP',
    regNo: 'UP78GH3456',
    listingType: 'Rent',
    status: 'Inactive',
    specifications: {
      enginePower: '45 HP',
      operatingWeight: '1,860 kg',
      fuelType: 'Diesel',
      meterHours: '940 hrs',
    },
  },
  {
    name: 'Ashok Leyland 1616',
    brand: 'Ashok Leyland',
    model: '1616',
    year: '2019',
    subtitle: 'AL | 1616 | 2019',
    category: 'Dump Trucks',
    machineType: 'Commercial',
    image:
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80',
    owner: 'Vikram Yadav',
    location: 'Gurgaon, HR',
    regNo: 'HR26IJ7890',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '160 HP',
      operatingWeight: '16,200 kg',
      fuelType: 'Diesel',
      meterHours: '4,200 hrs',
    },
  },
  {
    name: 'CAT 320D',
    brand: 'Caterpillar',
    model: '320D',
    year: '2021',
    subtitle: 'Caterpillar | 320D | 2021',
    category: 'Excavators',
    machineType: 'Heavy Equipment',
    image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=400&auto=format&fit=crop&q=80',
    owner: 'Neha Sharma',
    location: 'Patna, BR',
    regNo: 'BR01KL4321',
    listingType: 'Buy',
    status: 'Active',
    specifications: {
      enginePower: '148 HP',
      operatingWeight: '20,500 kg',
      fuelType: 'Diesel',
      meterHours: '1,890 hrs',
    },
  },
  {
    name: 'Komatsu PC210',
    brand: 'Komatsu',
    model: 'PC210',
    year: '2020',
    subtitle: 'Komatsu | PC210 | 2020',
    category: 'Excavators',
    machineType: 'Heavy Equipment',
    image:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=400&auto=format&fit=crop&q=80',
    owner: 'Manish Patel',
    location: 'Jaipur, RJ',
    regNo: 'RJ14MN9876',
    listingType: 'Rent',
    status: 'Pending',
    specifications: {
      enginePower: '165 HP',
      operatingWeight: '21,300 kg',
      fuelType: 'Diesel',
      meterHours: '2,450 hrs',
    },
  },
  {
    name: 'BharatBenz 3528',
    brand: 'BharatBenz',
    model: '3528',
    year: '2022',
    subtitle: 'BharatBenz | 3528 | 2022',
    category: 'Dump Trucks',
    machineType: 'Commercial',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
    owner: 'Rohit Verma',
    location: 'Bhopal, MP',
    regNo: 'MP04OP6543',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '280 HP',
      operatingWeight: '35,000 kg',
      fuelType: 'Diesel',
      meterHours: '1,120 hrs',
    },
  },
  {
    name: 'John Deere 5310',
    brand: 'John Deere',
    model: '5310',
    year: '2020',
    subtitle: 'John Deere | 5310 | 2020',
    category: 'Wheel Loaders',
    machineType: 'Agriculture',
    image:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&auto=format&fit=crop&q=80',
    owner: 'Karan Mehta',
    location: 'Indore, MP',
    regNo: 'MP09QR3210',
    listingType: 'Buy',
    status: 'Active',
    specifications: {
      enginePower: '55 HP',
      operatingWeight: '2,200 kg',
      fuelType: 'Diesel',
      meterHours: '1,650 hrs',
    },
  },
  {
    name: 'Case 770EX',
    brand: 'Case',
    model: '770EX',
    year: '2021',
    subtitle: 'Case | 770EX | 2021',
    category: 'Backhoe Loaders',
    machineType: 'Construction',
    image:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=80',
    owner: 'Ankit Trivedi',
    location: 'Ahmedabad, GJ',
    regNo: 'GJ05ST8765',
    listingType: 'Rent',
    status: 'Active',
    specifications: {
      enginePower: '76 HP',
      operatingWeight: '7,630 kg',
      fuelType: 'Diesel',
      meterHours: '2,100 hrs',
    },
  },
]

export const seedMachines = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in environment')

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
      console.log('Connected to MongoDB Atlas for seeding machines...')
    }

    for (const machine of defaultMachines) {
      await Machine.findOneAndUpdate(
        { regNo: machine.regNo },
        { $set: machine },
        { upsert: true, new: true, runValidators: true }
      )
    }

    const count = await Machine.countDocuments()
    console.log(`Successfully seeded machines into MongoDB Atlas! Total machines: ${count}`)
  } catch (error) {
    console.error('Error seeding machines:', error.message)
  } finally {
    if (process.argv[1]?.includes('seedMachines.js')) {
      await mongoose.disconnect()
      console.log('MongoDB connection closed.')
    }
  }
}

if (process.argv[1]?.includes('seedMachines.js')) {
  seedMachines()
}
