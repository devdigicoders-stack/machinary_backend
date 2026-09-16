import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Enquiry } from '../models/Enquiry.js'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const defaultEnquiries = [
  {
    enquiryId: '#ENQ-1001',
    name: 'Rohit Sharma',
    customerName: 'Rohit Sharma',
    phone: '+91 98765 43210',
    email: 'rohit@gmail.com',
    location: 'Lucknow, Uttar Pradesh',
    preferredLocation: 'Lucknow, UP',
    machine: 'JCB 3DX',
    fullMachineName: 'JCB 3DX Backhoe Loader',
    enquiryType: 'Buy',
    status: 'New',
    budgetRange: '₹20 - 30 Lakhs',
    requirementDate: 'Within 1 Month',
    assignedTo: 'Amit Kumar',
    source: 'Website',
    message:
      'Hi, I am interested in buying a JCB 3DX. Please share the price, availability and additional details.',
    notes: [
      {
        text: 'Customer called from Lucknow regarding urgent requirement for canal project.',
        author: 'Amit Kumar',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        text: 'Quotation sent on WhatsApp with inspection report.',
        author: 'Admin',
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
    history: [
      { action: 'Enquiry submitted via Website', author: 'System', createdAt: new Date(Date.now() - 86400000) },
      { action: 'Assigned to Amit Kumar', author: 'Admin', createdAt: new Date(Date.now() - 72000000) },
    ],
  },
  {
    enquiryId: '#ENQ-1002',
    name: 'Priya Verma',
    customerName: 'Priya Verma',
    phone: '+91 87654 32109',
    email: 'priya@gmail.com',
    location: 'Kanpur, Uttar Pradesh',
    preferredLocation: 'Kanpur, UP',
    machine: 'Tata 2518 Tipper',
    fullMachineName: 'Tata 2518 Heavy Tipper',
    enquiryType: 'Rent',
    status: 'Contacted',
    budgetRange: '₹1.5 - 2 Lakhs/mo',
    requirementDate: 'Within 1 Week',
    assignedTo: 'Rahul Verma',
    source: 'Mobile App',
    message: 'Need Tata 2518 Tipper on rent for 6 months for road construction work.',
    notes: [
      {
        text: 'Spoke with client. Looking for 3 tipper units on long-term rental contract.',
        author: 'Rahul Verma',
        createdAt: new Date(Date.now() - 7200000),
      },
    ],
    history: [
      { action: 'Enquiry submitted via Mobile App', author: 'System', createdAt: new Date(Date.now() - 86400000 * 2) },
      { action: 'Status changed to Contacted', author: 'Rahul Verma', createdAt: new Date(Date.now() - 7200000) },
    ],
  },
  {
    enquiryId: '#ENQ-1003',
    name: 'Amit Kumar',
    customerName: 'Amit Kumar',
    phone: '+91 76543 21098',
    email: 'amit@gmail.com',
    location: 'Varanasi, Uttar Pradesh',
    preferredLocation: 'Varanasi, UP',
    machine: 'CAT 320D',
    fullMachineName: 'CAT 320D Hydraulic Excavator',
    enquiryType: 'Buy',
    status: 'Converted',
    budgetRange: '₹45 - 55 Lakhs',
    requirementDate: 'Within 15 Days',
    assignedTo: 'Amit Kumar',
    source: 'Direct Lead',
    message:
      'Looking for certified pre-owned Caterpillar 320D excavator in good operational condition.',
    notes: [
      {
        text: 'Site inspection completed at Varanasi yard. Token payment initiated.',
        author: 'Amit Kumar',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
    ],
    history: [
      { action: 'Direct lead logged', author: 'Admin', createdAt: new Date(Date.now() - 86400000 * 3) },
      { action: 'Converted to Customer Sale Agreement', author: 'Amit Kumar', createdAt: new Date(Date.now() - 3600000 * 4) },
    ],
  },
  {
    enquiryId: '#ENQ-1004',
    name: 'Neha Gupta',
    customerName: 'Neha Gupta',
    phone: '+91 65432 10987',
    email: 'neha@gmail.com',
    location: 'Agra, Uttar Pradesh',
    preferredLocation: 'Agra, UP',
    machine: 'Mahindra EarthMaster',
    fullMachineName: 'Mahindra EarthMaster VX',
    enquiryType: 'Rent',
    status: 'New',
    budgetRange: '₹90k - 1.2 Lakh/mo',
    requirementDate: 'Within 2 Months',
    assignedTo: 'Unassigned',
    source: 'Website',
    message: 'Require backhoe loader for agricultural land leveling project.',
    notes: [],
    history: [
      { action: 'Enquiry received via Website', author: 'System', createdAt: new Date(Date.now() - 86400000 * 4) },
    ],
  },
  {
    enquiryId: '#ENQ-1005',
    name: 'Vikram Singh',
    customerName: 'Vikram Singh',
    phone: '+91 98123 45678',
    email: 'vikram@gmail.com',
    location: 'Delhi, DL',
    preferredLocation: 'Delhi, DL',
    machine: 'ACE 15X Crane',
    fullMachineName: 'ACE 15X Mobile Tower Crane',
    enquiryType: 'Buy',
    status: 'Closed',
    budgetRange: '₹18 - 22 Lakhs',
    requirementDate: 'Immediate',
    assignedTo: 'Rahul Verma',
    source: 'Referral',
    message: 'Looking for mobile crane for industrial warehouse structural assembly.',
    notes: [
      {
        text: 'Client decided to postpone project due to land approval delays.',
        author: 'Rahul Verma',
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
    ],
    history: [
      { action: 'Lead created via Referral', author: 'Rahul Verma', createdAt: new Date(Date.now() - 86400000 * 5) },
      { action: 'Marked as Closed / Postponed', author: 'Rahul Verma', createdAt: new Date(Date.now() - 3600000 * 8) },
    ],
  },
  {
    enquiryId: '#ENQ-1006',
    name: 'Pooja Patel',
    customerName: 'Pooja Patel',
    phone: '+91 91234 56780',
    email: 'pooja@gmail.com',
    location: 'Ahmedabad, Gujarat',
    preferredLocation: 'Ahmedabad, GJ',
    machine: 'Ashok Leyland 2820',
    fullMachineName: 'Ashok Leyland 2820 Haulage Tipper',
    enquiryType: 'Buy',
    status: 'New',
    budgetRange: '₹32 - 38 Lakhs',
    requirementDate: 'Within 1 Month',
    assignedTo: 'Unassigned',
    source: 'Website',
    message: 'Interested in 2820 Tipper for inter-city heavy logistics fleet expansion.',
    notes: [],
    history: [
      { action: 'Online enquiry registered', author: 'System', createdAt: new Date(Date.now() - 86400000 * 6) },
    ],
  },
  {
    enquiryId: '#ENQ-1007',
    name: 'Rajesh Tiwari',
    customerName: 'Rajesh Tiwari',
    phone: '+91 87234 56789',
    email: 'rajesh.t@gmail.com',
    location: 'Gorakhpur, Uttar Pradesh',
    preferredLocation: 'Gorakhpur, UP',
    machine: 'Komatsu PC210',
    fullMachineName: 'Komatsu PC210-10M0 Excavator',
    enquiryType: 'Rent',
    status: 'Contacted',
    budgetRange: '₹2.5 - 3.2 Lakhs/mo',
    requirementDate: 'Within 10 Days',
    assignedTo: 'Amit Kumar',
    source: 'Mobile App',
    message: 'Need 20-ton class excavator for highway expansion project with qualified operator.',
    notes: [
      {
        text: 'Discussed machine availability and mobilization costs with client.',
        author: 'Amit Kumar',
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
    ],
    history: [
      { action: 'App lead generated', author: 'System', createdAt: new Date(Date.now() - 86400000 * 7) },
      { action: 'Assigned to Amit Kumar', author: 'Admin', createdAt: new Date(Date.now() - 86400000 * 6) },
    ],
  },
  {
    enquiryId: '#ENQ-1008',
    name: 'Sunita Yadav',
    customerName: 'Sunita Yadav',
    phone: '+91 94321 09876',
    email: 'sunita@gmail.com',
    location: 'Noida, Uttar Pradesh',
    preferredLocation: 'Noida, UP',
    machine: 'Escorts Hydra 12',
    fullMachineName: 'Escorts Hydra 12 Pick and Carry Crane',
    enquiryType: 'Buy',
    status: 'New',
    budgetRange: '₹12 - 15 Lakhs',
    requirementDate: 'Within 3 Weeks',
    assignedTo: 'Unassigned',
    source: 'Website',
    message: 'Need Hydra crane for stone slab loading and transport operations.',
    notes: [],
    history: [
      { action: 'Enquiry submitted via Website', author: 'System', createdAt: new Date(Date.now() - 86400000 * 8) },
    ],
  },
  {
    enquiryId: '#ENQ-1009',
    name: 'Manish Rawat',
    customerName: 'Manish Rawat',
    phone: '+91 77665 44332',
    email: 'manish@gmail.com',
    location: 'Indore, Madhya Pradesh',
    preferredLocation: 'Indore, MP',
    machine: 'Sany SY215C',
    fullMachineName: 'Sany SY215C Excavator',
    enquiryType: 'Buy',
    status: 'Converted',
    budgetRange: '₹52 - 60 Lakhs',
    requirementDate: 'Immediate',
    assignedTo: 'Amit Kumar',
    source: 'Direct Lead',
    message: 'Purchasing heavy duty excavator for mining lease site work in MP.',
    notes: [
      {
        text: 'Loan sanction letter received from bank. Delivery arranged for this weekend.',
        author: 'Amit Kumar',
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ],
    history: [
      { action: 'Direct customer lead registered', author: 'Admin', createdAt: new Date(Date.now() - 86400000 * 9) },
      { action: 'Converted into Closed Sale', author: 'Amit Kumar', createdAt: new Date(Date.now() - 3600000 * 12) },
    ],
  },
  {
    enquiryId: '#ENQ-1010',
    name: 'Deepak Chauhan',
    customerName: 'Deepak Chauhan',
    phone: '+91 99881 22334',
    email: 'deepak@gmail.com',
    location: 'Prayagraj, Uttar Pradesh',
    preferredLocation: 'Prayagraj, UP',
    machine: 'Schwing Stetter Mixer',
    fullMachineName: 'Schwing Stetter Concrete Mixer',
    enquiryType: 'Rent',
    status: 'Contacted',
    budgetRange: '₹80 - 95k/mo',
    requirementDate: 'Within 2 Weeks',
    assignedTo: 'Rahul Verma',
    source: 'Website',
    message: 'Need self-loading concrete mixer for residential building foundation casting.',
    notes: [
      {
        text: 'Customer wants on-site demonstration before signing rental terms.',
        author: 'Rahul Verma',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
    ],
    history: [
      { action: 'Enquiry received via Website', author: 'System', createdAt: new Date(Date.now() - 86400000 * 10) },
      { action: 'Follow-up call completed by Rahul Verma', author: 'Rahul Verma', createdAt: new Date(Date.now() - 3600000 * 4) },
    ],
  },
]

export const seedEnquiries = async () => {
  const count = await Enquiry.countDocuments()
  if (count === 0) {
    await Enquiry.insertMany(defaultEnquiries)
    console.log(`[SEED] Inserted ${defaultEnquiries.length} initial enquiries into MongoDB.`)
  } else {
    console.log(`[SEED] Enquiries collection already has ${count} records.`)
  }
}

// Standalone execution support
if (process.argv[1]?.includes('seedEnquiries.js')) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('[SEED] Connected to MongoDB...')
      await seedEnquiries()
      await mongoose.disconnect()
      console.log('[SEED] Finished.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[SEED] Error:', err)
      process.exit(1)
    })
}
