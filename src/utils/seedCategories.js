import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Category } from '../models/Category.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultCategories = [
  {
    name: 'Excavators',
    slug: 'excavators',
    description: 'Hydraulic excavators for construction and mining',
    image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200&auto=format&fit=crop&q=80',
    subcategories: 8,
    machinesCount: 124,
    status: 'Active',
  },
  {
    name: 'Backhoe Loaders',
    slug: 'backhoe-loaders',
    description: 'Multi-purpose loaders for various applications',
    image:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&auto=format&fit=crop&q=80',
    subcategories: 6,
    machinesCount: 98,
    status: 'Active',
  },
  {
    name: 'Wheel Loaders',
    slug: 'wheel-loaders',
    description: 'Heavy-duty wheel loaders for material handling',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    subcategories: 5,
    machinesCount: 76,
    status: 'Active',
  },
  {
    name: 'Dump Trucks',
    slug: 'dump-trucks',
    description: 'Tippers and dump trucks for transportation',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&auto=format&fit=crop&q=80',
    subcategories: 7,
    machinesCount: 110,
    status: 'Active',
  },
  {
    name: 'Cranes',
    slug: 'cranes',
    description: 'Mobile, tower and crawler cranes',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80',
    subcategories: 6,
    machinesCount: 64,
    status: 'Inactive',
  },
  {
    name: 'Road Rollers',
    slug: 'road-rollers',
    description: 'Compaction equipment for road construction',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    subcategories: 4,
    machinesCount: 52,
    status: 'Active',
  },
  {
    name: 'Motor Graders',
    slug: 'motor-graders',
    description: 'Graders for road leveling and maintenance',
    image:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=200&auto=format&fit=crop&q=80',
    subcategories: 4,
    machinesCount: 48,
    status: 'Active',
  },
  {
    name: 'Forklifts',
    slug: 'forklifts',
    description: 'Material handling forklifts',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
    subcategories: 5,
    machinesCount: 60,
    status: 'Active',
  },
  {
    name: 'Concrete Equipment',
    slug: 'concrete-equipment',
    description: 'Concrete mixers, pumps and related equipment',
    image:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=200&auto=format&fit=crop&q=80',
    subcategories: 6,
    machinesCount: 84,
    status: 'Active',
  },
  {
    name: 'Generators',
    slug: 'generators',
    description: 'Diesel and portable generators',
    image:
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=200&auto=format&fit=crop&q=80',
    subcategories: 4,
    machinesCount: 46,
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
