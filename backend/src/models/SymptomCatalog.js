const mongoose = require('mongoose')

const symptomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  synonyms: [{
    type: String
  }],
  group: {
    type: String,
    enum: ['systemic', 'respiratory', 'cardiovascular', 'neurological', 'gastrointestinal', 'musculoskeletal', 'dermatological', 'other'],
    default: 'other'
  },
  defaultSeverityRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 5
    }
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for text search
symptomSchema.index({ 
  label: 'text', 
  synonyms: 'text',
  description: 'text' 
})

module.exports = mongoose.model('SymptomCatalog', symptomSchema)
