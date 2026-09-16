import { Owner } from '../models/Owner.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get All Owners (with search, filter, pagination, & dynamic KPI stats)
export const getOwners = async (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      city = 'All',
      kycStatus = 'All',
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query

    const query = {}

    // Search term across name, businessName, email, phone, location, city
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: regex },
        { businessName: regex },
        { email: regex },
        { phone: regex },
        { location: regex },
        { city: regex },
      ]
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status
    }

    // City filter
    if (city && city !== 'All') {
      const cityRegex = new RegExp(`^${city.trim()}$`, 'i')
      query.city = cityRegex
    }

    // KYC Status filter
    if (kycStatus && kycStatus !== 'All') {
      query.kycStatus = kycStatus
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const skip = (pageNum - 1) * limitNum

    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj = { [sortBy]: sortOrder }

    // Execute query with pagination and distinct cities
    const [owners, totalFiltered, distinctCities] = await Promise.all([
      Owner.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Owner.countDocuments(query),
      Owner.distinct('city'),
    ])

    // Compute live platform owner stats
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const [totalAll, activeCount, inactiveCount, newThisMonth] = await Promise.all([
      Owner.countDocuments(),
      Owner.countDocuments({ status: 'Active' }),
      Owner.countDocuments({ status: 'Inactive' }),
      Owner.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ])

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1

    return successResponse(res, 'Owners retrieved successfully', {
      owners,
      pagination: {
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      stats: {
        total: totalAll,
        active: activeCount,
        inactive: inactiveCount,
        newThisMonth,
      },
      cities: distinctCities.filter(Boolean),
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Get Single Owner By ID
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }
    return successResponse(res, 'Owner details retrieved successfully', owner)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Create New Owner
export const createOwner = async (req, res) => {
  try {
    const {
      name,
      businessName,
      email,
      phone,
      location,
      city,
      state,
      machines,
      status,
      kycStatus,
      gstNumber,
    } = req.body

    if (!name || !email || !phone) {
      return errorResponse(res, 'Name, email, and phone number are required', 400)
    }

    // Check email uniqueness
    const existing = await Owner.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return errorResponse(res, 'An owner with this email address already exists', 400)
    }

    const machineCount = parseInt(machines, 10) || 1

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    const owner = await Owner.create({
      name: name.trim(),
      businessName: (businessName || '').trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: location || 'Lucknow, UP',
      city: city || (location ? location.split(',')[0].trim() : 'Lucknow'),
      state: state || (location && location.split(',')[1] ? location.split(',')[1].trim() : 'UP'),
      initials,
      machines: machineCount,
      fleetSize: machineCount,
      status: status || 'Active',
      kycStatus: kycStatus || 'Pending',
      gstNumber: (gstNumber || '').trim(),
      history: [
        {
          action: 'Owner registered on platform',
          author: req.user?.name || 'Admin',
          createdAt: new Date(),
        },
      ],
    })

    return successResponse(res, 'Owner created successfully', owner, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Update Existing Owner
export const updateOwner = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    const owner = await Owner.findById(id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    // Check email conflict
    if (updateData.email && updateData.email.toLowerCase().trim() !== owner.email) {
      const conflict = await Owner.findOne({
        email: updateData.email.toLowerCase().trim(),
        _id: { $ne: id },
      })
      if (conflict) {
        return errorResponse(res, 'Another owner is already using this email address', 400)
      }
      updateData.email = updateData.email.toLowerCase().trim()
    }

    if (updateData.machines !== undefined) {
      updateData.machines = parseInt(updateData.machines, 10) || 1
      updateData.fleetSize = updateData.machines
    }

    // Sync initials if name changed
    if (updateData.name && updateData.name !== owner.name) {
      updateData.initials = updateData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }

    // Append history
    owner.history.push({
      action: 'Owner profile details updated',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })
    await owner.save()

    const updatedOwner = await Owner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    return successResponse(res, 'Owner updated successfully', updatedOwner)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Toggle Owner Status (Active <-> Inactive)
export const toggleOwnerStatus = async (req, res) => {
  try {
    const { id } = req.params
    const owner = await Owner.findById(id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    // If a specific status is provided, set it; otherwise toggle Active <-> Inactive
    const nextStatus = req.body?.status || (owner.status === 'Active' ? 'Inactive' : 'Active')
    const oldStatus = owner.status
    owner.status = nextStatus

    owner.history.push({
      action: `Status changed from "${oldStatus}" to "${nextStatus}"`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await owner.save()

    return successResponse(res, `Owner status changed to ${nextStatus}`, owner)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Update Owner KYC Status
export const updateOwnerKyc = async (req, res) => {
  try {
    const { id } = req.params
    const { kycStatus } = req.body

    if (!['Pending', 'Verified', 'Rejected'].includes(kycStatus)) {
      return errorResponse(res, 'Valid KYC status required (Pending, Verified, Rejected)', 400)
    }

    const owner = await Owner.findById(id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    const oldKyc = owner.kycStatus
    owner.kycStatus = kycStatus

    owner.history.push({
      action: `KYC status changed from "${oldKyc}" to "${kycStatus}"`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await owner.save()

    return successResponse(res, `Owner KYC status updated to ${kycStatus}`, owner)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 7. Add Note to Owner
export const addOwnerNote = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return errorResponse(res, 'Note text cannot be empty', 400)
    }

    const owner = await Owner.findById(id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }

    owner.notes.push({
      text: text.trim(),
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await owner.save()

    return successResponse(res, 'Note added successfully', owner)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Delete Single Owner
export const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params
    const owner = await Owner.findByIdAndDelete(id)
    if (!owner) {
      return errorResponse(res, 'Owner not found', 404)
    }
    return successResponse(res, 'Owner deleted successfully', { id })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 9. Bulk Status Update
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of owner IDs', 400)
    }

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return errorResponse(res, 'Valid status is required (Active, Inactive, Suspended)', 400)
    }

    const result = await Owner.updateMany(
      { _id: { $in: ids } },
      {
        $set: { status },
        $push: {
          history: {
            action: `Bulk updated status to "${status}"`,
            author: req.user?.name || 'Admin',
            createdAt: new Date(),
          },
        },
      }
    )

    return successResponse(res, `Updated status for ${result.modifiedCount} owners`, {
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 10. Bulk Delete Owners
export const bulkDeleteOwners = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of owner IDs', 400)
    }

    const result = await Owner.deleteMany({ _id: { $in: ids } })

    return successResponse(res, `Deleted ${result.deletedCount} owners`, {
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
