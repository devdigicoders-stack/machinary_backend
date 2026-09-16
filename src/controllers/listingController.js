import { Listing } from '../models/Listing.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

/**
 * Get listings with search, filter, pagination and aggregate counts
 */
export const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      type,
      approvalStatus,
      status,
      availability,
      isFeatured,
      isReported,
      promotionType,
      promotionStatus,
      page = 1,
      limit = 50,
      sort = '-createdAt',
    } = req.query

    const filter = {}

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: searchRegex },
        { subtitle: searchRegex },
        { listingCode: searchRegex },
        { ownerName: searchRegex },
        { ownerPhone: searchRegex },
        { 'location.city': searchRegex },
        { 'location.state': searchRegex },
        { rcNumber: searchRegex },
      ]
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (type && type !== 'All') {
      filter.type = type
    }

    if (approvalStatus && approvalStatus !== 'All') {
      filter.approvalStatus = approvalStatus
    }

    if (status && status !== 'All') {
      filter.status = status
    }

    if (availability && availability !== 'All') {
      filter.availability = availability
    }

    if (isFeatured !== undefined && isFeatured !== 'All') {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true
    }

    if (isReported !== undefined && isReported !== 'All') {
      filter.isReported = isReported === 'true' || isReported === true
    }

    if (promotionType && promotionType !== 'All') {
      filter.promotionType = promotionType
    }

    if (promotionStatus && promotionStatus !== 'All') {
      filter.promotionStatus = promotionStatus
    }

    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 50
    const skip = (pageNum - 1) * limitNum

    const [listings, totalFiltered, totalListings, activeListings, rentListings, saleListings, pendingApprovals, reportedCount, featuredCount] =
      await Promise.all([
        Listing.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
        Listing.countDocuments(filter),
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'Active' }),
        Listing.countDocuments({ type: 'Rent' }),
        Listing.countDocuments({ type: 'Sale' }),
        Listing.countDocuments({ approvalStatus: 'Pending' }),
        Listing.countDocuments({ isReported: true }),
        Listing.countDocuments({ isFeatured: true }),
      ])

    return successResponse(res, 'Listings retrieved successfully', {
      listings,
      pagination: {
        total: totalFiltered,
        page: pageNum,
        pages: Math.ceil(totalFiltered / limitNum) || 1,
        limit: limitNum,
      },
      stats: {
        total: totalListings,
        active: activeListings,
        rent: rentListings,
        sale: saleListings,
        pending: pendingApprovals,
        reported: reportedCount,
        featured: featuredCount,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Get single listing by ID
 */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }
    return successResponse(res, 'Listing retrieved successfully', listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Create a new listing
 */
export const createListing = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      type,
      rateOrPrice,
      rateUnit,
      securityDeposit,
      minDuration,
      operatorIncluded,
      modelYear,
      hoursUsed,
      description,
      insuranceValidTill,
      rcNumber,
      docStatus,
      ownerName,
      ownerPhone,
      ownerKyc,
      location,
      image,
      images,
      availability,
      status,
      approvalStatus,
      specifications,
    } = req.body

    if (!title || !category || !type || !rateOrPrice || !ownerName || !ownerPhone) {
      return errorResponse(
        res,
        'Title, category, type, price/rate, owner name, and owner phone are required',
        400
      )
    }

    const listingImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : []

    const newListing = new Listing({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      category,
      type,
      rateOrPrice: rateOrPrice.toString().trim(),
      rateUnit: rateUnit || (type === 'Rent' ? 'per day' : ''),
      securityDeposit: securityDeposit || 'N/A',
      minDuration: minDuration || 'Flexible',
      operatorIncluded: Boolean(operatorIncluded),
      modelYear: modelYear || '2023',
      hoursUsed: hoursUsed || '0 hrs',
      description: description || '',
      insuranceValidTill: insuranceValidTill || 'N/A',
      rcNumber: rcNumber || '',
      docStatus: docStatus || 'Uploaded & Clear',
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      ownerKyc: ownerKyc || 'Verified',
      location: location || { city: 'Lucknow', state: 'Uttar Pradesh', address: '' },
      image: image || (listingImages[0] || ''),
      images: listingImages,
      availability: availability || 'Available Now',
      status: status || 'Active',
      approvalStatus: approvalStatus || 'Approved',
      specifications: specifications || {},
      history: [
        {
          action: 'Listing created by Admin',
          author: req.user?.name || 'Admin',
          createdAt: new Date(),
        },
      ],
    })

    await newListing.save()

    return successResponse(res, 'Listing created successfully', newListing, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Update existing listing
 */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    const updateData = { ...req.body }

    if (updateData.image && (!updateData.images || updateData.images.length === 0)) {
      updateData.images = [updateData.image]
    } else if (Array.isArray(updateData.images) && updateData.images.length > 0 && !updateData.image) {
      updateData.image = updateData.images[0]
    }

    Object.assign(listing, updateData)

    listing.history.push({
      action: 'Listing updated by Admin',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, 'Listing updated successfully', listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Toggle listing operational status (Active <-> Inactive)
 */
export const toggleListingStatus = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.status = listing.status === 'Active' ? 'Inactive' : 'Active'
    listing.history.push({
      action: `Status toggled to ${listing.status}`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, `Listing status updated to ${listing.status}`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Delete listing
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }
    return successResponse(res, `Listing "${listing.title}" deleted successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Bulk update listing status
 */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return errorResponse(res, 'Listing IDs array and target status are required', 400)
    }

    const result = await Listing.updateMany(
      { _id: { $in: ids } },
      {
        $set: { status },
        $push: {
          history: {
            action: `Bulk updated status to ${status}`,
            author: req.user?.name || 'Admin',
            createdAt: new Date(),
          },
        },
      }
    )

    return successResponse(res, `${result.modifiedCount} listings updated to ${status}`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Bulk delete listings
 */
export const bulkDeleteListings = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Listing IDs array is required', 400)
    }

    const result = await Listing.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `${result.deletedCount} listings deleted successfully`)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Get Promoted & Featured listings with live campaign metrics
 */
export const getPromotedListings = async (req, res) => {
  try {
    const { search, promotionType, promotionStatus } = req.query

    const filter = {
      $or: [{ isFeatured: true }, { promotionType: { $ne: 'None' } }],
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$and = [
        {
          $or: [
            { title: searchRegex },
            { listingCode: searchRegex },
            { ownerName: searchRegex },
            { category: searchRegex },
          ],
        },
      ]
    }

    if (promotionType && promotionType !== 'All') {
      filter.promotionType = promotionType
    }

    if (promotionStatus && promotionStatus !== 'All') {
      filter.promotionStatus = promotionStatus
    }

    const [promotions, totalCount, activeCampaigns, expiredCampaigns] = await Promise.all([
      Listing.find(filter).sort({ promotionStartDate: -1, createdAt: -1 }).lean(),
      Listing.countDocuments({
        $or: [{ isFeatured: true }, { promotionType: { $ne: 'None' } }],
      }),
      Listing.countDocuments({
        $or: [{ isFeatured: true }, { promotionType: { $ne: 'None' } }],
        promotionStatus: 'Active',
      }),
      Listing.countDocuments({
        $or: [{ isFeatured: true }, { promotionType: { $ne: 'None' } }],
        promotionStatus: 'Expired',
      }),
    ])

    const totalViews = promotions.reduce((acc, curr) => acc + (curr.promotionViews || 0), 0)

    return successResponse(res, 'Promoted listings retrieved successfully', {
      promotions,
      stats: {
        total: totalCount,
        active: activeCampaigns,
        expired: expiredCampaigns,
        totalViews,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Add or renew a promotion on a listing
 */
export const addPromotion = async (req, res) => {
  try {
    const { listingId, promotionType = 'Featured', durationDays = 7 } = req.body

    if (!listingId) {
      return errorResponse(res, 'Listing ID is required', 400)
    }

    const listing = await Listing.findById(listingId)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    const startDate = new Date()
    const endDate = new Date(Date.now() + parseInt(durationDays, 10) * 24 * 60 * 60 * 1000)

    listing.isFeatured = true
    listing.promotionType = promotionType
    listing.promotionStartDate = startDate
    listing.promotionEndDate = endDate
    listing.promotionStatus = 'Active'

    listing.history.push({
      action: `Promotion activated: ${promotionType} for ${durationDays} days`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, `Promotion "${promotionType}" activated for listing`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Toggle promotion status (Active <-> Expired)
 */
export const togglePromotionStatus = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.promotionStatus = listing.promotionStatus === 'Active' ? 'Expired' : 'Active'
    listing.isFeatured = listing.promotionStatus === 'Active'

    listing.history.push({
      action: `Promotion status changed to ${listing.promotionStatus}`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, `Promotion status updated to ${listing.promotionStatus}`, listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * Cancel or remove promotion from listing
 */
export const removePromotion = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404)
    }

    listing.isFeatured = false
    listing.promotionType = 'None'
    listing.promotionStatus = 'Expired'

    listing.history.push({
      action: 'Promotion removed by Admin',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })

    await listing.save()

    return successResponse(res, 'Promotion removed from listing', listing)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
