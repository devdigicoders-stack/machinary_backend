import express from 'express'
import {
  getDashboardStats,
  getDashboardChart,
  getRecentListings,
  getRecentCustomers,
} from '../controllers/dashboardController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Protect all dashboard endpoints with Admin JWT authentication
router.use(protect)

router.get('/stats', getDashboardStats)
router.get('/chart', getDashboardChart)
router.get('/recent-listings', getRecentListings)
router.get('/recent-customers', getRecentCustomers)

export default router
