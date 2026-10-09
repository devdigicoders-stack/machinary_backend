import express from 'express'
import {
  getNotificationStats,
  getNotifications,
  createNotification,
  resendNotification,
  updateNotificationStatus,
  deleteNotification,
  bulkDelete,
  registerToken,
  testPushNotification,
} from '../controllers/notificationController.js'

const router = express.Router()

router.get('/stats', getNotificationStats)
router.get('/', getNotifications)
router.post('/register-token', registerToken)
router.post('/test-push', testPushNotification)
router.post('/', createNotification)
router.patch('/:id/resend', resendNotification)
router.patch('/:id/status', updateNotificationStatus)
router.delete('/:id', deleteNotification)
router.post('/bulk-delete', bulkDelete)

export default router
