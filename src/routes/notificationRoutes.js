import express from 'express'
import {
  getNotificationStats,
  getNotifications,
  createNotification,
  resendNotification,
  updateNotificationStatus,
  deleteNotification,
  bulkDelete,
} from '../controllers/notificationController.js'

const router = express.Router()

router.get('/stats', getNotificationStats)
router.get('/', getNotifications)
router.post('/', createNotification)
router.patch('/:id/resend', resendNotification)
router.patch('/:id/status', updateNotificationStatus)
router.delete('/:id', deleteNotification)
router.post('/bulk-delete', bulkDelete)

export default router
