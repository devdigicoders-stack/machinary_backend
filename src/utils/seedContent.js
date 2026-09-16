import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Content } from '../models/Content.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultPages = [
  {
    title: 'Home Page',
    subtitle: 'Main landing page content and hero banners',
    slug: '/',
    pageType: 'Static',
    status: 'Published',
    content: 'Welcome to Machinery Wallah - India’s Premier Heavy Equipment Rental & Sale Marketplace.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 18450,
  },
  {
    title: 'About Us',
    subtitle: 'Company mission, leadership and story',
    slug: '/about-us',
    pageType: 'Static',
    status: 'Published',
    content: 'Machinery Wallah connects contractors, fleet owners, and site managers directly with verified machinery.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 6240,
  },
  {
    title: 'How It Works',
    subtitle: 'Step by step equipment booking process',
    slug: '/how-it-works',
    pageType: 'Static',
    status: 'Published',
    content: '1. Browse verified machines. 2. Compare rates & operators. 3. Book securely.',
    authorName: 'Rakesh Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    viewsCount: 4890,
  },
  {
    title: 'Terms & Conditions',
    subtitle: 'Marketplace terms and legal guidelines',
    slug: '/terms-and-conditions',
    pageType: 'Legal',
    status: 'Published',
    content: 'All equipment rentals and sales transacted through Machinery Wallah are subject to these verified terms.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 3120,
  },
  {
    title: 'Privacy Policy',
    subtitle: 'Customer and owner data privacy policy',
    slug: '/privacy-policy',
    pageType: 'Legal',
    status: 'Published',
    content: 'We prioritize customer data encryption, phone privacy, and secure KYC record verification.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 2980,
  },
  {
    title: 'FAQ',
    subtitle: 'Frequently asked questions for renters & owners',
    slug: '/faq',
    pageType: 'Static',
    status: 'Draft',
    content: 'Find answers on operator inclusions, security deposits, logbook verifications, and interstate permits.',
    authorName: 'Neha Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
    viewsCount: 1420,
  },
  {
    title: 'Contact Us',
    subtitle: 'Customer helpline and regional offices',
    slug: '/contact-us',
    pageType: 'Static',
    status: 'Published',
    content: 'Reach our 24/7 toll-free dispatch and breakdown helpline across Lucknow, Delhi, Mumbai, and Bangalore.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 7890,
  },
  {
    title: 'Careers',
    subtitle: 'Join India’s fastest growing heavy machinery network',
    slug: '/careers',
    pageType: 'Static',
    status: 'Under Review',
    content: 'Open roles in logistics coordination, field equipment inspection, and software engineering.',
    authorName: 'Amit Kumar',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    viewsCount: 950,
  },
  {
    title: 'Machinery Blog',
    subtitle: 'Latest infrastructure insights and equipment maintenance tips',
    slug: '/blog',
    pageType: 'Dynamic',
    status: 'Published',
    content: 'Expert articles comparing JCB 3DX vs Cat 424, fuel optimization tips for tippers, and crane safety checks.',
    authorName: 'Priya Verma',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80',
    viewsCount: 11400,
  },
  {
    title: 'Help & Support',
    subtitle: 'Rental disputes and claim documentation assistance',
    slug: '/help-support',
    pageType: 'Static',
    status: 'Draft',
    content: 'Step-by-step resolution portal for machine breakdown claims and operator substitute assistance.',
    authorName: 'Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    viewsCount: 840,
  },
]

export const seedContent = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) return console.log('❌ MONGODB_URI not found')

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri)
    }

    console.log('🌱 Checking CMS Content in MongoDB Atlas...')
    const count = await Content.countDocuments()
    if (count > 0) {
      console.log(`ℹ️ Content already present (${count} pages). Refreshing default pages...`)
      await Content.deleteMany({})
    }

    const inserted = await Content.insertMany(defaultPages)
    console.log(`✅ Successfully seeded ${inserted.length} CMS pages into MongoDB Atlas!`)
    return inserted
  } catch (err) {
    console.error('❌ Error seeding content:', err)
  }
}

if (process.argv[1]?.endsWith('seedContent.js')) {
  seedContent().then(() => {
    mongoose.disconnect()
    process.exit(0)
  })
}
