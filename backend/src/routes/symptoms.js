const express = require('express')
const { symptoms, symptomRelations } = require('../data/mockData')
const simpleRuleEngine = require('../services/simpleRuleEngine')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Get all symptoms
router.get('/', async (req, res) => {
  try {
    const { search, group } = req.query
    let filteredSymptoms = symptoms

    if (search) {
      filteredSymptoms = symptoms.filter(symptom =>
        symptom.label.toLowerCase().includes(search.toLowerCase()) ||
        symptom.synonyms?.some(synonym => 
          synonym.toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    if (group) {
      filteredSymptoms = filteredSymptoms.filter(symptom => symptom.group === group)
    }

    res.json(filteredSymptoms)
  } catch (error) {
    console.error('Error fetching symptoms:', error)
    res.status(500).json({ error: 'Failed to fetch symptoms' })
  }
})

// Get symptom by ID
router.get('/:id', async (req, res) => {
  try {
    const symptom = symptoms.find(s => s.id === req.params.id)

    if (!symptom) {
      return res.status(404).json({ error: 'Symptom not found' })
    }

    res.json(symptom)
  } catch (error) {
    console.error('Error fetching symptom:', error)
    res.status(500).json({ error: 'Failed to fetch symptom' })
  }
})

// Get probable symptoms based on current symptoms
router.post('/probable-symptoms', [
  body('symptoms').isArray({ min: 1 }),
  body('symptoms.*.id').isString().notEmpty(),
  body('symptoms.*.severity').isInt({ min: 1, max: 5 }),
  body('topN').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { symptoms: inputSymptoms, topN = 5 } = req.body

    const probableSymptoms = simpleRuleEngine.getProbableSymptoms(inputSymptoms)
    const limitedResults = probableSymptoms.slice(0, topN)

    res.json(limitedResults)
  } catch (error) {
    console.error('Error getting probable symptoms:', error)
    res.status(500).json({ error: 'Failed to get probable symptoms' })
  }
})

// Evaluate symptoms and get recommendations
router.post('/evaluate', [
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

    const result = simpleRuleEngine.evaluate(
      userProfile,
      symptoms,
      duration_days,
      vitals,
      notes
    )

    res.json(result)
  } catch (error) {
    console.error('Error evaluating symptoms:', error)
    res.status(500).json({ error: 'Failed to evaluate symptoms' })
  }
})

// Get symptom groups
router.get('/groups/list', async (req, res) => {
  try {
    const groups = [...new Set(symptoms.map(s => s.group))]
    res.json(groups)
  } catch (error) {
    console.error('Error fetching symptom groups:', error)
    res.status(500).json({ error: 'Failed to fetch symptom groups' })
  }
})

module.exports = router