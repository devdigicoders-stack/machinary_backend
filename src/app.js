import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js'

const app = express()

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for seamless development across Flutter Web, Admin, and mobile apps
      callback(null, true)
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static uploads (Dynamic local disk storage, NOT Cloudinary)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'Machinery Wallah Backend API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/v1/health',
  })
})

// Mount API v1 Routes
app.use('/api/v1', routes)

// Error Handling Middlewares
app.use(notFoundHandler)
app.use(errorHandler)

export default app
