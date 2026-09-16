import jwt from 'jsonwebtoken'
import { errorResponse } from '../utils/apiResponse.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'machinery_wallah_jwt_secret')
      req.user = decoded
      return next()
    } catch (error) {
      return errorResponse(res, 'Not authorized, token invalid or expired', 401)
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no bearer token provided', 401)
  }
}
