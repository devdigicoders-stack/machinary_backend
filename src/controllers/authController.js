import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'
import { Owner } from '../models/Owner.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// Helper to remove existing local avatar file
const deleteLocalAvatarFile = (avatarPath) => {
  if (avatarPath && avatarPath.startsWith('/uploads/profiles/')) {
    const fullPath = path.join(process.cwd(), avatarPath)
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath)
      } catch (err) {
        console.warn('Could not remove previous avatar file:', err.message)
      }
    }
  }
}

// Helper to generate token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || 'machinery_wallah_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// 1. Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email and password are required', 400)
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      return errorResponse(res, 'An account with this email already exists', 400)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: role || 'Admin',
      status: 'Active',
      is2FAActive: true,
    })

    const token = generateToken(admin)

    return successResponse(
      res,
      'Admin registered successfully',
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          status: admin.status,
          avatar: admin.avatar,
        },
      },
      201
    )
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400)
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) {
      return errorResponse(res, 'Invalid email or password', 401)
    }

    if (admin.status !== 'Active') {
      return errorResponse(res, 'Your account is inactive. Please contact support.', 403)
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401)
    }

    const token = generateToken(admin)

    return successResponse(res, 'Admin logged in successfully', {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        avatar: admin.avatar,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Get Current Admin Profile
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password')
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404)
    }
    return successResponse(res, 'Profile retrieved successfully', admin)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Update Admin Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, dob, gender, location, preferences } = req.body

    const admin = await Admin.findById(req.user.id)
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404)
    }

    if (name) admin.name = name
    if (phone !== undefined) admin.phone = phone
    if (avatar !== undefined) {
      if (avatar === '' && admin.avatar) {
        deleteLocalAvatarFile(admin.avatar)
      }
      admin.avatar = avatar
    }
    if (dob !== undefined) admin.dob = dob
    if (gender !== undefined) admin.gender = gender
    if (location !== undefined) admin.location = location
    if (preferences !== undefined) {
      admin.preferences = { ...admin.preferences, ...preferences }
    }

    await admin.save()

    return successResponse(res, 'Profile updated successfully', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      avatar: admin.avatar,
      dob: admin.dob,
      gender: admin.gender,
      location: admin.location,
      preferences: admin.preferences,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', 400)
    }

    const admin = await Admin.findById(req.user.id)
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404)
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400)
    }

    const salt = await bcrypt.genSalt(10)
    admin.password = await bcrypt.hash(newPassword, salt)
    admin.lastPasswordChange = new Date()
    await admin.save()

    return successResponse(res, 'Password changed successfully', {
      lastPasswordChange: admin.lastPasswordChange,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Logout from All Other Sessions
export const logoutOtherSessions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id)
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404)
    }

    if (admin.sessions && admin.sessions.length > 0) {
      admin.sessions = admin.sessions.filter((s) => s.isCurrent)
    } else {
      admin.sessions = [
        {
          device: 'Current Desktop',
          browser: 'Browser',
          ip: req.ip || '127.0.0.1',
          lastActive: new Date(),
          isCurrent: true,
        },
      ]
    }
    await admin.save()

    return successResponse(res, 'Logged out from all other sessions successfully')
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Upload Profile Avatar (Dynamic local disk upload, NOT Cloudinary)
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400)
    }

    const admin = await Admin.findById(req.user.id)
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404)
    }

    // Delete old avatar if it was stored locally
    if (admin.avatar) {
      deleteLocalAvatarFile(admin.avatar)
    }

    // Relative path saved dynamically to MongoDB
    const relativePath = `/uploads/profiles/${req.file.filename}`
    admin.avatar = relativePath
    await admin.save()

    return successResponse(res, 'Profile avatar uploaded and saved locally in backend uploads', {
      avatar: relativePath,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        avatar: admin.avatar,
        dob: admin.dob,
        gender: admin.gender,
        location: admin.location,
        preferences: admin.preferences,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// Backward compatibility alias
export const updatePassword = changePassword


// ==========================================
// OWNER MOBILE APP AUTHENTICATION (OTP FLOW)
// ==========================================

// 7. Send OTP for Owner (Simulated / Configurable OTP: 123456)
export const sendOwnerOtp = async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone || phone.toString().trim().length < 10) {
      return errorResponse(res, 'Valid 10-digit mobile number is required', 400)
    }

    const cleanPhone = phone.toString().trim().replace(/^\+91/, '').slice(-10)

    // Check if owner already exists
    const existingOwner = await Owner.findOne({
      phone: { $regex: cleanPhone + '$' }
    })

    const isNewUser = !existingOwner

    return successResponse(res, 'OTP sent successfully', {
      phone: cleanPhone,
      isNewUser,
      otp: '123456', // Fixed OTP for fast development & testing
      message: isNewUser ? 'New user. Registration required.' : 'Welcome back owner!',
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Verify OTP for Owner (Auto login & auto-create if new)
export const verifyOwnerOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) {
      return errorResponse(res, 'Phone and OTP are required', 400)
    }

    const cleanPhone = phone.toString().trim().replace(/^\+91/, '').slice(-10)

    // Verify OTP (123456)
    if (otp !== '123456') {
      return errorResponse(res, 'Invalid OTP. Please enter 123456', 400)
    }

    // Find Owner by phone
    let owner = await Owner.findOne({
      phone: { $regex: cleanPhone + '$' }
    })

    // If owner doesn't exist, auto-create a default owner profile
    if (!owner) {
      owner = await Owner.create({
        name: `Owner ${cleanPhone.slice(-4)}`,
        businessName: 'Machinery Owner',
        phone: cleanPhone,
        email: `owner_${cleanPhone}@machinewallah.com`,
        city: 'Lucknow',
        state: 'UP',
        location: 'Lucknow, UP',
        kycStatus: 'Verified',
        status: 'Active',
        machines: 0,
        fleetSize: 0,
      })
    }

    // Generate JWT token & return complete owner profile
    const token = jwt.sign(
      { id: owner._id, phone: owner.phone, role: 'Owner' },
      process.env.JWT_SECRET || 'machinery_wallah_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    )

    return successResponse(res, 'Owner logged in successfully', {
      isNewUser: false,
      token,
      owner: {
        id: owner._id,
        name: owner.name,
        businessName: owner.businessName,
        phone: owner.phone,
        email: owner.email,
        location: owner.location,
        city: owner.city,
        state: owner.state,
        gstNumber: owner.gstNumber,
        kycStatus: owner.kycStatus,
        status: owner.status,
        machines: owner.machines,
        fleetSize: owner.fleetSize,
        avatarImg: owner.avatarImg,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 9. Register New Owner
export const registerOwner = async (req, res) => {
  try {
    const { name, businessName, phone, email, city, state, location, gstNumber } = req.body

    if (!name || !phone) {
      return errorResponse(res, 'Name and phone number are required', 400)
    }

    const cleanPhone = phone.toString().trim().replace(/^\+91/, '').slice(-10)

    // Check if phone already registered
    let existingOwner = await Owner.findOne({
      phone: { $regex: cleanPhone + '$' }
    })

    if (existingOwner) {
      return errorResponse(res, 'An account with this phone number already exists. Please login.', 400)
    }

    const newOwner = await Owner.create({
      name: name.trim(),
      businessName: (businessName || '').trim(),
      phone: cleanPhone,
      email: (email || '').trim().toLowerCase(),
      city: (city || 'Lucknow').trim(),
      state: (state || 'UP').trim(),
      location: (location || city || 'Lucknow, UP').trim(),
      gstNumber: (gstNumber || '').trim(),
      kycStatus: 'Verified',
      status: 'Active',
      machines: 0,
      fleetSize: 0,
    })

    const token = jwt.sign(
      { id: newOwner._id, phone: newOwner.phone, role: 'Owner' },
      process.env.JWT_SECRET || 'machinery_wallah_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    )

    return successResponse(
      res,
      'Owner account created successfully',
      {
        isNewUser: false,
        token,
        owner: {
          id: newOwner._id,
          name: newOwner.name,
          businessName: newOwner.businessName,
          phone: newOwner.phone,
          email: newOwner.email,
          location: newOwner.location,
          city: newOwner.city,
          state: newOwner.state,
          gstNumber: newOwner.gstNumber,
          kycStatus: newOwner.kycStatus,
          status: newOwner.status,
          machines: newOwner.machines,
          fleetSize: newOwner.fleetSize,
        },
      },
      201
    )
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 10. Get Owner Profile
export const getOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user.id
    const owner = await Owner.findById(ownerId)

    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    return successResponse(res, 'Owner profile retrieved successfully', {
      owner: {
        id: owner._id,
        name: owner.name,
        businessName: owner.businessName,
        phone: owner.phone,
        email: owner.email,
        location: owner.location,
        city: owner.city,
        state: owner.state,
        gstNumber: owner.gstNumber,
        kycStatus: owner.kycStatus,
        status: owner.status,
        machines: owner.machines,
        fleetSize: owner.fleetSize,
        avatarImg: owner.avatarImg,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 11. Update Owner Profile
export const updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user.id
    const { name, businessName, email, city, state, location, gstNumber, avatarImg } = req.body

    const owner = await Owner.findById(ownerId)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    if (name) owner.name = name.trim()
    if (businessName !== undefined) owner.businessName = businessName.trim()
    if (email !== undefined) owner.email = email.trim().toLowerCase()
    if (city) owner.city = city.trim()
    if (state) owner.state = state.trim()
    if (location) {
      owner.location = location.trim()
    } else if (city || state) {
      owner.location = `${owner.city || city}, ${owner.state || state}`.trim()
    }
    if (gstNumber !== undefined) owner.gstNumber = gstNumber.trim()
    if (avatarImg !== undefined) owner.avatarImg = avatarImg

    await owner.save()

    return successResponse(res, 'Owner profile updated successfully', {
      owner: {
        id: owner._id,
        name: owner.name,
        businessName: owner.businessName,
        phone: owner.phone,
        email: owner.email,
        location: owner.location,
        city: owner.city,
        state: owner.state,
        gstNumber: owner.gstNumber,
        kycStatus: owner.kycStatus,
        status: owner.status,
        machines: owner.machines,
        fleetSize: owner.fleetSize,
        avatarImg: owner.avatarImg,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 12. Upload Owner Avatar Image
export const uploadOwnerAvatar = async (req, res) => {
  try {
    const ownerId = req.user.id

    if (!req.file) {
      return errorResponse(res, 'Please upload an image file', 400)
    }

    const owner = await Owner.findById(ownerId)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    // Delete old local avatar if exists
    deleteLocalAvatarFile(owner.avatarImg)

    const avatarUrl = `/uploads/profiles/${req.file.filename}`
    owner.avatarImg = avatarUrl
    await owner.save()

    return successResponse(res, 'Profile image uploaded successfully', {
      avatarImg: avatarUrl,
      owner: {
        id: owner._id,
        name: owner.name,
        businessName: owner.businessName,
        phone: owner.phone,
        email: owner.email,
        location: owner.location,
        city: owner.city,
        state: owner.state,
        gstNumber: owner.gstNumber,
        kycStatus: owner.kycStatus,
        status: owner.status,
        machines: owner.machines,
        fleetSize: owner.fleetSize,
        avatarImg: owner.avatarImg,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

