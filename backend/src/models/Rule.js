const mongoose = require('mongoose')

const ruleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    enum: ['redflag', 'emergency', 'comorbidity', 'duration', 'severity', 'vital', 'age']
  }],
  condition: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  action: {
    type: {
      type: String,
      enum: ['self_care', 'see_gp', 'teleconsult', 'emergency', 'suggest_testing'],
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  explain_template: {
    type: String
  },
  weight: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 2.0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for rule evaluation
ruleSchema.index({ active: 1, priority: -1, tags: 1 })

module.exports = mongoose.model('Rule', ruleSchema)
