import express from 'express'
import {
  getContentStats,
  getPages,
  createPage,
  updatePage,
  togglePageStatus,
  deletePage,
  bulkUpdateStatus,
  bulkDelete,
} from '../controllers/contentController.js'

const router = express.Router()

router.get('/stats', getContentStats)
router.get('/', getPages)
router.post('/', createPage)
router.put('/:id', updatePage)
router.patch('/:id/status', togglePageStatus)
router.delete('/:id', deletePage)
router.post('/bulk-status', bulkUpdateStatus)
router.post('/bulk-delete', bulkDelete)

export default router
