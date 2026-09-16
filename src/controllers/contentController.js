import { Content } from '../models/Content.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// 1. Get KPI Stats
export const getContentStats = async (req, res) => {
  try {
    const total = await Content.countDocuments()
    const published = await Content.countDocuments({ status: 'Published' })
    const drafts = await Content.countDocuments({ status: 'Draft' })
    const underReview = await Content.countDocuments({ status: 'Under Review' })

    return successResponse(res, 'Content statistics retrieved', {
      total,
      published,
      drafts,
      underReview,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch content statistics', 500, err.message)
  }
}

// 2. Get CMS Pages with search, filter, and pagination
export const getPages = async (req, res) => {
  try {
    const { search = '', pageType = 'All', status = 'All', sortBy = 'Recently Updated', page = 1, limit = 50 } = req.query

    const query = {}

    if (pageType !== 'All') {
      query.pageType = pageType
    }

    if (status !== 'All') {
      query.status = status
    }

    if (search.trim()) {
      const q = search.trim()
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subtitle: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { authorName: { $regex: q, $options: 'i' } },
      ]
    }

    let sortOptions = { updatedAt: -1 }
    if (sortBy === 'Title (A - Z)') sortOptions = { title: 1 }
    else if (sortBy === 'Title (Z - A)') sortOptions = { title: -1 }
    else if (sortBy === 'Most Viewed') sortOptions = { viewsCount: -1 }

    const total = await Content.countDocuments(query)
    const items = await Content.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    const pages = items.map((p) => {
      const d = new Date(p.updatedAt || p.createdAt)
      return {
        id: p._id,
        _id: p._id,
        title: p.title,
        subtitle: p.subtitle,
        slug: p.slug,
        pageType: p.pageType,
        status: p.status,
        content: p.content,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        authorName: p.authorName,
        authorAvatar: p.authorAvatar,
        viewsCount: p.viewsCount || 0,
        updatedDate: isNaN(d.getTime())
          ? 'Today'
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        updatedTime: isNaN(d.getTime())
          ? '12:00 PM'
          : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }
    })

    return successResponse(res, 'CMS pages retrieved', {
      pages,
      total,
      page: Number(page),
      pagesCount: Math.ceil(total / Number(limit)) || 1,
    })
  } catch (err) {
    return errorResponse(res, 'Failed to fetch CMS pages', 500, err.message)
  }
}

// 3. Create CMS Page
export const createPage = async (req, res) => {
  try {
    const { title, subtitle, slug, pageType = 'Static', status = 'Draft', content = '' } = req.body
    if (!title || !slug) {
      return errorResponse(res, 'Title and slug are required', 400)
    }

    const cleanSlug = slug.startsWith('/') ? slug.toLowerCase().trim() : `/${slug.toLowerCase().trim()}`
    const existing = await Content.findOne({ slug: cleanSlug })
    if (existing) {
      return errorResponse(res, `Page with slug "${cleanSlug}" already exists`, 400)
    }

    const page = await Content.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      slug: cleanSlug,
      pageType,
      status,
      content,
      authorName: req.user?.name || 'Admin',
    })

    return successResponse(res, `Page "${page.title}" created successfully`, page, 201)
  } catch (err) {
    return errorResponse(res, 'Failed to create page', 500, err.message)
  }
}

// 4. Update CMS Page
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params
    const { title, subtitle, slug, pageType, status, content, metaTitle, metaDescription } = req.body

    const page = await Content.findById(id)
    if (!page) return errorResponse(res, 'Page not found', 404)

    if (title !== undefined) page.title = title.trim()
    if (subtitle !== undefined) page.subtitle = subtitle.trim()
    if (slug !== undefined) {
      const cleanSlug = slug.startsWith('/') ? slug.toLowerCase().trim() : `/${slug.toLowerCase().trim()}`
      if (cleanSlug !== page.slug) {
        const existing = await Content.findOne({ slug: cleanSlug, _id: { $ne: id } })
        if (existing) {
          return errorResponse(res, `Slug "${cleanSlug}" already in use`, 400)
        }
        page.slug = cleanSlug
      }
    }
    if (pageType !== undefined) page.pageType = pageType
    if (status !== undefined) page.status = status
    if (content !== undefined) page.content = content
    if (metaTitle !== undefined) page.metaTitle = metaTitle
    if (metaDescription !== undefined) page.metaDescription = metaDescription

    await page.save()
    return successResponse(res, `Page "${page.title}" updated successfully`, page)
  } catch (err) {
    return errorResponse(res, 'Failed to update page', 500, err.message)
  }
}

// 5. Toggle Page Status (Published <-> Draft)
export const togglePageStatus = async (req, res) => {
  try {
    const { id } = req.params
    const page = await Content.findById(id)
    if (!page) return errorResponse(res, 'Page not found', 404)

    page.status = page.status === 'Published' ? 'Draft' : 'Published'
    await page.save()

    return successResponse(res, `Page "${page.title}" status changed to ${page.status}`, page)
  } catch (err) {
    return errorResponse(res, 'Failed to toggle page status', 500, err.message)
  }
}

// 6. Delete CMS Page
export const deletePage = async (req, res) => {
  try {
    const { id } = req.params
    const page = await Content.findByIdAndDelete(id)
    if (!page) return errorResponse(res, 'Page not found', 404)

    return successResponse(res, `Page "${page.title}" deleted successfully`)
  } catch (err) {
    return errorResponse(res, 'Failed to delete page', 500, err.message)
  }
}

// 7. Bulk Update Status
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids = [], status } = req.body
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return errorResponse(res, 'Page IDs and status required', 400)
    }

    const result = await Content.updateMany({ _id: { $in: ids } }, { $set: { status } })
    return successResponse(res, `${result.modifiedCount} pages marked as ${status}`)
  } catch (err) {
    return errorResponse(res, 'Failed bulk status update', 500, err.message)
  }
}

// 8. Bulk Delete
export const bulkDelete = async (req, res) => {
  try {
    const { ids = [] } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Page IDs required', 400)
    }

    const result = await Content.deleteMany({ _id: { $in: ids } })
    return successResponse(res, `${result.deletedCount} pages deleted permanently`)
  } catch (err) {
    return errorResponse(res, 'Failed bulk delete', 500, err.message)
  }
}
