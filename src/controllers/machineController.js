import { Machine } from '../models/Machine.js'
import { Category } from '../models/Category.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get All Machines (Search, Filter, Pagination, Live Stats, Distinct Metadata)
export const getMachines = async (req, res) => {
  try {
    const {
      search = '',
      category = 'All',
      machineType = 'All',
      owner = 'All',
      status = 'All',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query

    const query = {}

    // Search query across name, brand, model, subtitle, owner, regNo, location
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: regex },
        { brand: regex },
        { model: regex },
        { subtitle: regex },
        { owner: regex },
        { regNo: regex },
        { location: regex },
      ]
    }

    if (category && category !== 'All') {
      query.category = category
    }

    if (machineType && machineType !== 'All') {
      query.machineType = machineType
    }

    if (owner && owner !== 'All') {
      query.owner = owner
    }

    if (status && status !== 'All') {
      query.status = status
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const skip = (pageNum - 1) * limitNum

    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj = { [sortBy]: sortOrder }

    const [machines, totalFiltered, dbCategoryNames, distinctOwners] = await Promise.all([
      Machine.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Machine.countDocuments(query),
      Category.find({}).distinct('name'),
      Machine.distinct('owner'),
    ])

    const distinctCategories = (dbCategoryNames || []).filter(Boolean)

    // Live Stats
    const [totalAll, activeCount, inactiveCount, pendingCount] = await Promise.all([
      Machine.countDocuments(),
      Machine.countDocuments({ status: 'Active' }),
      Machine.countDocuments({ status: 'Inactive' }),
      Machine.countDocuments({ status: 'Pending' }),
    ])

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1

    return successResponse(res, 'Machines retrieved successfully', {
      machines,
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
        pending: pendingCount,
      },
      categories: distinctCategories.filter(Boolean),
      owners: distinctOwners.filter(Boolean),
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 2. Get Single Machine by ID
export const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
    if (!machine) {
      return errorResponse(res, 'Machine not found', 404)
    }
    return successResponse(res, 'Machine details retrieved', machine)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 3. Create Machine
export const createMachine = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      category,
      machineType,
      owner,
      location,
      regNo,
      listingType,
      image,
      status,
      specifications,
    } = req.body

    if (!name || !regNo) {
      return errorResponse(res, 'Machine name and Registration Number are required', 400)
    }

    // Check duplicate regNo
    const existing = await Machine.findOne({ regNo: regNo.trim() })
    if (existing) {
      return errorResponse(res, 'A machine with this Registration Number already exists', 400)
    }

    const brandName = brand || name.split(' ')[0] || 'Equipment'
    const modelName = model || name.split(' ').slice(1).join(' ') || 'Standard'
    const subtitle = `${brandName} | ${modelName} | ${year || '2023'}`

    const machine = await Machine.create({
      name: name.trim(),
      brand: brandName,
      model: modelName,
      year: year || '2023',
      subtitle,
      category: category || 'Backhoe Loader',
      machineType: machineType || 'Construction',
      owner: owner || 'Rakesh Singh',
      location: location || 'Lucknow, UP',
      regNo: regNo.trim().toUpperCase(),
      listingType: listingType || 'Rent',
      image:
        image ||
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=80',
      status: status || 'Active',
      specifications: specifications || {},
      history: [
        {
          action: 'Machine registered into platform fleet',
          author: req.user?.name || 'Admin',
          createdAt: new Date(),
        },
      ],
    })

    if (machine.category) {
      await Category.findOneAndUpdate(
        { name: machine.category },
        { $inc: { machinesCount: 1 } }
      ).catch(() => {})
    }

    return successResponse(res, 'Machine created successfully', machine, 201)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 4. Update Machine
export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    const machine = await Machine.findById(id)
    if (!machine) {
      return errorResponse(res, 'Machine not found', 404)
    }

    // Check duplicate regNo if changed
    if (updateData.regNo && updateData.regNo.trim().toUpperCase() !== machine.regNo) {
      const conflict = await Machine.findOne({
        regNo: updateData.regNo.trim().toUpperCase(),
        _id: { $ne: id },
      })
      if (conflict) {
        return errorResponse(res, 'Another machine with this registration number exists', 400)
      }
      updateData.regNo = updateData.regNo.trim().toUpperCase()
    }

    // Recompute subtitle if brand, model or year updated
    const brandName = updateData.brand || machine.brand
    const modelName = updateData.model || machine.model
    const yearVal = updateData.year || machine.year
    updateData.subtitle = `${brandName} | ${modelName} | ${yearVal}`

    machine.history.push({
      action: 'Machine details updated',
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })
    await machine.save()

    const updated = await Machine.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    return successResponse(res, 'Machine updated successfully', updated)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 5. Toggle Machine Status (Active <-> Inactive / or specific)
export const toggleMachineStatus = async (req, res) => {
  try {
    const { id } = req.params
    const machine = await Machine.findById(id)
    if (!machine) {
      return errorResponse(res, 'Machine not found', 404)
    }

    const nextStatus =
      req.body?.status || (machine.status === 'Active' ? 'Inactive' : 'Active')
    const oldStatus = machine.status
    machine.status = nextStatus

    machine.history.push({
      action: `Status changed from "${oldStatus}" to "${nextStatus}"`,
      author: req.user?.name || 'Admin',
      createdAt: new Date(),
    })
    await machine.save()

    return successResponse(res, `Machine status updated to ${nextStatus}`, machine)
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 6. Delete Single Machine
export const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params
    const machine = await Machine.findByIdAndDelete(id)
    if (!machine) {
      return errorResponse(res, 'Machine not found', 404)
    }

    if (machine.category) {
      await Category.findOneAndUpdate(
        { name: machine.category, machinesCount: { $gt: 0 } },
        { $inc: { machinesCount: -1 } }
      ).catch(() => {})
    }

    return successResponse(res, 'Machine deleted successfully', { id })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 7. Bulk Status Update
export const bulkUpdateMachineStatus = async (req, res) => {
  try {
    const { ids, status } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide machine IDs array', 400)
    }

    const result = await Machine.updateMany(
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

    return successResponse(res, `Updated status for ${result.modifiedCount} machines`, {
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// 8. Bulk Delete Machines
export const bulkDeleteMachines = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide machine IDs array', 400)
    }

    const result = await Machine.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `Deleted ${result.deletedCount} machines`, {
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}
