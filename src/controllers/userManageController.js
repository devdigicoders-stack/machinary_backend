import { Customer } from '../models/Customer.js'
import { Owner } from '../models/Owner.js'
import { Admin } from '../models/Admin.js'
import { Listing } from '../models/Listing.js'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// Helper to format unified user document
const formatUser = (doc, userType) => {
  const d = doc.createdAt ? new Date(doc.createdAt) : new Date()
  let status = doc.status || 'Active'
  if (status === 'Suspended') status = 'Blocked'

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    name: doc.name || 'Unnamed',
    email: doc.email || '',
    phone: doc.phone || '',
    userType,
    status,
    avatar: doc.avatar || doc.avatarImg || '',
    location: doc.location || (doc.city ? `${doc.city}, ${doc.state || ''}`.trim() : 'India'),
    city: doc.city || '',
    state: doc.state || '',
    address: doc.address || doc.location || '',
    dob: doc.dob || '',
    gender: doc.gender || '',
    joinedOn: isNaN(d.getTime())
      ? 'Recent'
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: doc.createdAt,
    listingsCount: doc.listings || doc.machines || doc.fleetSize || 0,
    kycStatus: doc.kycStatus || 'Verified',
    businessName: doc.businessName || '',
    role: doc.role || userType,
  }
}

// 1. Get Unified User Statistics
export const getUserStats = async (req, res) => {
  try {
    const [customersCount, ownersCount, adminsCount] = await Promise.all([
      Customer.countDocuments(),
      Owner.countDocuments(),
      Admin.countDocuments(),
    ])

    const total = customersCount + ownersCount + adminsCount

    // Active status count across collections
    const [activeCustomers, activeOwners, activeAdmins] = await Promise.all([
      Customer.countDocuments({ status: 'Active' }),
      Owner.countDocuments({ status: 'Active' }),
      Admin.countDocuments({ status: 'Active' }),
    ])
    const active = activeCustomers + activeOwners + activeAdmins

    const [inactiveCustomers, inactiveOwners, inactiveAdmins] = await Promise.all([
      Customer.countDocuments({ status: 'Inactive' }),
      Owner.countDocuments({ status: 'Inactive' }),
      Admin.countDocuments({ status: 'Inactive' }),
    ])
    const inactive = inactiveCustomers + inactiveOwners + inactiveAdmins

    const [blockedCustomers, blockedOwners] = await Promise.all([
      Customer.countDocuments({ status: 'Blocked' }),
      Owner.countDocuments({ status: { $in: ['Suspended', 'Blocked'] } }),
    ])
    const blocked = blockedCustomers + blockedOwners

    return successResponse(res, 'User statistics retrieved successfully', {
      total,
      customers: customersCount,
      owners: ownersCount,
      admins: adminsCount,
      active,
      inactive,
      blocked,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve user statistics', 500, err.message)
  }
}

// 2. Get All Users (Unified & Paginated)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userType = 'All',
      status = 'All',
      search = '',
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.max(1, parseInt(limit, 10))

    const buildQuery = (collectionType) => {
      const q = {}
      if (status !== 'All') {
        if (collectionType === 'Owner' && status === 'Blocked') {
          q.status = { $in: ['Suspended', 'Blocked'] }
        } else {
          q.status = status
        }
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i')
        q.$or = [{ name: regex }, { email: regex }, { phone: regex }]
      }
      return q
    }

    let users = []

    if (userType === 'Customer') {
      const q = buildQuery('Customer')
      const docs = await Customer.find(q).sort({ createdAt: -1 }).lean()
      users = docs.map((d) => formatUser(d, 'Customer'))
    } else if (userType === 'Owner') {
      const q = buildQuery('Owner')
      const docs = await Owner.find(q).sort({ createdAt: -1 }).lean()
      users = docs.map((d) => formatUser(d, 'Owner'))
    } else if (userType === 'Admin') {
      const q = buildQuery('Admin')
      const docs = await Admin.find(q, { password: 0 }).sort({ createdAt: -1 }).lean()
      users = docs.map((d) => formatUser(d, 'Admin'))
    } else {
      // 'All' - Fetch from all three collections
      const [custDocs, ownerDocs, adminDocs] = await Promise.all([
        Customer.find(buildQuery('Customer')).lean(),
        Owner.find(buildQuery('Owner')).lean(),
        Admin.find(buildQuery('Admin'), { password: 0 }).lean(),
      ])

      const all = [
        ...custDocs.map((d) => formatUser(d, 'Customer')),
        ...ownerDocs.map((d) => formatUser(d, 'Owner')),
        ...adminDocs.map((d) => formatUser(d, 'Admin')),
      ]

      // Sort combined array by createdAt descending
      all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      users = all
    }

    const total = users.length
    const startIndex = (pageNum - 1) * limitNum
    const paginatedUsers = users.slice(startIndex, startIndex + limitNum)

    return successResponse(res, 'Users retrieved successfully', {
      users: paginatedUsers,
      total,
      page: pageNum,
      limit: limitNum,
      pagesCount: Math.ceil(total / limitNum) || 1,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve users', 500, err.message)
  }
}

// 3. Get Single User By ID with Real Listings
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const { userType } = req.query

    let userDoc = null
    let resolvedType = userType

    if (resolvedType === 'Customer') {
      userDoc = await Customer.findById(id).lean()
    } else if (resolvedType === 'Owner') {
      userDoc = await Owner.findById(id).lean()
    } else if (resolvedType === 'Admin') {
      userDoc = await Admin.findById(id, { password: 0 }).lean()
    } else {
      // Search across collections
      userDoc = await Customer.findById(id).lean()
      if (userDoc) {
        resolvedType = 'Customer'
      } else {
        userDoc = await Owner.findById(id).lean()
        if (userDoc) {
          resolvedType = 'Owner'
        } else {
          userDoc = await Admin.findById(id, { password: 0 }).lean()
          if (userDoc) resolvedType = 'Admin'
        }
      }
    }

    if (!userDoc) {
      return errorResponse(res, 'User not found', 404)
    }

    const formatted = formatUser(userDoc, resolvedType)

    // Fetch user's listings if Owner or Customer
    let userListings = []
    if (resolvedType === 'Owner' || resolvedType === 'Customer') {
      userListings = await Listing.find({
        $or: [
          { ownerId: id },
          { 'owner.email': formatted.email },
          { 'contact.email': formatted.email },
        ],
      })
        .select('title machineType category pricing status images createdAt')
        .lean()
    }

    formatted.listings = userListings

    return successResponse(res, 'User details retrieved', formatted)
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve user details', 500, err.message)
  }
}

// 4. Create New User (Customer, Owner, or Admin)
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      userType = 'Customer',
      status = 'Active',
      location = 'India',
      city = '',
      state = '',
      address = '',
      dob = '',
      gender = '',
      password = 'Password@123',
      role = 'Admin',
      businessName = '',
      avatar = '',
    } = req.body

    if (!name || !email) {
      return errorResponse(res, 'Name and Email are required', 400)
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check duplicate across collections
    const [custExists, ownerExists, adminExists] = await Promise.all([
      Customer.findOne({ email: normalizedEmail }),
      Owner.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
    ])

    if (custExists || ownerExists || adminExists) {
      return errorResponse(res, 'A user with this email address already exists', 400)
    }

    let createdDoc = null

    if (userType === 'Admin') {
      const hashedPassword = await bcrypt.hash(password || 'Password@123', 10)
      createdDoc = await Admin.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        role: role || 'Admin',
        status: status === 'Blocked' ? 'Inactive' : status,
        location: location.trim(),
        dob,
        gender,
        avatar: avatar || '',
      })
    } else if (userType === 'Owner') {
      createdDoc = await Owner.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        businessName: businessName.trim(),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        status: status === 'Blocked' ? 'Suspended' : status,
        avatarImg: avatar || '',
      })
    } else {
      // Customer
      createdDoc = await Customer.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        businessName: businessName.trim(),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        status,
        avatar: avatar || '',
      })
    }

    const formatted = formatUser(createdDoc, userType)
    return successResponse(res, `${userType} user created successfully`, formatted, 201)
  } catch (err) {
    return errorResponse(res, 'Failed to create user', 500, err.message)
  }
}

// 5. Update User Profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      userType = 'Customer',
      status,
      location,
      city,
      state,
      address,
      dob,
      gender,
      businessName,
      avatar,
    } = req.body

    let updatedDoc = null

    if (userType === 'Admin') {
      const updateData = {}
      if (name) updateData.name = name.trim()
      if (email) updateData.email = email.trim().toLowerCase()
      if (phone) updateData.phone = phone.trim()
      if (location) updateData.location = location.trim()
      if (dob) updateData.dob = dob
      if (gender) updateData.gender = gender
      if (avatar) updateData.avatar = avatar
      if (status) updateData.status = status === 'Blocked' ? 'Inactive' : status

      updatedDoc = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password')
    } else if (userType === 'Owner') {
      const updateData = {}
      if (name) updateData.name = name.trim()
      if (email) updateData.email = email.trim().toLowerCase()
      if (phone) updateData.phone = phone.trim()
      if (businessName !== undefined) updateData.businessName = businessName.trim()
      if (location) updateData.location = location.trim()
      if (city) updateData.city = city.trim()
      if (state) updateData.state = state.trim()
      if (avatar) updateData.avatarImg = avatar
      if (status) updateData.status = status === 'Blocked' ? 'Suspended' : status

      updatedDoc = await Owner.findByIdAndUpdate(id, updateData, { new: true })
    } else {
      // Customer
      const updateData = {}
      if (name) updateData.name = name.trim()
      if (email) updateData.email = email.trim().toLowerCase()
      if (phone) updateData.phone = phone.trim()
      if (businessName !== undefined) updateData.businessName = businessName.trim()
      if (location) updateData.location = location.trim()
      if (city) updateData.city = city.trim()
      if (state) updateData.state = state.trim()
      if (avatar) updateData.avatar = avatar
      if (status) updateData.status = status

      updatedDoc = await Customer.findByIdAndUpdate(id, updateData, { new: true })
    }

    if (!updatedDoc) {
      return errorResponse(res, 'User not found to update', 404)
    }

    return successResponse(res, 'User updated successfully', formatUser(updatedDoc, userType))
  } catch (err) {
    return errorResponse(res, 'Failed to update user', 500, err.message)
  }
}

// 6. Update User Status (Active / Inactive / Blocked)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, userType } = req.body

    if (!status) {
      return errorResponse(res, 'Status is required', 400)
    }

    let updatedDoc = null

    if (userType === 'Admin') {
      const s = status === 'Blocked' ? 'Inactive' : status
      updatedDoc = await Admin.findByIdAndUpdate(id, { status: s }, { new: true }).select('-password')
    } else if (userType === 'Owner') {
      const s = status === 'Blocked' ? 'Suspended' : status
      updatedDoc = await Owner.findByIdAndUpdate(id, { status: s }, { new: true })
    } else if (userType === 'Customer') {
      updatedDoc = await Customer.findByIdAndUpdate(id, { status }, { new: true })
    } else {
      // Try searching
      updatedDoc = await Customer.findByIdAndUpdate(id, { status }, { new: true })
      if (!updatedDoc) {
        const s = status === 'Blocked' ? 'Suspended' : status
        updatedDoc = await Owner.findByIdAndUpdate(id, { status: s }, { new: true })
      }
      if (!updatedDoc) {
        const s = status === 'Blocked' ? 'Inactive' : status
        updatedDoc = await Admin.findByIdAndUpdate(id, { status: s }, { new: true }).select('-password')
      }
    }

    if (!updatedDoc) {
      return errorResponse(res, 'User not found to update status', 404)
    }

    return successResponse(res, `User status updated to ${status}`)
  } catch (err) {
    return errorResponse(res, 'Failed to update user status', 500, err.message)
  }
}

// 7. Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const { userType } = req.query

    let deletedDoc = null

    if (userType === 'Customer') {
      deletedDoc = await Customer.findByIdAndDelete(id)
    } else if (userType === 'Owner') {
      deletedDoc = await Owner.findByIdAndDelete(id)
    } else if (userType === 'Admin') {
      deletedDoc = await Admin.findByIdAndDelete(id)
    } else {
      deletedDoc = await Customer.findByIdAndDelete(id)
      if (!deletedDoc) deletedDoc = await Owner.findByIdAndDelete(id)
      if (!deletedDoc) deletedDoc = await Admin.findByIdAndDelete(id)
    }

    if (!deletedDoc) {
      return errorResponse(res, 'User not found to delete', 404)
    }

    return successResponse(res, 'User deleted successfully')
  } catch (err) {
    return errorResponse(res, 'Failed to delete user', 500, err.message)
  }
}
