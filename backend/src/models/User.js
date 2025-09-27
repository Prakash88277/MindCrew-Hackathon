const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: Date
  },
  comorbidities: [{
    type: String,
    enum: ['diabetes', 'heart_disease', 'hypertension', 'immunocompromised', 'pregnant']
  }],
  isAdmin: {
    type: Boolean,
    default: false
  },
  consentAccepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Calculate age from DOB
userSchema.virtual('age').get(function() {
  if (!this.dob) return null
  const today = new Date()
  const birthDate = new Date(this.dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
})

module.exports = mongoose.model('User', userSchema)
