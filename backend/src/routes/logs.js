const express = require('express')
const { symptomLogs } = require('../data/mockData')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Simple middleware for prototype (no real auth)
const verifyToken = async (req, res, next) => {
  req.user = { id: 'demo-user' }
  next()
}

// Get user's symptom logs
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'desc' } = req.query
    
    const sortOrder = sort === 'asc' ? 1 : -1
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const userLogs = symptomLogs
      .sort((a, b) => sortOrder * (new Date(b.timestamp) - new Date(a.timestamp)))
      .slice(skip, skip + parseInt(limit))

    res.json({
      logs: userLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: symptomLogs.length,
        pages: Math.ceil(symptomLogs.length / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

// Get specific log by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const log = symptomLogs.find(l => l.id === req.params.id)

    if (!log) {
      return res.status(404).json({ error: 'Log not found' })
    }

    res.json(log)
  } catch (error) {
    console.error('Error fetching log:', error)
    res.status(500).json({ error: 'Failed to fetch log' })
  }
})

// Create new symptom log
router.post('/', verifyToken, [
  body('symptoms').isArray({ min: 1 }),
  body('symptoms.*.id').isString().notEmpty(),
  body('symptoms.*.severity').isInt({ min: 1, max: 5 }),
  body('duration_days').isInt({ min: 0 }),
  body('vitals').optional().isObject(),
  body('notes').optional().isString().isLength({ max: 1000 }),
  body('result').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      symptoms,
      duration_days,
      vitals = {},
      notes = '',
      result = {}
    } = req.body

    const log = {
      id: `log_${Date.now()}`,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      symptoms,
      duration_days,
      vitals,
      notes,
      result
    }

    symptomLogs.push(log)

    res.status(201).json({
      message: 'Log created successfully',
      log
    })
  } catch (error) {
    console.error('Error creating log:', error)
    res.status(500).json({ error: 'Failed to create log' })
  }
})

// Update log
router.put('/:id', verifyToken, [
  body('symptoms').optional().isArray({ min: 1 }),
  body('symptoms.*.id').isString().notEmpty(),
  body('symptoms.*.severity').isInt({ min: 1, max: 5 }),
  body('duration_days').optional().isInt({ min: 0 }),
  body('vitals').optional().isObject(),
  body('notes').optional().isString().isLength({ max: 1000 }),
  body('result').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const logIndex = symptomLogs.findIndex(l => l.id === req.params.id)

    if (logIndex === -1) {
      return res.status(404).json({ error: 'Log not found' })
    }

    const { symptoms, duration_days, vitals, notes, result } = req.body

    if (symptoms) symptomLogs[logIndex].symptoms = symptoms
    if (duration_days !== undefined) symptomLogs[logIndex].duration_days = duration_days
    if (vitals) symptomLogs[logIndex].vitals = vitals
    if (notes !== undefined) symptomLogs[logIndex].notes = notes
    if (result) symptomLogs[logIndex].result = result

    res.json({
      message: 'Log updated successfully',
      log: symptomLogs[logIndex]
    })
  } catch (error) {
    console.error('Error updating log:', error)
    res.status(500).json({ error: 'Failed to update log' })
  }
})

// Delete log
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const logIndex = symptomLogs.findIndex(l => l.id === req.params.id)

    if (logIndex === -1) {
      return res.status(404).json({ error: 'Log not found' })
    }

    symptomLogs.splice(logIndex, 1)

    res.json({ message: 'Log deleted successfully' })
  } catch (error) {
    console.error('Error deleting log:', error)
    res.status(500).json({ error: 'Failed to delete log' })
  }
})

module.exports = router