const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const symptomRoutes = require('./routes/symptoms')
const logRoutes = require('./routes/logs')
const ruleRoutes = require('./routes/rules')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Symptom Logger API is running',
    status: 'OK',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      symptoms: '/api/symptoms',
      logs: '/api/symptom_logs',
      rules: '/api/rules',
      auth: '/api/auth'
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Symptom Logger API is running (Prototype Mode)'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/symptoms', symptomRoutes)
app.use('/api/symptom_logs', logRoutes)
app.use('/api/rules', ruleRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}`)
  console.log(`💊 Health Check: http://localhost:${PORT}/health`)
  console.log(`📝 Prototype Mode: No database required!`)
})