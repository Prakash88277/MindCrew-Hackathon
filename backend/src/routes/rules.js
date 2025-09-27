const express = require('express')
const { rules } = require('../data/mockData')
const simpleRuleEngine = require('../services/simpleRuleEngine')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Simple middleware for prototype (no real auth)
const verifyAdmin = async (req, res, next) => {
  req.user = { id: 'demo-user' }
  next()
}

// Get all rules
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { active, tags, priority_min, priority_max } = req.query
    
    let filteredRules = rules
    
    if (active !== undefined) {
      filteredRules = filteredRules.filter(rule => rule.active === (active === 'true'))
    }
    
    if (tags) {
      const tagList = tags.split(',')
      filteredRules = filteredRules.filter(rule => 
        tagList.some(tag => rule.tags.includes(tag))
      )
    }
    
    if (priority_min !== undefined || priority_max !== undefined) {
      filteredRules = filteredRules.filter(rule => {
        if (priority_min !== undefined && rule.priority < parseInt(priority_min)) return false
        if (priority_max !== undefined && rule.priority > parseInt(priority_max)) return false
        return true
      })
    }

    res.json(filteredRules)
  } catch (error) {
    console.error('Error fetching rules:', error)
    res.status(500).json({ error: 'Failed to fetch rules' })
  }
})

// Get rule by ID
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const rule = rules.find(r => r.ruleId === req.params.id)
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' })
    }

    res.json(rule)
  } catch (error) {
    console.error('Error fetching rule:', error)
    res.status(500).json({ error: 'Failed to fetch rule' })
  }
})

// Test rule engine with sample payload
router.post('/test', verifyAdmin, [
  body('userProfile').isObject(),
  body('userProfile.id').isString().notEmpty(),
  body('userProfile.age').isInt({ min: 0, max: 150 }),
  body('userProfile.comorbidities').optional().isArray(),
  body('symptoms').isArray({ min: 1 }),
  body('symptoms.*.id').isString().notEmpty(),
  body('symptoms.*.severity').isInt({ min: 1, max: 5 }),
  body('duration_days').isInt({ min: 0 }),
  body('vitals').optional().isObject(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { userProfile, symptoms, duration_days, vitals = {}, notes = '' } = req.body

    const result = simpleRuleEngine.testRule({
      userProfile,
      symptoms,
      duration_days,
      vitals,
      notes
    })

    res.json(result)
  } catch (error) {
    console.error('Error testing rules:', error)
    res.status(500).json({ error: 'Failed to test rules' })
  }
})

// Get rule statistics
router.get('/stats/summary', verifyAdmin, async (req, res) => {
  try {
    const totalRules = rules.length
    const activeRules = rules.filter(r => r.active).length
    const redFlagRules = rules.filter(r => r.tags.includes('redflag')).length
    
    const rulesByType = {}
    rules.forEach(rule => {
      rule.tags.forEach(tag => {
        rulesByType[tag] = (rulesByType[tag] || 0) + 1
      })
    })

    const rulesByPriority = {
      '0-25': rules.filter(r => r.priority >= 0 && r.priority <= 25).length,
      '26-50': rules.filter(r => r.priority >= 26 && r.priority <= 50).length,
      '51-75': rules.filter(r => r.priority >= 51 && r.priority <= 75).length,
      '76-100': rules.filter(r => r.priority >= 76 && r.priority <= 100).length
    }

    res.json({
      totalRules,
      activeRules,
      redFlagRules,
      rulesByType,
      rulesByPriority
    })
  } catch (error) {
    console.error('Error fetching rule stats:', error)
    res.status(500).json({ error: 'Failed to fetch rule statistics' })
  }
})

module.exports = router