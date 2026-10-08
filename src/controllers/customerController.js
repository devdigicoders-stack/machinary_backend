import { Customer } from '../models/Customer.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get All Customers (with search, filter, pagination, & dynamic KPI stats)
export const getCustomers = async (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      registrationType = 'All',
      location = 'All',
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query

    const query = {}

    // Search term across name, email, phone, location, businessName
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { location: regex },
        { businessName: regex },
        { companyName: regex },
      ]
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status
    }

    // Registration Type filter
    if (registrationType && registrationType !== 'All') {
      query.registrationType = registrationType
    }

    // Location filter
    if (location && location !== 'All') {
      query.$or = query.$or || []
      const locRegex = new RegExp(location.trim(), 'i')
      query.location = locRegex
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

    // Execute query with pagination
    const [rawCustomers, totalFiltered] = await Promise.all([
      Customer.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(query),
    ])

    // Import Enquiry model dynamically or aggregate request count
    const { Enquiry } = await import('../models/Enquiry.js')

    // Attach dynamic requestsCount for each customer
    const customers = await Promise.all(
      rawCustomers.map(async (c) => {
        const cleanPhone = (c.phone || '').replace('+91', '').replace(/\s/g, '').trim()
        const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone
        const phoneRegex = new RegExp(last10 + '$', 'i')
        
        const count = await Enquiry.countDocuments({
          $or: [{ phone: cleanPhone }, { customerPhone: cleanPhone }, { phone: phoneRegex }, { customerPhone: phoneRegex }],
        })
        return {
          ...c,
          requestsCount: count,
          requests: count,
        }
      })
    )

    // Compute live platform customer stats
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const [totalAll, activeCount, inactiveCount, newThisMonth] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Customer.countDocuments({ status: 'Inactive' }),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ])

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1

    return successResponse(res, 'Customers retrieved successfully', {
      customers,
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
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Get Single Customer By ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404)
    }
    return successResponse(res, 'Customer details retrieved', customer)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Customer App: Get Customer Profile By Phone or Create if not exists (Login / Auto-Profile)
export const getOrCreateCustomerProfile = async (req, res) => {
  try {
    const rawPhone = (req.query.phone || req.body.phone || '').toString()
    if (!rawPhone || !rawPhone.trim()) {
      return errorResponse(res, 'Phone number is required', 400)
    }

    const cleanPhone = rawPhone.replace('+91', '').replace(/\s/g, '').trim()
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone
    const phoneRegex = new RegExp(last10 + '$', 'i')

    let customer = await Customer.findOne({
      $or: [{ phone: cleanPhone }, { phone: rawPhone.trim() }, { phone: phoneRegex }],
    })

    if (!customer) {
      // Auto-create customer profile on first mobile login
      customer = await Customer.create({
        phone: cleanPhone,
        name: req.body.name || 'Customer',
        email: req.body.email || '',
        location: 'India',
        status: 'Active',
      })
    }

    return successResponse(res, 'Customer profile retrieved successfully', customer)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Customer App: Update Customer Profile (Sync with MongoDB)
export const updateCustomerProfile = async (req, res) => {
  try {
    const {
      phone,
      name,
      email,
      companyName,
      businessName,
      gstNumber,
      address,
      city,
      state,
      pincode,
      location,
      avatar,
      avatarZoom,
      avatarPanX,
      avatarPanY,
    } = req.body

    const rawPhone = (phone || req.query.phone || '').toString()
    if (!rawPhone || !rawPhone.trim()) {
      return errorResponse(res, 'Phone number is required to update profile', 400)
    }

    const cleanPhone = rawPhone.replace('+91', '').replace(/\s/g, '').trim()
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone
    const phoneRegex = new RegExp(last10 + '$', 'i')

    let customer = await Customer.findOne({
      $or: [{ phone: cleanPhone }, { phone: rawPhone.trim() }, { phone: phoneRegex }],
    })

    const updateFields = {}
    if (name !== undefined) updateFields.name = name.trim()
    if (email !== undefined) updateFields.email = email.trim()
    if (companyName !== undefined) {
      updateFields.companyName = companyName.trim()
      updateFields.businessName = companyName.trim()
    }
    if (businessName !== undefined) updateFields.businessName = businessName.trim()
    if (gstNumber !== undefined) updateFields.gstNumber = gstNumber.trim()
    if (address !== undefined) updateFields.address = address.trim()
    if (city !== undefined) updateFields.city = city.trim()
    if (state !== undefined) updateFields.state = state.trim()
    if (pincode !== undefined) updateFields.pincode = pincode.trim()
    if (location !== undefined) updateFields.location = location.trim()
    if (avatar !== undefined) updateFields.avatar = avatar
    if (avatarZoom !== undefined) updateFields.avatarZoom = Number(avatarZoom) || 1.0
    if (avatarPanX !== undefined) updateFields.avatarPanX = Number(avatarPanX) || 0.0
    if (avatarPanY !== undefined) updateFields.avatarPanY = Number(avatarPanY) || 0.0

    const fcmToken = req.body.fcmToken || req.body.token

    if (!customer) {
      customer = await Customer.create({
        phone: cleanPhone,
        ...(fcmToken ? { fcmTokens: [fcmToken] } : {}),
        ...updateFields,
      })
    } else {
      const updateQuery = { $set: updateFields }
      if (fcmToken && !customer.fcmTokens?.includes(fcmToken)) {
        updateQuery.$addToSet = { fcmTokens: fcmToken }
      }
      customer = await Customer.findByIdAndUpdate(
        customer._id,
        updateQuery,
        { new: true }
      )
    }

    return successResponse(res, 'Profile updated and saved to database successfully', customer)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Create New Customer (Admin Panel)
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, registrationType, businessName, status, listings } =
      req.body

    if (!phone) {
      return errorResponse(res, 'Phone number is required', 400)
    }

    const cleanPhone = phone.replace('+91', '').replace(/\s/g, '').trim()
    const existingCustomer = await Customer.findOne({ phone: cleanPhone })
    if (existingCustomer) {
      return errorResponse(res, 'A customer with this phone number already exists', 400)
    }

    const customer = await Customer.create({
      name: name ? name.trim() : 'Customer',
      email: email ? email.toLowerCase().trim() : '',
      phone: cleanPhone,
      location: location || 'India',
      registrationType: registrationType || 'Individual',
      businessName: businessName || '',
      status: status || 'Active',
      listings: listings ? parseInt(listings, 10) : 0,
    })

    return successResponse(res, 'Customer created successfully', customer, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Update Customer (Admin Panel)
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, registrationType, businessName, status, listings } =
      req.body

    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404)
    }

    if (name) customer.name = name.trim()
    if (phone) customer.phone = phone.replace('+91', '').replace(/\s/g, '').trim()
    if (email !== undefined) customer.email = email.toLowerCase().trim()
    if (location !== undefined) customer.location = location
    if (registrationType) customer.registrationType = registrationType
    if (businessName !== undefined) customer.businessName = businessName
    if (status) customer.status = status
    if (listings !== undefined) customer.listings = parseInt(listings, 10) || 0

    await customer.save()

    return successResponse(res, 'Customer updated successfully', customer)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 7. Toggle Customer Status (Active <-> Inactive)
export const toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404)
    }

    customer.status = customer.status === 'Active' ? 'Inactive' : 'Active'
    await customer.save()

    return successResponse(
      res,
      `Customer marked as ${customer.status}`,
      customer
    )
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404)
    }

    return successResponse(res, `Customer "${customer.name}" deleted successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 9. Bulk Delete Customers
export const bulkDeleteCustomers = async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of customer IDs to delete', 400)
    }

    const result = await Customer.deleteMany({ _id: { $in: ids } })
    return successResponse(
      res,
      `${result.deletedCount} customer(s) deleted successfully`,
      { deletedCount: result.deletedCount }
    )
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 10. Bulk Update Status (Active / Inactive)
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of customer IDs', 400)
    }
    if (!status || !['Active', 'Inactive', 'Blocked'].includes(status)) {
      return errorResponse(res, 'Valid status (Active, Inactive, Blocked) is required', 400)
    }

    const result = await Customer.updateMany({ _id: { $in: ids } }, { $set: { status } })
    return successResponse(
      res,
      `${result.modifiedCount} customer(s) marked as ${status}`,
      { modifiedCount: result.modifiedCount }
    )
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
