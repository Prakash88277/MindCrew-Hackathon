const mongoose = require('mongoose')

const symptomRelationSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  targets: [{
    id: {
      type: String,
      required: true
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for efficient lookups
symptomRelationSchema.index({ source: 1, isActive: 1 })

module.exports = mongoose.model('SymptomRelations', symptomRelationSchema)
