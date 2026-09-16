import { successResponse, errorResponse } from '../utils/apiResponse.js'

// Upload single image to backend uploads folder (Dynamic local disk, NOT Cloudinary)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded. Please select an image.', 400)
    }

    const folder = req.params.folder || req.query.folder || 'general'
    const relativePath = `/uploads/${folder}/${req.file.filename}`
    const serverUrl = `${req.protocol}://${req.get('host')}`
    const fullUrl = `${serverUrl}${relativePath}`

    return successResponse(res, 'Image uploaded successfully to backend uploads folder', {
      filename: req.file.filename,
      relativePath,
      url: relativePath,
      fullUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      folder,
    })
  } catch (error) {
    console.error('Upload image error:', error)
    return errorResponse(res, error.message || 'Failed to upload image', 500)
  }
}
