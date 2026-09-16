import express from 'express'
import {
  getLocationStats,
  getCountries,
  getStates,
  getCities,
  createCountry,
  createState,
  createCity,
  updateLocation,
  toggleLocationStatus,
  toggleStateStatus,
  deleteLocation,
  deleteState,
  importLocations,
} from '../controllers/locationController.js'

const router = express.Router()

// Statistics
router.get('/stats', getLocationStats)

// Retrieval
router.get('/countries', getCountries)
router.get('/states', getStates)
router.get('/cities', getCities)
router.get('/', getCountries)

// Creation
router.post('/country', createCountry)
router.post('/state', createState)
router.post('/city', createCity)
router.post('/import', importLocations)

// Updates & Toggles
router.put('/:id', updateLocation)
router.patch('/:id/status', toggleLocationStatus)
router.patch('/state/:stateName/status', toggleStateStatus)

// Deletions
router.delete('/:id', deleteLocation)
router.delete('/state/:stateName', deleteState)

export default router
