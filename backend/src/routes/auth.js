const express = require('express')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Simple mock user for prototype
const mockUser = {
  id: 'demo-user',
  email: 'demo@example.com',
  name: 'Demo User',
  age: 30,
  comorbidities: []
}

// Simple middleware for prototype (no real auth)
const verifyToken = async (req, res, next) => {
  // For prototype, just set a mock user
  req.user = mockUser
  next()
}

// Mock signup endpoint
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    res.status(201).json({
      message: 'User created successfully (prototype)',
      user: mockUser
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(400).json({ error: error.message })
  }
})

// Mock login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    res.json({
      message: 'Login successful (prototype)',
      user: mockUser
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ error: error.message })
  }
})

// Mock profile endpoint
router.get('/profile', verifyToken, async (req, res) => {
  try {
    res.json({
      user: mockUser
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Mock profile update
router.put('/profile', verifyToken, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('dob').optional().isISO8601(),
  body('comorbidities').optional().isArray(),
  body('consentAccepted').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    res.json({
      message: 'Profile updated successfully (prototype)',
      user: mockUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router