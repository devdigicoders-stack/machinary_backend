import express from 'express'
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  toggleMachineStatus,
  deleteMachine,
  bulkUpdateMachineStatus,
  bulkDeleteMachines,
} from '../controllers/machineController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Protect all machine routes with JWT
router.use(protect)

// Bulk operations
router.post('/bulk-status', bulkUpdateMachineStatus)
router.post('/bulk-delete', bulkDeleteMachines)

// CRUD and status
router.route('/').get(getMachines).post(createMachine)
router.route('/:id').get(getMachineById).put(updateMachine).delete(deleteMachine)
router.patch('/:id/status', toggleMachineStatus)

export default router
