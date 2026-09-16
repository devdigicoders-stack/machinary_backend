import express from 'express'
import authRoutes from './authRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import customerRoutes from './customerRoutes.js'
import ownerRoutes from './ownerRoutes.js'
import machineRoutes from './machineRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import listingRoutes from './listingRoutes.js'
import approvalRoutes from './approvalRoutes.js'
import enquiryRoutes from './enquiryRoutes.js'
import reportRoutes from './reportRoutes.js'
import locationRoutes from './locationRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import supportRoutes from './supportRoutes.js'
import uploadRoutes from './uploadRoutes.js'
import contentRoutes from './contentRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
import userManageRoutes from './userManageRoutes.js'

const router = express.Router()

// Mount sub-routes
router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/customers', customerRoutes)
router.use('/owners', ownerRoutes)
router.use('/machines', machineRoutes)
router.use('/categories', categoryRoutes)
router.use('/listings', listingRoutes)
router.use('/approvals', approvalRoutes)
router.use('/enquiries', enquiryRoutes)
router.use('/reports', reportRoutes)
router.use('/locations', locationRoutes)
router.use('/notifications', notificationRoutes)
router.use('/content', contentRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/support', supportRoutes)
router.use('/upload', uploadRoutes)
router.use('/users', userManageRoutes)

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Machinery Wallah API is running successfully',
    timestamp: new Date().toISOString(),
  })
})

export default router
