import { Listing } from '../models/Listing.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { notifyOwnerOnListingStatusChange } from '../utils/ownerNotificationService.js'

/**
 * Get listing approvals queue with filters & stats
 */
export const getPendingApprovals = async (req, res) => {
  try {
    const { search, category, type, status = 'Pending', page = 1, limit = 50 } = req.query

    const filter = {}

    if (status && status !== 'All') {
      filter.approvalStatus = status
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { listingCode: searchRegex },
        { ownerName: searchRegex },
        { ownerPhone: searchRegex },
        { rcNumber: searchRegex },
      ]
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (type && type !== 'All') {
      filter.type = type
    }

    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 50
    const skip = (pageNum - 1) * limitNum

    const [listings, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Listing.countDocuments(filter),
      Listing.countDocuments({ approvalStatus: 'Pending' }),
      Listing.countDocuments({ approvalStatus: 'Approved' }),
      Listing.countDocuments({ approvalStatus: 'Rejected' }),
    ])

    return successResponse(res, 'Approvals retrieved successfully', {
      listings,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum) || 1,
        limit: limitNum,
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        totalReviewed: approvedCount + rejectedCount,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Approve a listing
 */
export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.approvalStatus = 'Approved'
    listing.status = 'Active'
    listing.approvedBy = req.user?.name || 'Admin'
    listing.approvalDate = new Date()
    listing.reviewedBy = req.user?.name || 'Admin'
    listing.reviewedAt = new Date()
    listing.rejectionReason = ''
    listing.rejectionNote = ''

    listing.history.push({
      action: 'Listing approved and activated by Admin',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    // Send push notification & SMS alert to listing owner
    notifyOwnerOnListingStatusChange({
      listing,
      statusType: 'Approved',
    }).catch((err) => console.error('Error sending approval notification to owner:', err))

    return successResponse(res, `Listing "${listing.title}" approved successfully`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Reject a listing with reason and note
 */
export const rejectListing = async (req, res) => {
  try {
    const { reason, note } = req.body
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.approvalStatus = 'Rejected'
    listing.status = 'Rejected'
    listing.rejectionReason = reason || 'Documentation Incomplete'
    listing.rejectionNote = note || ''
    listing.reviewedBy = req.user?.name || 'Admin'
    listing.reviewedAt = new Date()

    listing.history.push({
      action: `Listing rejected: ${listing.rejectionReason}`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    // Send push notification & SMS alert to listing owner
    notifyOwnerOnListingStatusChange({
      listing,
      statusType: 'Rejected',
      rejectionReason: listing.rejectionReason,
      rejectionNote: listing.rejectionNote,
    }).catch((err) => console.error('Error sending rejection notification to owner:', err))

    return successResponse(res, `Listing "${listing.title}" rejected`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Bulk approve listings
 */
export const bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Listing IDs array is required', 400)
    }

    const result = await Listing.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          approvalStatus: 'Approved',
          status: 'Active',
          approvedBy: req.user?.name || 'Admin',
          approvalDate: new Date(),
          reviewedBy: req.user?.name || 'Admin',
          reviewedAt: new Date(),
          rejectionReason: '',
          rejectionNote: '',
        },
        $push: {
          history: {
            action: 'Bulk approved by Admin',
            author: req.user?.name || 'Admin',
            createdAt: new Date(),
          },
        },
      }
    )

    return successResponse(res, `${result.modifiedCount} listings approved successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Bulk reject listings
 */
export const bulkReject = async (req, res) => {
  try {
    const { ids, reason, note } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Listing IDs array is required', 400)
    }

    const result = await Listing.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          approvalStatus: 'Rejected',
          status: 'Rejected',
          rejectionReason: reason || 'Documentation Incomplete',
          rejectionNote: note || '',
          reviewedBy: req.user?.name || 'Admin',
          reviewedAt: new Date(),
        },
        $push: {
          history: {
            action: `Bulk rejected by Admin: ${reason || 'Incomplete'}`,
            author: req.user?.name || 'Admin',
            createdAt: new Date(),
          },
        },
      }
    )

    return successResponse(res, `${result.modifiedCount} listings rejected successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
