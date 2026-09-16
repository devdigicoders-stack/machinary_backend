import { SupportTicket } from '../models/SupportTicket.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get Support KPI Stats
export const getSupportStats = async (req, res) => {
  try {
    const [total, open, inprogress, resolved, closed] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: 'Open' }),
      SupportTicket.countDocuments({ status: 'In Progress' }),
      SupportTicket.countDocuments({ status: 'Resolved' }),
      SupportTicket.countDocuments({ status: 'Closed' }),
    ])

    return successResponse(res, 'Support statistics retrieved', {
      total,
      open,
      inprogress,
      resolved,
      closed,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch support statistics', 500, err.message)
  }
}

// 2. Get Support Tickets with filtering & pagination
export const getSupportTickets = async (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      type = 'All',
      priority = 'All',
      assignedTo = 'All',
      page = 1,
      limit = 10,
    } = req.query

    const query = {}

    if (status !== 'All') {
      query.status = status
    }
    if (type !== 'All') {
      query.$or = [{ type }, { category: type }]
    }
    if (priority !== 'All') {
      query.priority = priority
    }
    if (assignedTo !== 'All') {
      query.assignedTo = assignedTo
    }

    if (search.trim()) {
      const q = search.trim()
      query.$or = [
        { ticketId: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { userName: { $regex: q, $options: 'i' } },
        { userEmail: { $regex: q, $options: 'i' } },
        { userPhone: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
      ]
    }

    const total = await SupportTicket.countDocuments(query)
    const items = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    const tickets = items.map((t) => {
      const d = new Date(t.createdAt)
      return {
        id: t._id,
        _id: t._id,
        ticketId: t.ticketId,
        subject: t.subject,
        userName: t.userName,
        userEmail: t.userEmail,
        userPhone: t.userPhone,
        userRole: t.userRole,
        type: t.type,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assignedTo: t.assignedTo,
        description: t.description,
        messages: t.messages || [],
        activityLog: t.activityLog || [],
        attachments: t.attachments || [],
        createdDate: isNaN(d.getTime())
          ? 'Today'
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdTime: isNaN(d.getTime())
          ? '10:00 AM'
          : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }
    })

    return successResponse(res, 'Support tickets retrieved', {
      tickets,
      total,
      page: Number(page),
      limit: Number(limit),
      pagesCount: Math.ceil(total / Number(limit)) || 1,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch support tickets', 500, err.message)
  }
}

// 3. Create Support Ticket
export const createSupportTicket = async (req, res) => {
  try {
    const {
      userName,
      userEmail = '',
      userPhone = '+91 98765 43210',
      userRole = 'Customer',
      subject,
      description = '',
      type = 'General',
      priority = 'Medium',
      assignedTo = 'Unassigned',
    } = req.body

    if (!userName || !subject) {
      return errorResponse(res, 'User Name and Subject are required', 400)
    }

    const count = await SupportTicket.countDocuments()
    const ticketId = `#SUP-${1001 + count}`

    const ticket = await SupportTicket.create({
      ticketId,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      userPhone: userPhone.trim(),
      userRole,
      subject: subject.trim(),
      description: description.trim(),
      type,
      category: type,
      priority,
      status: 'Open',
      assignedTo,
      messages: [
        {
          sender: userName.trim(),
          text: description.trim() || subject.trim(),
          sentAt: new Date(),
          isStaff: false,
        },
      ],
      activityLog: [
        {
          action: 'Ticket created',
          author: userName.trim(),
          timestamp: new Date(),
        },
        ...(assignedTo !== 'Unassigned'
          ? [
              {
                action: `Assigned to ${assignedTo}`,
                author: 'System',
                timestamp: new Date(),
              },
            ]
          : []),
      ],
    })

    return successResponse(res, `Support Ticket ${ticketId} created successfully`, ticket, 201)
  } catch (err) {
    return errorResponse(res, 'Failed to create support ticket', 500, err.message)
  }
}

// 4. Update Ticket Status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, author = 'Admin' } = req.body

    const ticket = await SupportTicket.findById(id)
    if (!ticket) return errorResponse(res, 'Ticket not found', 404)

    ticket.status = status
    ticket.activityLog.push({
      action: `Status changed to ${status}`,
      author,
      timestamp: new Date(),
    })
    await ticket.save()

    return successResponse(res, `Ticket ${ticket.ticketId} status updated to "${status}"`, ticket)
  } catch (err) {
    return errorResponse(res, 'Failed to update ticket status', 500, err.message)
  }
}

// 5. Reassign Ticket
export const reassignTicket = async (req, res) => {
  try {
    const { id } = req.params
    const { assignedTo, author = 'Admin' } = req.body

    if (!assignedTo) return errorResponse(res, 'Assigned agent name required', 400)

    const ticket = await SupportTicket.findById(id)
    if (!ticket) return errorResponse(res, 'Ticket not found', 404)

    ticket.assignedTo = assignedTo
    ticket.activityLog.push({
      action: `Reassigned to ${assignedTo}`,
      author,
      timestamp: new Date(),
    })
    await ticket.save()

    return successResponse(res, `Ticket ${ticket.ticketId} reassigned to ${assignedTo}`, ticket)
  } catch (err) {
    return errorResponse(res, 'Failed to reassign ticket', 500, err.message)
  }
}

// 6. Add Message / Reply to Ticket Conversation
export const addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { text, sender = 'Support Admin', isStaff = true } = req.body

    if (!text || !text.trim()) {
      return errorResponse(res, 'Message text is required', 400)
    }

    const ticket = await SupportTicket.findById(id)
    if (!ticket) return errorResponse(res, 'Ticket not found', 404)

    const msg = {
      sender,
      text: text.trim(),
      sentAt: new Date(),
      isStaff: Boolean(isStaff),
    }

    ticket.messages.push(msg)

    // If ticket was Open and support replied, move to In Progress automatically
    if (ticket.status === 'Open' && isStaff) {
      ticket.status = 'In Progress'
      ticket.activityLog.push({
        action: 'Status automatically changed to In Progress upon reply',
        author: sender,
        timestamp: new Date(),
      })
    }

    await ticket.save()

    return successResponse(res, 'Message sent successfully', ticket)
  } catch (err) {
    return errorResponse(res, 'Failed to send message', 500, err.message)
  }
}

// 7. Delete Support Ticket
export const deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params
    const ticket = await SupportTicket.findByIdAndDelete(id)
    if (!ticket) return errorResponse(res, 'Ticket not found', 404)

    return successResponse(res, `Ticket ${ticket.ticketId} deleted permanently`)
  } catch (err) {
    return errorResponse(res, 'Failed to delete ticket', 500, err.message)
  }
}
