import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Helper to ensure target upload directory exists
export const getUploadDir = (folder = 'general') => {
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general'
  const dir = path.join(process.cwd(), 'uploads', safeFolder)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// 1. Generic Dynamic Multer Disk Storage
const dynamicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || req.query.folder || 'general'
    const targetDir = getUploadDir(folder)
    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    const folder = req.params.folder || req.query.folder || 'file'
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${folder}-${uniqueSuffix}${ext}`)
  },
})

// File Type Filter for Images & Documents (PDF, DOC, etc.)
const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.doc', '.docx', '.txt']
  const ext = path.extname(file.originalname).toLowerCase()
  if (
    allowedExtensions.includes(ext) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('document') ||
    file.mimetype.includes('octet-stream')
  ) {
    cb(null, true)
  } else {
    cb(new Error('Only Image and Document files (JPG, PNG, WEBP, PDF, DOC, DOCX) are allowed'), false)
  }
}

// 2. Generic Single Image Upload Middleware (10 MB max)
export const uploadSingleImage = multer({
  storage: dynamicStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

// 3. Profile Specific Upload Middleware (Backwards compatibility with authRoutes)
const profileUploadDir = getUploadDir('profiles')
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `avatar-${uniqueSuffix}${ext}`)
  },
})

export const uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})
