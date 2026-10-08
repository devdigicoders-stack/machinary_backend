import { Server } from 'socket.io'

let ioInstance = null

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  })

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`)

    // Join specific support ticket room
    socket.on('join_ticket', (ticketId) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`)
        console.log(`Socket ${socket.id} joined room: ticket_${ticketId}`)
      }
    })

    // Leave ticket room
    socket.on('leave_ticket', (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`)
        console.log(`Socket ${socket.id} left room: ticket_${ticketId}`)
      }
    })

    socket.on('disconnect', () => {
      console.log(`❌ Socket client disconnected: ${socket.id}`)
    })
  })

  return ioInstance
}

export const getIO = () => {
  return ioInstance
}

// Helper to broadcast support message to a ticket room
export const emitSupportMessage = (ticketId, messageData, updatedTicket = null) => {
  if (ioInstance && ticketId) {
    // Emit to room
    ioInstance.to(`ticket_${ticketId}`).emit('new_message', {
      ticketId,
      message: messageData,
      ticket: updatedTicket,
    })

    // Also broadcast global ticket update event to admin panel
    ioInstance.emit('ticket_updated', {
      ticketId,
      message: messageData,
      ticket: updatedTicket,
    })
  }
}
