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

const router = express.Router()

// All enquiry routes require Admin authentication
router.use(protect)

// Bulk operations
router.post('/bulk-status', bulkUpdateEnquiryStatus)
router.post('/bulk-delete', bulkDeleteEnquiries)

// CRUD & interactive operations
router.route('/').get(getEnquiries).post(createEnquiry)
router.route('/:id').get(getEnquiryById).delete(deleteEnquiry)
router.patch('/:id/status', updateEnquiryStatus)
router.post('/:id/notes', addEnquiryNote)
router.patch('/:id/assign', assignEnquiry)

export default router
