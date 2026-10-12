import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js'

const app = express()

// Global Middlewares
const allowedOrigins = [
  'https://machinary-frontend-ten.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matched/any origin
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true)
      } else {
        callback(null, true) // Still allow other origins for Flutter Web & development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
)
app.options('*', cors())
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
