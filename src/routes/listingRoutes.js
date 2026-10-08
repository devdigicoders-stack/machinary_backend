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
  createRentListing,
  createSellListing,
  createTransportListing,
  createMaterialListing,
  getMyListings,
} from '../controllers/listingController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Public Customer & Owner App Listing Routes (Token optional or verified)
router.get('/', getListings)
router.get('/my-listings', getMyListings)
router.post('/rent', createRentListing)
router.post('/sell', createSellListing)
router.post('/transport', createTransportListing)
router.post('/material', createMaterialListing)

// Allow updating and retrieving single listing by ID
router.route('/:id').get(getListingById).put(updateListing)

// Protect subsequent admin routes with JWT
router.use(protect)

// Admin Listing Creation
router.post('/', createListing)

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
router.route('/:id').delete(deleteListing)

export default router

