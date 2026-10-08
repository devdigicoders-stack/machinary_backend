import express from 'express'
import {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  logoutOtherSessions,
  sendOwnerOtp,
  verifyOwnerOtp,
  registerOwner,
  getOwnerProfile,
  updateOwnerProfile,
  uploadOwnerAvatar,
} from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

// ==========================================
// PUBLIC OWNER APP AUTH ROUTES
// ==========================================
router.post('/owner/send-otp', sendOwnerOtp)
router.post('/owner/verify-otp', verifyOwnerOtp)
router.post('/owner/register', registerOwner)

// Protected Owner Profile Routes
router.get('/owner/profile', protect, getOwnerProfile)
router.put('/owner/profile', protect, updateOwnerProfile)
router.post('/owner/upload-avatar', protect, uploadProfilePhoto.single('avatar'), uploadOwnerAvatar)

// Public Admin Auth Routes
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
