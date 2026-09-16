import express from 'express'
import {
  getSupportStats,
  getSupportTickets,
  createSupportTicket,
  updateTicketStatus,
  reassignTicket,
  addTicketMessage,
  deleteSupportTicket,
} from '../controllers/supportController.js'

const router = express.Router()

router.get('/stats', getSupportStats)
router.get('/', getSupportTickets)
router.post('/', createSupportTicket)
router.patch('/:id/status', updateTicketStatus)
router.patch('/:id/reassign', reassignTicket)
router.post('/:id/messages', addTicketMessage)
router.delete('/:id', deleteSupportTicket)

export default router
