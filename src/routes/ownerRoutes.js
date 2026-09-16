import express from 'express'
import {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  toggleOwnerStatus,
  updateOwnerKyc,
  addOwnerNote,
  deleteOwner,
  bulkUpdateStatus,
  bulkDeleteOwners,
} from '../controllers/ownerController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All owner routes require admin authentication
router.use(protect)

// Bulk operations
router.post('/bulk-delete', bulkDeleteOwners)
router.post('/bulk-status', bulkUpdateStatus)

// CRUD and status routes
router.route('/').get(getOwners).post(createOwner)
router.route('/:id').get(getOwnerById).put(updateOwner).delete(deleteOwner)
router.patch('/:id/status', toggleOwnerStatus)
router.patch('/:id/kyc', updateOwnerKyc)
router.post('/:id/notes', addOwnerNote)

export default router
