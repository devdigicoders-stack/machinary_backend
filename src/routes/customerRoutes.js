import express from 'express'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  bulkDeleteCustomers,
  bulkUpdateStatus,
  getOrCreateCustomerProfile,
  updateCustomerProfile,
} from '../controllers/customerController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Customer App Endpoints (Get Profile / Sync / Update)
router.get('/profile', getOrCreateCustomerProfile)
router.post('/profile', updateCustomerProfile)
router.put('/profile', updateCustomerProfile)

// All admin customer routes are protected by Admin JWT token
router.use(protect)

// Bulk operations
router.post('/bulk-delete', bulkDeleteCustomers)
router.post('/bulk-status', bulkUpdateStatus)

// Admin CRUD operations
router.route('/').get(getCustomers).post(createCustomer)
router.route('/:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer)
router.patch('/:id/status', toggleCustomerStatus)

export default router
