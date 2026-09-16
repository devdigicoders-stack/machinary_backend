import { Listing } from '../models/Listing.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

/**
 * Get reported listings with live reports, search, filters & stats
 */
export const getReportedListings = async (req, res) => {
  try {
    const { search, status = 'All', reason } = req.query

    const filter = {
      $or: [
        { isReported: true },
        { reportCount: { $gt: 0 } },
        { 'reports.0': { $exists: true } },
      ],
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$and = [
        {
          $or: [
            { title: searchRegex },
            { listingCode: searchRegex },
            { ownerName: searchRegex },
            { ownerPhone: searchRegex },
            { 'reports.reporterName': searchRegex },
            { 'reports.reason': searchRegex },
          ],
        },
      ]
    }

    if (reason && reason !== 'All') {
      filter['reports.reason'] = reason
    }

    const reportedListings = await Listing.find(filter).sort({ updatedAt: -1 }).lean()

    // Flatten reports into individual actionable items for the admin table
    let flattenedReports = []
    reportedListings.forEach((listing) => {
      if (listing.reports && listing.reports.length > 0) {
        listing.reports.forEach((rep) => {
          flattenedReports.push({
            reportId: rep._id,
            listingId: listing._id,
            listingCode: listing.listingCode,
            listingTitle: listing.title,
            category: listing.category,
            type: listing.type,
            rateOrPrice: listing.rateOrPrice,
            rateUnit: listing.rateUnit,
            image: listing.image,
            ownerName: listing.ownerName,
            ownerPhone: listing.ownerPhone,
            listingStatus: listing.status,
            listingApproval: listing.approvalStatus,
            reporterName: rep.reporterName,
            reporterEmail: rep.reporterEmail,
            reason: rep.reason,
            description: rep.description,
            reportDate: rep.date || rep.createdAt,
            reportTime: rep.time || '',
            status: rep.status || (listing.isReported ? 'Pending' : 'Resolved'),
            actionTaken: rep.actionTaken || '',
            resolvedAt: rep.resolvedAt,
            resolvedBy: rep.resolvedBy,
          })
        })
      } else if (listing.isReported) {
        flattenedReports.push({
          reportId: listing._id,
          listingId: listing._id,
          listingCode: listing.listingCode,
          listingTitle: listing.title,
          category: listing.category,
          type: listing.type,
          rateOrPrice: listing.rateOrPrice,
          rateUnit: listing.rateUnit,
          image: listing.image,
          ownerName: listing.ownerName,
          ownerPhone: listing.ownerPhone,
          listingStatus: listing.status,
          listingApproval: listing.approvalStatus,
          reporterName: 'Platform Moderator',
          reporterEmail: 'moderator@machinerywallah.com',
          reason: 'Suspicious Activity Flagged',
          description: 'Automated policy check flagged this listing for review.',
          reportDate: listing.updatedAt,
          reportTime: '',
          status: 'Pending',
          actionTaken: '',
        })
      }
    })

    // Filter by status if specified
    if (status && status !== 'All') {
      flattenedReports = flattenedReports.filter(
        (r) => r.status.toLowerCase() === status.toLowerCase()
      )
    }

    // Calculate aggregated stats
    const totalReports = flattenedReports.length
    const pendingCount = flattenedReports.filter((r) => r.status === 'Pending').length
    const resolvedCount = flattenedReports.filter((r) => r.status === 'Resolved').length
    const highSeverityCount = flattenedReports.filter(
      (r) =>
        r.reason.toLowerCase().includes('fraud') ||
        r.reason.toLowerCase().includes('fake') ||
        r.reason.toLowerCase().includes('damage')
    ).length

    return successResponse(res, 'Reported listings retrieved successfully', {
      reports: flattenedReports,
      stats: {
        total: totalReports,
        pending: pendingCount,
        resolved: resolvedCount,
        highSeverity: highSeverityCount,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Resolve report on a listing
 */
export const resolveReport = async (req, res) => {
  try {
    const { actionTaken = 'Kept Active', note = '' } = req.body
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    // Update reports subdocuments
    if (listing.reports && listing.reports.length > 0) {
      listing.reports.forEach((rep) => {
        if (rep.status === 'Pending') {
          rep.status = 'Resolved'
          rep.actionTaken = actionTaken
          rep.resolvedAt = new Date()
          rep.resolvedBy = req.user?.name || 'Admin'
        }
      })
    }

    if (actionTaken === 'Listing Delisted' || actionTaken === 'Delisted') {
      listing.status = 'Inactive'
      listing.approvalStatus = 'Rejected'
    }

    listing.isReported = false
    listing.reportCount = 0

    listing.history.push({
      action: `Report resolved: ${actionTaken}${note ? ` (${note})` : ''}`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, `Report resolved with action: ${actionTaken}`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Dismiss report as false flag
 */
export const dismissReport = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    if (listing.reports && listing.reports.length > 0) {
      listing.reports.forEach((rep) => {
        if (rep.status === 'Pending') {
          rep.status = 'Dismissed'
          rep.actionTaken = 'Dismissed as false flag'
          rep.resolvedAt = new Date()
          rep.resolvedBy = req.user?.name || 'Admin'
        }
      })
    }

    listing.isReported = false
    listing.reportCount = 0

    listing.history.push({
      action: 'Report dismissed as false flag by Admin',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, 'Report dismissed successfully', listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Take down / delist a reported listing immediately
 */
export const delistReportedListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.status = 'Inactive'
    listing.approvalStatus = 'Rejected'
    listing.isReported = false

    if (listing.reports && listing.reports.length > 0) {
      listing.reports.forEach((rep) => {
        rep.status = 'Resolved'
        rep.actionTaken = 'Listing Delisted'
        rep.resolvedAt = new Date()
        rep.resolvedBy = req.user?.name || 'Admin'
      })
    }

    listing.history.push({
      action: 'Listing delisted and deactivated due to report violations',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, `Listing "${listing.title}" delisted and deactivated`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
