import express from 'express'
import {
  getAnalyticsOverview,
  getGrowthCharts,
  getTopCategories,
  getTopLocations,
  getListingStatusBreakdown,
  getRecentEnquiries,
  getTopPerformingListings,
  getUserTypeDistribution,
} from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/overview', getAnalyticsOverview)
router.get('/growth', getGrowthCharts)
router.get('/top-categories', getTopCategories)
router.get('/top-locations', getTopLocations)
router.get('/listing-status', getListingStatusBreakdown)
router.get('/recent-enquiries', getRecentEnquiries)
router.get('/top-listings', getTopPerformingListings)
router.get('/user-types', getUserTypeDistribution)

export default router
