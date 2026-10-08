import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js'
import { uploadImage } from '../controllers/uploadController.js'

const router = express.Router()

// Middleware to accept either 'file' or 'image' field name
const handleFileUpload = (req, res, next) => {
  uploadSingleImage.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    if (req.file) {
      return next()
    }
    // Try 'image' field if 'file' was not provided
    uploadSingleImage.single('image')(req, res, (err2) => {
      if (err2) {
        return res.status(400).json({ success: false, message: err2.message })
      }
      next()
    })
  })
}

// POST /api/v1/upload or /api/v1/upload/:folder (e.g. /api/v1/upload/machines)
router.post('/:folder?', handleFileUpload, uploadImage)

export default router
