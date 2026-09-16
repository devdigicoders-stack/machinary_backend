import express from 'express'
import {
  getUserStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from '../controllers/userManageController.js'

const router = express.Router()

// User statistics
router.get('/stats', getUserStats)

// User CRUD & filtering
router.route('/').get(getAllUsers).post(createUser)

router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser)

router.patch('/:id/status', updateUserStatus)

export default router
