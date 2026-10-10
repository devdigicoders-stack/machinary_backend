import { Category } from '../models/Category.js'
import { Listing } from '../models/Listing.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get All Categories (with Search, Filter, Sort, Pagination, Live Stats)
export const getCategories = async (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      categoryType = 'All',
      sortBy = 'Latest',
      page = 1,
      limit = 10,
    } = req.query

    const query = {}

    // Search filter
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [{ name: regex }, { description: regex }]
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status
    }

    // Category Type filter (rent, sell, transport, material)
    if (categoryType && categoryType !== 'All') {
      query.categoryType = categoryType.toLowerCase()
    }

    // Sorting
    let sortObj = { createdAt: -1 }
    if (sortBy === 'Name A-Z') {
      sortObj = { name: 1 }
    } else if (sortBy === 'Most Machines') {
      sortObj = { machinesCount: -1 }
    } else if (sortBy === 'Most Subcategories') {
      sortObj = { subcategories: -1 }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const skip = (pageNum - 1) * limitNum

    const [categories, totalFiltered] = await Promise.all([
      Category.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Category.countDocuments(query),
    ])

    // Live Stats
    const [totalAll, activeCount, inactiveCount, allCats] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ status: 'Active' }),
      Category.countDocuments({ status: 'Inactive' }),
      Category.find({}, 'subcategories').lean(),
    ])

    const totalSubcategories = allCats.reduce((acc, curr) => acc + (curr.subcategories || 0), 0)
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1

    // Attach dynamic live count of active listings per category
    const categoriesWithLiveCounts = await Promise.all(
      categories.map(async (cat) => {
        const catNameRegex = new RegExp(`^${cat.name?.trim()}$`, 'i')
        const liveListingCount = await Listing.countDocuments({
          $or: [{ category: catNameRegex }, { category: cat.name }]
        })
        return {
          ...cat,
          machinesCount: liveListingCount > 0 ? liveListingCount : (cat.machinesCount || 0),
        }
      })
    )

    return successResponse(res, 'Categories retrieved successfully', {
      categories: categoriesWithLiveCounts,
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
        subcategories: totalSubcategories,
      },
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Get Single Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean()
    if (!category) {
      return errorResponse(res, 'Category not found', 404)
    }

    const catNameRegex = new RegExp(`^${category.name?.trim()}$`, 'i')
    const liveListingCount = await Listing.countDocuments({
      $or: [{ category: catNameRegex }, { category: category.name }]
    })

    const categoryWithLiveCount = {
      ...category,
      machinesCount: liveListingCount > 0 ? liveListingCount : (category.machinesCount || 0),
    }

    return successResponse(res, 'Category details retrieved', categoryWithLiveCount)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, subcategories, machinesCount, categoryType, status } = req.body

    if (!name || !name.trim()) {
      return errorResponse(res, 'Category name is required', 400)
    }

    const existing = await Category.findOne({ name: name.trim() })
    if (existing) {
      return errorResponse(res, 'A category with this name already exists', 400)
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: (description || '').trim(),
      image:
        image ||
        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200&auto=format&fit=crop&q=80',
      icon: icon || 'Truck',
      subcategories: parseInt(subcategories, 10) || 1,
      machinesCount: parseInt(machinesCount, 10) || 0,
      categoryType: (categoryType || 'rent').toLowerCase(),
      status: status || 'Active',
    })

    return successResponse(res, 'Category created successfully', category, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    const category = await Category.findById(id)
    if (!category) {
      return errorResponse(res, 'Category not found', 404)
    }

    if (updateData.name && updateData.name.trim() !== category.name) {
      const conflict = await Category.findOne({
        name: updateData.name.trim(),
        _id: { $ne: id },
      })
      if (conflict) {
        return errorResponse(res, 'Another category with this name already exists', 400)
      }
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    if (updateData.subcategories !== undefined) {
      updateData.subcategories = parseInt(updateData.subcategories, 10) || 1
    }

    if (updateData.machinesCount !== undefined) {
      updateData.machinesCount = parseInt(updateData.machinesCount, 10) || 0
    }

    if (updateData.categoryType !== undefined) {
      updateData.categoryType = (updateData.categoryType || 'rent').toLowerCase()
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    return successResponse(res, 'Category updated successfully', updated)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Toggle Category Status (Active <-> Inactive)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findById(id)
    if (!category) {
      return errorResponse(res, 'Category not found', 404)
    }

    const nextStatus =
      req.body?.status || (category.status === 'Active' ? 'Inactive' : 'Active')
    category.status = nextStatus
    await category.save()

    return successResponse(res, `Category status changed to ${nextStatus}`, category)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Delete Single Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) {
      return errorResponse(res, 'Category not found', 404)
    }
    return successResponse(res, 'Category deleted successfully', { id })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 7. Bulk Status Update
export const bulkUpdateCategoryStatus = async (req, res) => {
  try {
    const { ids, status } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide category IDs array', 400)
    }

    const result = await Category.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    )

    return successResponse(res, `Updated status for ${result.modifiedCount} categories`, {
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Bulk Delete Categories
export const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide category IDs array', 400)
    }

    const result = await Category.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `Deleted ${result.deletedCount} categories`, {
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
