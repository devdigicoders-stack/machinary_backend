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
    const andConditions = []

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      andConditions.push({
        $or: [
          { title: searchRegex },
          { subtitle: searchRegex },
          { listingCode: searchRegex },
          { ownerName: searchRegex },
          { ownerPhone: searchRegex },
          { 'location.city': searchRegex },
          { 'location.state': searchRegex },
          { rcNumber: searchRegex },
        ],
      })
    }

    if (category && category !== 'All') {
      const cleanCat = category.trim()
      const lowerCat = cleanCat.toLowerCase()

      // Expand common category synonyms
      const synonymList = []
      if (lowerCat.includes('earthmoving') || lowerCat.includes('excavator') || lowerCat.includes('jcb')) {
        synonymList.push('earthmoving', 'excavator', 'jcb', 'backhoe', 'bulldozer', 'loader', 'skid')
      } else if (lowerCat.includes('lifting') || lowerCat.includes('crane')) {
        synonymList.push('crane', 'lifting', 'farana', 'hydra', 'hoist')
      } else if (lowerCat.includes('road') || lowerCat.includes('roller')) {
        synonymList.push('road', 'roller', 'paver', 'grader', 'compactor')
      } else if (lowerCat.includes('concrete') || lowerCat.includes('mixer')) {
        synonymList.push('concrete', 'mixer', 'pump', 'transit', 'batching')
      } else if (lowerCat.includes('tipper') || lowerCat.includes('dumper') || lowerCat.includes('vehicle') || lowerCat.includes('trailer')) {
        synonymList.push('tipper', 'dumper', 'trailer', 'transit', 'vehicle', 'truck')
      } else if (lowerCat.includes('material') || lowerCat.includes('steel') || lowerCat.includes('brick') || lowerCat.includes('cement')) {
        synonymList.push('material', 'steel', 'brick', 'cement', 'sand', 'aggregate')
      } else {
        const words = cleanCat
          .split(/[\s,&\(\)\/]+/)
          .filter((w) => w.length > 2 && !['rent', 'sale', 'equipment', 'buy'].includes(w.toLowerCase()))
        synonymList.push(...words)
      }

      const regexPattern = synonymList.length > 0 ? synonymList.join('|') : cleanCat
      const catRegex = new RegExp(regexPattern, 'i')

      andConditions.push({
        $or: [
          { category: catRegex },
          { subtitle: catRegex },
          { title: catRegex },
        ],
      })
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions
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

/**
 * 1. Owner: List Rent Machine
 */
export const createRentListing = async (req, res) => {
  try {
    const {
      brand,
      model,
      category,
      rentRate,
      rateUnit = 'per day',
      minDuration = 'Flexible',
      operatorIncluded = false,
      securityDeposit = 'N/A',
      year = '2023',
      workingHours = '0 hrs',
      location,
      description = '',
      images = [],
      image = '',
      documents = {},
    } = req.body

    const ownerName = req.user?.name || req.body.ownerName || 'Machine Owner'
    const ownerPhone = (req.user?.phone || req.body.ownerPhone || '').toString().replace('+91', '').replace(/\s/g, '').trim()

    const title = `${brand || ''} ${model || ''}`.trim() || 'Machinery on Rent'
    const listingImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : []

    const newListing = await Listing.create({
      title,
      subtitle: `${category || 'Heavy Machinery'} • For Rent`,
      category: category || 'Earthmoving Equipment',
      type: 'Rent',
      rateOrPrice: rentRate ? `₹${rentRate}` : '₹3,500',
      rateUnit,
      securityDeposit,
      minDuration,
      operatorIncluded: Boolean(operatorIncluded),
      modelYear: year,
      hoursUsed: workingHours,
      description,
      ownerName,
      ownerPhone,
      location: typeof location === 'object' ? location : { city: location || 'Lucknow', state: 'Uttar Pradesh' },
      image: listingImages[0] || '',
      images: listingImages,
      documents: typeof documents === 'object' ? documents : {},
      docStatus: Object.values(documents || {}).some(Boolean) ? 'Uploaded (Pending Admin Verification)' : 'Not Uploaded',
      status: 'Inactive',
      approvalStatus: 'Pending',
      availability: 'Available Now',
    })

    return successResponse(res, 'Rental machine listed successfully. Waiting for admin approval.', newListing, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * 2. Owner: List Sell Machine
 */
export const createSellListing = async (req, res) => {
  try {
    const {
      brand,
      model,
      category,
      price,
      condition = 'Used',
      year = '2022',
      workingHours = '0 hrs',
      location,
      description = '',
      images = [],
      image = '',
      documents = {},
      specifications = {},
    } = req.body

    const ownerName = req.user?.name || req.body.ownerName || 'Machine Owner'
    const ownerPhone = (req.user?.phone || req.body.ownerPhone || '').toString().replace('+91', '').replace(/\s/g, '').trim()

    const title = `${brand || ''} ${model || ''}`.trim() || 'Machine For Sale'
    const listingImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : []

    const newListing = await Listing.create({
      title,
      subtitle: `${category || 'Heavy Equipment'} • Condition: ${condition}`,
      category: category || 'Earthmoving Equipment',
      type: 'Sale',
      rateOrPrice: price ? (price.toString().startsWith('₹') ? price : `₹${price}`) : '₹18,50,000',
      rateUnit: '',
      modelYear: year,
      hoursUsed: workingHours,
      description,
      ownerName,
      ownerPhone,
      location: typeof location === 'object' ? location : { city: location || 'Lucknow', state: 'Uttar Pradesh' },
      image: listingImages[0] || '',
      images: listingImages,
      documents: typeof documents === 'object' ? documents : {},
      docStatus: Object.values(documents || {}).some(Boolean) ? 'Uploaded (Pending Admin Verification)' : 'Not Uploaded',
      status: 'Inactive',
      approvalStatus: 'Pending',
      availability: 'Available Now',
      specifications: { ...specifications, condition },
    })

    return successResponse(res, 'Machine for sale listed successfully. Waiting for admin approval.', newListing, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * 3. Owner: List Transport Vehicle
 */
export const createTransportListing = async (req, res) => {
  try {
    const {
      vehicleType,
      brand,
      model,
      capacity,
      bodyType,
      regNumber,
      fuelType,
      ratePerKm,
      minCharge,
      routes,
      availableFrom,
      location,
      images = [],
      image = '',
      documents = {},
    } = req.body

    const ownerName = req.user?.name || req.body.ownerName || 'Transport Operator'
    const ownerPhone = (req.user?.phone || req.body.ownerPhone || '').toString().replace('+91', '').replace(/\s/g, '').trim()

    const title = `${brand || ''} ${model || ''} (${bodyType || vehicleType || 'Transport Truck'})`.trim()
    const listingImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : []

    const newListing = await Listing.create({
      title,
      subtitle: `Capacity: ${capacity || '10 Ton'} • ${routes || 'All India Permit'}`,
      category: 'Transport Vehicle',
      type: 'Transport',
      rateOrPrice: ratePerKm ? `₹${ratePerKm}/km` : '₹45/km',
      rateUnit: 'per km',
      rcNumber: regNumber || '',
      minDuration: availableFrom || 'Immediate',
      description: `Routes: ${routes || 'Local & Interstate'}. Min Booking: ₹${minCharge || '2500'}. Fuel: ${fuelType || 'Diesel'}`,
      ownerName,
      ownerPhone,
      location: typeof location === 'object' ? location : { city: location || 'Lucknow', state: 'Uttar Pradesh' },
      image: listingImages[0] || '',
      images: listingImages,
      documents: typeof documents === 'object' ? documents : {},
      docStatus: Object.values(documents || {}).some(Boolean) ? 'Uploaded (Pending Admin Verification)' : 'Not Uploaded',
      status: 'Inactive',
      approvalStatus: 'Pending',
      availability: 'Available Now',
      specifications: {
        vehicleType,
        capacity,
        bodyType,
        fuelType,
        minCharge,
        routes,
      },
    })

    return successResponse(res, 'Transport vehicle listed successfully. Waiting for admin approval.', newListing, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * 4. Owner: List Material Supply
 */
export const createMaterialListing = async (req, res) => {
  try {
    const {
      materialName,
      materialCategory,
      grade,
      unitPrice,
      supplyUnit = 'Ton',
      minOrder = '10 Ton',
      deliveryType = 'Available',
      dailyCapacity = '500 Ton/Day',
      leadTime = '24 Hours',
      supplyArea = 'Local & Nearby',
      location,
      description = '',
      images = [],
      image = '',
      documents = {},
    } = req.body

    const ownerName = req.user?.name || req.body.ownerName || 'Material Supplier'
    const ownerPhone = (req.user?.phone || req.body.ownerPhone || '').toString().replace('+91', '').replace(/\s/g, '').trim()

    const title = `${materialName || materialCategory || 'Construction Material'} (${grade || 'Standard'})`.trim()
    const listingImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : []

    const newListing = await Listing.create({
      title,
      subtitle: `Category: ${materialCategory || 'Construction Material'} • Min Order: ${minOrder}`,
      category: 'Construction Material',
      type: 'MaterialSupply',
      rateOrPrice: unitPrice ? `₹${unitPrice}/${supplyUnit}` : '₹3,800/Ton',
      rateUnit: `per ${supplyUnit}`,
      description: `${description || ''} Delivery: ${deliveryType}. Capacity: ${dailyCapacity}. Supply Area: ${supplyArea}`,
      ownerName,
      ownerPhone,
      location: typeof location === 'object' ? location : { city: location || 'Lucknow', state: 'Uttar Pradesh' },
      image: listingImages[0] || '',
      images: listingImages,
      documents: typeof documents === 'object' ? documents : {},
      docStatus: Object.values(documents || {}).some(Boolean) ? 'Uploaded (Pending Admin Verification)' : 'Not Uploaded',
      status: 'Inactive',
      approvalStatus: 'Pending',
      availability: 'Available Now',
      specifications: {
        materialCategory,
        grade,
        supplyUnit,
        minOrder,
        deliveryType,
        dailyCapacity,
        leadTime,
        supplyArea,
      },
    })

    return successResponse(res, 'Material supply listed successfully. Waiting for admin approval.', newListing, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

/**
 * 5. Owner: Get My Listings (Strict Owner Data Isolation)
 */
export const getMyListings = async (req, res) => {
  try {
    const { phone, type, category, status } = req.query
    const rawPhone = req.user?.phone || phone || ''
    const cleanPhone = rawPhone.replace('+91', '').replace(/\s/g, '').trim()

    // Strict Owner Isolation: If no owner phone is provided or identified, return 0 listings
    if (!cleanPhone) {
      return successResponse(res, 'My listings retrieved successfully', {
        total: 0,
        listings: [],
      })
    }

    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone
    const phoneRegex = new RegExp(last10 + '$', 'i')

    const filter = {
      $or: [
        { ownerPhone: cleanPhone },
        { ownerPhone: rawPhone.trim() },
        { ownerPhone: phoneRegex },
      ],
    }

    if (type && type !== 'All') {
      filter.type = type
    }
    if (category && category !== 'All') {
      filter.category = category
    }
    if (status && status !== 'All') {
      filter.status = status
    }

    const listings = await Listing.find(filter).sort('-createdAt').limit(100).lean()

    return successResponse(res, 'My listings retrieved successfully', {
      total: listings.length,
      listings,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}


