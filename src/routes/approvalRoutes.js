import express from 'express'
import {
  getPendingApprovals,
  approveListing,
  rejectListing,
  bulkApprove,
  bulkReject,
} from '../controllers/approvalController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/pending', getPendingApprovals)
router.post('/bulk-approve', bulkApprove)
router.post('/bulk-reject', bulkReject)
router.patch('/:id/approve', approveListing)
router.patch('/:id/reject', rejectListing)

export default router
