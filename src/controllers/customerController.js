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

    // Search term across name, email, phone, location
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { location: regex }]
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
    const [customers, totalFiltered] = await Promise.all([
      Customer.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(query),
    ])

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

// 3. Create New Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, registrationType, businessName, status, listings } =
      req.body

    if (!name || !email || !phone) {
      return errorResponse(res, 'Name, email and phone number are required', 400)
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() })
    if (existingCustomer) {
      return errorResponse(res, 'A customer with this email already exists', 400)
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
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

// 4. Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, registrationType, businessName, status, listings } =
      req.body

    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404)
    }

    if (email && email.toLowerCase() !== customer.email) {
      const emailTaken = await Customer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: customer._id },
      })
      if (emailTaken) {
        return errorResponse(res, 'Email address is already in use by another customer', 400)
      }
      customer.email = email.toLowerCase()
    }

    if (name) customer.name = name.trim()
    if (phone) customer.phone = phone.trim()
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

// 5. Toggle Customer Status (Active <-> Inactive)
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

// 6. Delete Customer
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

// 7. Bulk Delete Customers
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

// 8. Bulk Update Status (Active / Inactive)
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
