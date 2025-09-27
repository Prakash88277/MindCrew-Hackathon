// Mock data for prototype - no database needed

const symptoms = [
  { id: 'fever', label: 'Fever', synonyms: ['high temperature', 'pyrexia'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'cough', label: 'Cough', synonyms: ['hacking', 'coughing'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'sore_throat', label: 'Sore Throat', synonyms: ['throat pain', 'pharyngitis'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'headache', label: 'Headache', synonyms: ['head pain', 'cephalgia'], group: 'neurological', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'chest_pain', label: 'Chest Pain', synonyms: ['chest discomfort', 'thoracic pain'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'shortness_of_breath', label: 'Shortness of Breath', synonyms: ['dyspnea', 'breathing difficulty'], group: 'respiratory', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'nausea', label: 'Nausea', synonyms: ['feeling sick', 'queasiness'], group: 'gastrointestinal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'fatigue', label: 'Fatigue', synonyms: ['tiredness', 'exhaustion', 'weakness'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'muscle_aches', label: 'Muscle Aches', synonyms: ['myalgia', 'muscle pain'], group: 'musculoskeletal', defaultSeverityRange: { min: 0, max: 5 } },
  { id: 'chills', label: 'Chills', synonyms: ['shivering', 'rigors'], group: 'systemic', defaultSeverityRange: { min: 0, max: 5 } }
]

const rules = [
  {
    ruleId: 'r_redflag_chest',
    name: 'Chest pain red-flag',
    priority: 100,
    tags: ['redflag', 'emergency'],
    condition: { symptom: 'chest_pain', severity_gte: 3 },
    action: { type: 'emergency', message: 'Call emergency services immediately. Chest pain of this severity requires immediate medical attention.' },
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_redflag_breath',
    name: 'Severe shortness of breath',
    priority: 100,
    tags: ['redflag', 'emergency'],
    condition: { symptom: 'shortness_of_breath', severity_gte: 4 },
    action: { type: 'emergency', message: 'Call emergency services immediately. Severe breathing difficulty requires immediate medical attention.' },
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_high_fever',
    name: 'High persistent fever',
    priority: 60,
    tags: ['severity', 'duration'],
    condition: { all: [{ symptom: 'fever', severity_gte: 3 }, { duration_days_gte: 2 }] },
    action: { type: 'see_gp', message: 'Fever lasting more than 2 days with high severity - consult a doctor within 24-48 hours.' },
    weight: 1.0,
    active: true
  },
  {
    ruleId: 'r_mild_cold',
    name: 'Mild upper respiratory',
    priority: 10,
    tags: ['severity'],
    condition: { all: [{ symptom: 'cough', severity_lte: 2 }, { symptom: 'sore_throat', severity_lte: 2 }, { symptom: 'fever', severity_lte: 1 }] },
    action: { type: 'self_care', message: 'Rest, drink plenty of fluids, and use over-the-counter symptomatic treatment. Monitor for worsening symptoms.' },
    weight: 1.0,
    active: true
  }
]

const symptomRelations = [
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
  }
]

// In-memory storage
let symptomLogs = []

module.exports = {
  symptoms,
  rules,
  symptomRelations,
  symptomLogs
}
