import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Category } from '../models/Category.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultCategories = [
  // 1. Rent Machines (Earthmoving, Cranes, Road, Concrete)
  {
    name: 'Earthmoving & Excavation (Rent)',
    slug: 'earthmoving-excavation-rent',
    description: 'Excavators, JCB 3DX, Bulldozers & Backhoe loaders for rent',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80',
    icon: 'Truck',
    subcategories: 8,
    machinesCount: 124,
    status: 'Active',
  },
  {
    name: 'Cranes & Lifting Equipment (Rent)',
    slug: 'cranes-lifting-equipment-rent',
    description: 'Hydraulic Farana, Mobile and Crawler Cranes for rent',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80',
    icon: 'Truck',
    subcategories: 6,
    machinesCount: 64,
    status: 'Active',
  },

  // 2. Buy & Sell Used Machines
  {
    name: 'Used Heavy Earthmovers (Buy/Sell)',
    slug: 'used-heavy-earthmovers-buy-sell',
    description: 'Certified pre-owned Excavators, Backhoes and Wheel Loaders for sale',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    icon: 'ShieldCheck',
    subcategories: 6,
    machinesCount: 88,
    status: 'Active',
  },
  {
    name: 'Road Construction & Rollers (Buy/Sell)',
    slug: 'road-construction-rollers-buy-sell',
    description: 'Used Road Rollers, Motor Graders and Compactors for outright purchase',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=300&auto=format&fit=crop&q=80',
    icon: 'Truck',
    subcategories: 5,
    machinesCount: 52,
    status: 'Active',
  },

  // 3. Construction Material Supply
  {
    name: 'Building & Structural Material',
    slug: 'building-structural-material',
    description: 'TMT Steel Rebars, Cement Bags, Ready-Mix Concrete & Bricks supply',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=300&auto=format&fit=crop&q=80',
    icon: 'Layers',
    subcategories: 6,
    machinesCount: 140,
    status: 'Active',
  },
  {
    name: 'Aggregates & Mining Sands',
    slug: 'aggregates-mining-sands',
    description: 'River Sand, Coarse Blue Stone Aggregates, Stone Dust & Ballast',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&auto=format&fit=crop&q=80',
    icon: 'Layers',
    subcategories: 4,
    machinesCount: 95,
    status: 'Active',
  },

  // 4. Transport & Logistics Vehicles
  {
    name: 'Heavy Low-Bed Trailers & Pullers',
    slug: 'heavy-low-bed-trailers-pullers',
    description: 'Semi low-bed, hydraulic axle & multi-axle trailers for machine transit',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80',
    icon: 'Truck',
    subcategories: 5,
    machinesCount: 78,
    status: 'Active',
  },
  {
    name: 'Tippers, Dumpers & Transit Mixers',
    slug: 'tippers-dumpers-transit-mixers',
    description: '10 to 18 wheeler Dumper Trucks and Concrete Transit Mixers',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
    icon: 'Truck',
    subcategories: 6,
    machinesCount: 115,
    status: 'Active',
  },
]

export const seedCategories = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in environment')

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
      console.log('Connected to MongoDB Atlas for seeding categories...')
    }

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true, runValidators: true }
      )
    }

    const count = await Category.countDocuments()
    console.log(`Successfully seeded categories into MongoDB Atlas! Total categories: ${count}`)
  } catch (error) {
    console.error('Error seeding categories:', error.message)
  } finally {
    if (process.argv[1]?.includes('seedCategories.js')) {
      await mongoose.disconnect()
      console.log('MongoDB connection closed.')
    }
  }
}

if (process.argv[1]?.includes('seedCategories.js')) {
  seedCategories()
}
