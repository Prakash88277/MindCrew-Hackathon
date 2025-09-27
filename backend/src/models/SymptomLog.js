const mongoose = require('mongoose')

const symptomLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  symptoms: [{
    id: {
      type: String,
      required: true
    },
    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    duration: {
      type: Number,
      default: 1
    }
  }],
  duration_days: {
    type: Number,
    required: true,
    min: 0
  },
  vitals: {
    temp_c: {
      type: Number,
      min: 30,
      max: 45
    },
    spO2: {
      type: Number,
      min: 70,
      max: 100
    },
    heart_rate: {
      type: Number,
      min: 30,
      max: 200
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  suggested_additional: [{
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
  result: {
    suggestions: [{
      type: {
        type: String,
        enum: ['self_care', 'see_gp', 'teleconsult', 'emergency', 'suggest_testing'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      rules_fired: [{
        type: String
      }]
    }],
    rules_trace: [{
      ruleId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      matchedFacts: [{
        type: String
      }],
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }]
  }
}, {
  timestamps: true
})

// Index for user queries
symptomLogSchema.index({ userId: 1, timestamp: -1 })

module.exports = mongoose.model('SymptomLog', symptomLogSchema)
