import express from 'express'
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  toggleListingStatus,
  deleteListing,
  bulkUpdateStatus,
  bulkDeleteListings,
  getPromotedListings,
  addPromotion,
  togglePromotionStatus,
  removePromotion,
} from '../controllers/listingController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Protect all routes with JWT
router.use(protect)

// Promotion / Featured endpoints
router.get('/promoted', getPromotedListings)
router.post('/promoted', addPromotion)
router.patch('/promoted/:id/status', togglePromotionStatus)
router.delete('/promoted/:id', removePromotion)

// Bulk operations
router.post('/bulk-status', bulkUpdateStatus)
router.post('/bulk-delete', bulkDeleteListings)

// Single status toggle
router.patch('/:id/status', toggleListingStatus)

// General CRUD
router.route('/').get(getListings).post(createListing)
router.route('/:id').get(getListingById).put(updateListing).delete(deleteListing)

export default router
