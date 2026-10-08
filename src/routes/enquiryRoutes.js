import express from 'express'
import {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiryStatus,
  addEnquiryNote,
  assignEnquiry,
  deleteEnquiry,
  bulkUpdateEnquiryStatus,
  bulkDeleteEnquiries,
} from '../controllers/enquiryController.js'
import { protect } from '../middlewares/authMiddleware.js'
import { Enquiry } from '../models/Enquiry.js'

const router = express.Router()

// Public / App Endpoints (Get Enquiries for App & Submit Enquiry)
router.route('/').get(getEnquiries).post(createEnquiry)

// Customer App: Get My Enquiries by Phone (Strict User Data Isolation)
router.get('/by-phone', async (req, res) => {
  try {
    const { phone, type } = req.query

    // If no phone provided, return empty list (never expose other customers' enquiries)
    if (!phone || !phone.trim()) {
      return res.status(200).json({
        success: true,
        data: { enquiries: [], total: 0 },
      })
    }

    const cleanPhone = phone.replace('+91', '').replace(/\s/g, '').trim()
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone
    const phoneRegex = new RegExp(last10 + '$', 'i')

    const query = {
      $or: [
        { phone: cleanPhone },
        { customerPhone: cleanPhone },
        { phone: phone.trim() },
        { customerPhone: phone.trim() },
        { phone: phoneRegex },
        { customerPhone: phoneRegex },
      ],
    }

    if (type && type !== 'All') {
      if (type.toLowerCase() === 'sell' || type.toLowerCase() === 'sale') {
        query.enquiryType = { $in: ['Sell', 'Sale', 'sell', 'sale'] }
      } else {
        query.enquiryType = new RegExp(`^${type}$`, 'i')
      }
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: { enquiries, total: enquiries.length },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// Admin Protected Operations
router.use(protect)

// Bulk operations
router.post('/bulk-status', bulkUpdateEnquiryStatus)
router.post('/bulk-delete', bulkDeleteEnquiries)

// CRUD & interactive operations
router.route('/:id').get(getEnquiryById).delete(deleteEnquiry)
router.patch('/:id/status', updateEnquiryStatus)
router.post('/:id/notes', addEnquiryNote)
router.patch('/:id/assign', assignEnquiry)

export default router
