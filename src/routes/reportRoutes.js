import express from 'express'
import {
  getReportedListings,
  resolveReport,
  dismissReport,
  delistReportedListing,
} from '../controllers/reportController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', getReportedListings)
router.patch('/:id/resolve', resolveReport)
router.patch('/:id/dismiss', dismissReport)
router.patch('/:id/delist', delistReportedListing)

export default router
