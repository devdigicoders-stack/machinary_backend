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

// Protect all category routes with JWT
router.use(protect)

// Bulk operations
router.post('/bulk-status', bulkUpdateCategoryStatus)
router.post('/bulk-delete', bulkDeleteCategories)

// CRUD and status
router.route('/').get(getCategories).post(createCategory)
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory)
router.patch('/:id/status', toggleCategoryStatus)

export default router
