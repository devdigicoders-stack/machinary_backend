import express from 'express'
import {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  logoutOtherSessions,
} from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

// Public Auth Routes
router.post('/register', registerAdmin)
router.post('/login', loginAdmin)

// Protected Profile & Security Routes
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.post('/upload-avatar', protect, uploadProfilePhoto.single('avatar'), uploadAvatar)
router.put('/change-password', protect, changePassword)
router.put('/password', protect, changePassword)
router.post('/logout-other-sessions', protect, logoutOtherSessions)

export default router
