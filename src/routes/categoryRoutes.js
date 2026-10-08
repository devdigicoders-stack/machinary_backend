import express from 'express'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  bulkUpdateCategoryStatus,
  bulkDeleteCategories,
} from '../controllers/categoryController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Public GET routes for App & Web
router.get('/', getCategories)
router.get('/:id', getCategoryById)

// Protected Admin/Write routes
router.post('/bulk-status', protect, bulkUpdateCategoryStatus)
router.post('/bulk-delete', protect, bulkDeleteCategories)
router.post('/', protect, createCategory)
router.put('/:id', protect, updateCategory)
router.delete('/:id', protect, deleteCategory)
router.patch('/:id/status', protect, toggleCategoryStatus)

export default router
