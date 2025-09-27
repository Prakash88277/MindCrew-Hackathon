const mongoose = require('mongoose')
require('dotenv').config()

const SymptomCatalog = require('../models/SymptomCatalog')
const Rule = require('../models/Rule')
const SymptomRelations = require('../models/SymptomRelations')

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB Connected for seeding')
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1)
  }
}

// Sample symptoms data
const symptomsData = [
  // Systemic symptoms
  { id: 'fever', label: 'Fever', synonyms: ['high temperature', 'pyrexia', 'elevated temperature'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'chills', label: 'Chills', synonyms: ['shivering', 'rigors'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'fatigue', label: 'Fatigue', synonyms: ['tiredness', 'exhaustion', 'weakness'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'malaise', label: 'Malaise', synonyms: ['general discomfort', 'feeling unwell'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'night_sweats', label: 'Night Sweats', synonyms: ['nocturnal sweating'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },

  // Respiratory symptoms
  { id: 'cough', label: 'Cough', synonyms: ['hacking', 'coughing'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'sore_throat', label: 'Sore Throat', synonyms: ['throat pain', 'pharyngitis'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'shortness_of_breath', label: 'Shortness of Breath', synonyms: ['dyspnea', 'breathing difficulty'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'chest_pain', label: 'Chest Pain', synonyms: ['chest discomfort', 'thoracic pain'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'chest_pressure', label: 'Chest Pressure', synonyms: ['chest tightness', 'chest heaviness'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'runny_nose', label: 'Runny Nose', synonyms: ['rhinorrhea', 'nasal discharge'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'congestion', label: 'Nasal Congestion', synonyms: ['stuffy nose', 'blocked nose'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'sneezing', label: 'Sneezing', synonyms: ['sneezes'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },

  // Neurological symptoms
  { id: 'headache', label: 'Headache', synonyms: ['head pain', 'cephalgia'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'dizziness', label: 'Dizziness', synonyms: ['vertigo', 'lightheadedness'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'confusion', label: 'Confusion', synonyms: ['mental confusion', 'disorientation'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'loss_of_smell', label: 'Loss of Smell', synonyms: ['anosmia', 'smell loss'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'loss_of_taste', label: 'Loss of Taste', synonyms: ['ageusia', 'taste loss'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },

  // Gastrointestinal symptoms
  { id: 'nausea', label: 'Nausea', synonyms: ['feeling sick', 'queasiness'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'vomiting', label: 'Vomiting', synonyms: ['throwing up', 'emesis'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'diarrhea', label: 'Diarrhea', synonyms: ['loose stools', 'watery bowel movements'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'abdominal_pain', label: 'Abdominal Pain', synonyms: ['stomach pain', 'belly ache'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'loss_of_appetite', label: 'Loss of Appetite', synonyms: ['no appetite', 'anorexia'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },

  // Musculoskeletal symptoms
  { id: 'muscle_aches', label: 'Muscle Aches', synonyms: ['myalgia', 'muscle pain'], group: 'musculoskeletal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'joint_pain', label: 'Joint Pain', synonyms: ['arthralgia', 'joint aches'], group: 'musculoskeletal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'back_pain', label: 'Back Pain', synonyms: ['spinal pain', 'dorsalgia'], group: 'musculoskeletal', defaultSeverityRange: { min: 0, max: 5 } },

  // Dermatological symptoms
  { id: 'rash', label: 'Rash', synonyms: ['skin rash', 'eruption'], group: 'dermatological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'itching', label: 'Itching', synonyms: ['pruritus', 'itchy skin'], group: 'dermatological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'skin_redness', label: 'Skin Redness', synonyms: ['erythema', 'red skin'], group: 'dermatological', defaultSeverityRange: { min: 0, max: 5 } }
]

// Sample rules data
const rulesData = [
  {
    ruleId: 'r_redflag_chest',
    name: 'Chest pain red-flag',
    priority: 100,
    tags: ['redflag', 'emergency'],
    condition: {
      any: [
        { symptom: 'chest_pain', severity_gte: 3 },
        { symptom: 'chest_pressure', severity_gte: 3 }
      ]
    },
    action: {
      type: 'emergency',
      message: 'Call emergency services immediately. Chest pain of this severity requires immediate medical attention.'
    },
    explain_template: 'Chest pain or pressure of this severity is a red flag; seek emergency care.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_redflag_breath',
    name: 'Severe shortness of breath',
    priority: 100,
    tags: ['redflag', 'emergency'],
    condition: {
      symptom: 'shortness_of_breath',
      severity_gte: 4
    },
    action: {
      type: 'emergency',
      message: 'Call emergency services immediately. Severe breathing difficulty requires immediate medical attention.'
    },
    explain_template: 'Severe shortness of breath is a red flag; seek emergency care.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_redflag_breathing_vitals',
    name: 'Low oxygen saturation',
    priority: 100,
    tags: ['redflag', 'emergency', 'vital'],
    condition: {
      metric: 'spO2',
      lte: 90
    },
    action: {
      type: 'emergency',
      message: 'Call emergency services immediately. Low oxygen saturation indicates a medical emergency.'
    },
    explain_template: 'Oxygen saturation below 90% is dangerously low; seek emergency care.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_high_fever',
    name: 'High persistent fever',
    priority: 60,
    tags: ['severity', 'duration'],
    condition: {
      all: [
        { symptom: 'fever', severity_gte: 3 },
        { duration_days_gte: 2 }
      ]
    },
    action: {
      type: 'see_gp',
      message: 'Fever lasting more than 2 days with high severity - consult a doctor within 24-48 hours.'
    },
    explain_template: 'Fever of {symptom_severity} for {duration_days} days triggers recommendation to see a doctor.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_mild_cold',
    name: 'Mild upper respiratory',
    priority: 10,
    tags: ['severity'],
    condition: {
      all: [
        { symptom: 'cough', severity_lte: 2 },
        { symptom: 'sore_throat', severity_lte: 2 },
        { symptom: 'fever', severity_lte: 1 }
      ]
    },
    action: {
      type: 'self_care',
      message: 'Rest, drink plenty of fluids, and use over-the-counter symptomatic treatment. Monitor for worsening symptoms.'
    },
    explain_template: 'Symptoms suggest mild upper respiratory illness; self-care recommended.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_diabetes_escalate',
    name: 'Comorbidity - diabetes escalator',
    priority: 70,
    tags: ['comorbidity'],
    condition: {
      all: [
        { symptom: 'fever', severity_gte: 2 },
        { comorbidity: 'diabetes' }
      ]
    },
    action: {
      type: 'see_gp',
      message: 'Because of your diabetes, please contact your doctor within 24 hours. Diabetes increases the risk of complications with fever.'
    },
    explain_template: 'Presence of diabetes raises risk with fever; see a doctor.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_heart_disease_escalate',
    name: 'Comorbidity - heart disease escalator',
    priority: 70,
    tags: ['comorbidity'],
    condition: {
      all: [
        { symptom: 'chest_pain', severity_gte: 2 },
        { comorbidity: 'heart_disease' }
      ]
    },
    action: {
      type: 'see_gp',
      message: 'Because of your heart condition, please contact your doctor immediately or go to the emergency room.'
    },
    explain_template: 'Heart disease with chest pain requires immediate medical attention.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_elderly_fever',
    name: 'Elderly fever escalation',
    priority: 50,
    tags: ['age'],
    condition: {
      all: [
        { symptom: 'fever', severity_gte: 2 },
        { age_gte: 65 }
      ]
    },
    action: {
      type: 'see_gp',
      message: 'Fever in elderly individuals requires prompt medical attention. Contact your doctor within 24 hours.'
    },
    explain_template: 'Fever in people over 65 requires medical evaluation.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_flu_like_symptoms',
    name: 'Flu-like symptoms',
    priority: 30,
    tags: ['severity'],
    condition: {
      all: [
        { symptom: 'fever', severity_gte: 2 },
        { symptom: 'cough', severity_gte: 2 },
        { symptom: 'muscle_aches', severity_gte: 2 }
      ]
    },
    action: {
      type: 'teleconsult',
      message: 'Consider a teleconsultation with a healthcare provider. These symptoms may indicate influenza or similar viral illness.'
    },
    explain_template: 'Flu-like symptoms suggest viral illness; teleconsultation recommended.',
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_covid_symptoms',
    name: 'COVID-19 symptoms',
    priority: 40,
    tags: ['severity'],
    condition: {
      all: [
        { symptom: 'fever', severity_gte: 2 },
        { symptom: 'cough', severity_gte: 2 },
        { symptom: 'loss_of_smell', severity_gte: 1 }
      ]
    },
    action: {
      type: 'suggest_testing',
      message: 'Consider COVID-19 testing. These symptoms are commonly associated with COVID-19. Self-isolate and contact your healthcare provider.'
    },
    explain_template: 'Symptoms suggest possible COVID-19; testing recommended.',
    weight: 1.0,
    active: true
  }
]

// Sample symptom relations data
const relationsData = [
  {
    source: 'cough',
    targets: [
      { id: 'fever', probability: 0.45 },
      { id: 'sore_throat', probability: 0.6 },
      { id: 'fatigue', probability: 0.3 }
    ]
  },
  {
    source: 'fever',
    targets: [
      { id: 'chills', probability: 0.7 },
      { id: 'headache', probability: 0.5 },
      { id: 'muscle_aches', probability: 0.4 },
      { id: 'fatigue', probability: 0.6 }
    ]
  },
  {
    source: 'sore_throat',
    targets: [
      { id: 'cough', probability: 0.5 },
      { id: 'fever', probability: 0.3 },
      { id: 'headache', probability: 0.4 }
    ]
  },
  {
    source: 'headache',
    targets: [
      { id: 'fever', probability: 0.4 },
      { id: 'nausea', probability: 0.3 },
      { id: 'fatigue', probability: 0.5 }
    ]
  },
  {
    source: 'nausea',
    targets: [
      { id: 'vomiting', probability: 0.6 },
      { id: 'loss_of_appetite', probability: 0.7 },
      { id: 'fatigue', probability: 0.4 }
    ]
  },
  {
    source: 'shortness_of_breath',
    targets: [
      { id: 'chest_pain', probability: 0.4 },
      { id: 'fatigue', probability: 0.5 },
      { id: 'cough', probability: 0.3 }
    ]
  },
  {
    source: 'chest_pain',
    targets: [
      { id: 'shortness_of_breath', probability: 0.5 },
      { id: 'fatigue', probability: 0.3 },
      { id: 'nausea', probability: 0.2 }
    ]
  },
  {
    source: 'diarrhea',
    targets: [
      { id: 'abdominal_pain', probability: 0.6 },
      { id: 'nausea', probability: 0.4 },
      { id: 'fatigue', probability: 0.5 }
    ]
  },
  {
    source: 'rash',
    targets: [
      { id: 'itching', probability: 0.8 },
      { id: 'fever', probability: 0.3 },
      { id: 'fatigue', probability: 0.2 }
    ]
  },
  {
    source: 'loss_of_smell',
    targets: [
      { id: 'loss_of_taste', probability: 0.7 },
      { id: 'fever', probability: 0.4 },
      { id: 'cough', probability: 0.3 }
    ]
  }
]

const seedDatabase = async () => {
  try {
    await connectDB()

    // Clear existing data
    await SymptomCatalog.deleteMany({})
    await Rule.deleteMany({})
    await SymptomRelations.deleteMany({})

    console.log('Cleared existing data')

    // Insert symptoms
    await SymptomCatalog.insertMany(symptomsData)
    console.log(`Inserted ${symptomsData.length} symptoms`)

    // Insert rules
    await Rule.insertMany(rulesData)
    console.log(`Inserted ${rulesData.length} rules`)

    // Insert symptom relations
    await SymptomRelations.insertMany(relationsData)
    console.log(`Inserted ${relationsData.length} symptom relations`)

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
