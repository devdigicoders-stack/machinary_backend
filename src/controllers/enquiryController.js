import { Enquiry } from '../models/Enquiry.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get All Enquiries (with search, filter, pagination, and real-time live counts)
export const getEnquiries = async (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      enquiryType = 'All',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query

    const query = {}

    // Search filter
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: regex },
        { customerName: regex },
        { email: regex },
        { phone: regex },
        { machine: regex },
        { machineName: regex },
        { location: regex },
        { enquiryId: regex },
      ]
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status
    }

    // Enquiry Type filter (Buy / Rent)
    if (enquiryType && enquiryType !== 'All') {
      query.enquiryType = enquiryType
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const skip = (pageNum - 1) * limitNum

    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj = { [sortBy]: sortOrder }

    const [enquiries, totalFiltered] = await Promise.all([
      Enquiry.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Enquiry.countDocuments(query),
    ])

    // Live counts for KPI cards and filter pill tabs
    const [totalAll, newCount, contactedCount, convertedCount, closedCount] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ status: 'Contacted' }),
      Enquiry.countDocuments({ status: 'Converted' }),
      Enquiry.countDocuments({ status: 'Closed' }),
    ])

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1

    return successResponse(res, 'Enquiries retrieved successfully', {
      enquiries,
      pagination: {
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      counts: {
        all: totalAll,
        new: newCount,
        contacted: contactedCount,
        converted: convertedCount,
        closed: closedCount,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Get Single Enquiry Details
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404)
    }
    return successResponse(res, 'Enquiry details retrieved', enquiry)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Create Enquiry
export const createEnquiry = async (req, res) => {
  try {
    const { name, phone, email, machine, enquiryType, location, budgetRange, requirementDate, message } =
      req.body

    if (!name || !phone || !machine) {
      return errorResponse(res, 'Name, phone and machine name are required', 400)
    }

    const enquiry = await Enquiry.create({
      name,
      customerName: name,
      phone,
      customerPhone: phone,
      email: email || '',
      customerEmail: email || '',
      machine,
      machineName: machine,
      fullMachineName: machine,
      enquiryType: enquiryType || 'Buy',
      location: location || 'India',
      budgetRange: budgetRange || '',
      requirementDate: requirementDate || 'Immediate',
      message: message || '',
      status: 'New',
    })

    return successResponse(res, 'Enquiry created successfully', enquiry, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Update Enquiry Status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status || !['New', 'Contacted', 'Converted', 'Closed'].includes(status)) {
      return errorResponse(res, 'Valid status is required (New, Contacted, Converted, Closed)', 400)
    }

    const enquiry = await Enquiry.findById(req.params.id)
    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404)
    }

    const oldStatus = enquiry.status
    enquiry.status = status

    // Append to audit history
    enquiry.history.push({
      action: `Status updated from "${oldStatus}" to "${status}"`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await enquiry.save()

    return successResponse(res, `Enquiry status changed to "${status}"`, enquiry)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Add Note to Enquiry
export const addEnquiryNote = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) {
      return errorResponse(res, 'Note text cannot be empty', 400)
    }

    const enquiry = await Enquiry.findById(req.params.id)
    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404)
    }

    const author = req.user?.name || 'Admin'
    const newNote = {
      text: text.trim(),
      author,
      createdAt: new Date(),
    }

    enquiry.notes.push(newNote)
    enquiry.history.push({
      action: `Added note: "${text.trim().substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
      author,
      createdAt: new Date(),
    })

    await enquiry.save()

    return successResponse(res, 'Note added successfully', enquiry)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Assign Enquiry Executive
export const assignEnquiry = async (req, res) => {
  try {
    const { assignedTo } = req.body
    if (!assignedTo) {
      return errorResponse(res, 'Executive name is required', 400)
    }

    const enquiry = await Enquiry.findById(req.params.id)
    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404)
    }

    enquiry.assignedTo = assignedTo
    enquiry.history.push({
      action: `Assigned to ${assignedTo}`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await enquiry.save()

    return successResponse(res, `Enquiry assigned to ${assignedTo}`, enquiry)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 7. Delete Single Enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id)
    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404)
    }
    return successResponse(res, `Enquiry ${enquiry.enquiryId || ''} deleted successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Bulk Update Status
export const bulkUpdateEnquiryStatus = async (req, res) => {
  try {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of enquiry IDs', 400)
    }
    if (!status || !['New', 'Contacted', 'Converted', 'Closed'].includes(status)) {
      return errorResponse(res, 'Valid status is required', 400)
    }

    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      {
        $set: { status },
        $push: {
          history: {
            action: `Bulk status updated to "${status}"`,
            author: req.user?.name || 'Admin',
            createdAt: new Date(),
          },
        },
      }
    )

    return successResponse(res, `${result.modifiedCount} enquiries marked as ${status}`, {
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 9. Bulk Delete Enquiries
export const bulkDeleteEnquiries = async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of enquiry IDs', 400)
    }

    const result = await Enquiry.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `${result.deletedCount} enquiries deleted successfully`, {
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
