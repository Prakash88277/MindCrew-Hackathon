const ruleEngine = require('../services/ruleEngine')

describe('Rule Engine', () => {
  const mockUserProfile = {
    id: 'test-user',
    age: 30,
    comorbidities: []
  }

  const mockSymptoms = [
    { id: 'cough', severity: 2 },
    { id: 'fever', severity: 3 }
  ]

  const mockVitals = {
    temp_c: 38.5,
    spO2: 98,
    heart_rate: 85
  }

  beforeEach(async () => {
    // Reload rules before each test
    await ruleEngine.loadRules()
  })

  describe('evaluate', () => {
    it('should return emergency suggestion for severe chest pain', async () => {
      const symptoms = [{ id: 'chest_pain', severity: 4 }]
      const result = await ruleEngine.evaluate(
        mockUserProfile,
        symptoms,
        1,
        mockVitals,
        'Severe chest pain'
      )

      expect(result.suggestions).toBeDefined()
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0].type).toBe('emergency')
      expect(result.rules_trace).toBeDefined()
    })

    it('should return self-care suggestion for mild symptoms', async () => {
      const symptoms = [
        { id: 'cough', severity: 1 },
        { id: 'sore_throat', severity: 1 }
      ]
      const result = await ruleEngine.evaluate(
        mockUserProfile,
        symptoms,
        1,
        { temp_c: 36.5 },
        'Mild cold'
      )

      expect(result.suggestions).toBeDefined()
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0].type).toBe('self_care')
    })

    it('should escalate for diabetes comorbidity', async () => {
      const userProfile = {
        ...mockUserProfile,
        comorbidities: ['diabetes']
      }
      const symptoms = [{ id: 'fever', severity: 3 }]
      
      const result = await ruleEngine.evaluate(
        userProfile,
        symptoms,
        1,
        mockVitals,
        'Fever with diabetes'
      )

      expect(result.suggestions).toBeDefined()
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0].type).toBe('see_gp')
    })

    it('should return probable symptoms', async () => {
      const symptoms = [{ id: 'cough', severity: 2 }]
      const result = await ruleEngine.evaluate(
        mockUserProfile,
        symptoms,
        1,
        mockVitals,
        'Cough'
      )

      expect(result.suggested_additional).toBeDefined()
      expect(Array.isArray(result.suggested_additional)).toBe(true)
    })
  })

  describe('evaluateCondition', () => {
    it('should match simple symptom condition', () => {
      const condition = { symptom: 'fever', severity_gte: 3 }
      const facts = {
        symptoms: { fever: 3 },
        duration_days: 1,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('fever(3)')
    })

    it('should match duration condition', () => {
      const condition = { duration_days_gte: 2 }
      const facts = {
        symptoms: {},
        duration_days: 3,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('duration_days(3)')
    })

    it('should match vital signs condition', () => {
      const condition = { metric: 'spO2', lte: 90 }
      const facts = {
        symptoms: {},
        duration_days: 1,
        vitals: { spO2: 88 },
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('spO2(88)')
    })

    it('should match comorbidity condition', () => {
      const condition = { comorbidity: 'diabetes' }
      const facts = {
        symptoms: {},
        duration_days: 1,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: ['diabetes']
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('diabetes')
    })

    it('should match age condition', () => {
      const condition = { age_gte: 65 }
      const facts = {
        symptoms: {},
        duration_days: 1,
        vitals: {},
        notes: '',
        age: 70,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('age(70)')
    })

    it('should match any condition', () => {
      const condition = {
        any: [
          { symptom: 'fever', severity_gte: 3 },
          { symptom: 'cough', severity_gte: 2 }
        ]
      }
      const facts = {
        symptoms: { cough: 2 },
        duration_days: 1,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('cough(2)')
    })

    it('should match all condition', () => {
      const condition = {
        all: [
          { symptom: 'fever', severity_gte: 2 },
          { duration_days_gte: 2 }
        ]
      }
      const facts = {
        symptoms: { fever: 3 },
        duration_days: 3,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(true)
      expect(result.matchedFacts).toContain('fever(3)')
      expect(result.matchedFacts).toContain('duration_days(3)')
    })

    it('should not match when condition not met', () => {
      const condition = { symptom: 'fever', severity_gte: 3 }
      const facts = {
        symptoms: { fever: 2 },
        duration_days: 1,
        vitals: {},
        notes: '',
        age: 30,
        comorbidities: []
      }

      const result = ruleEngine.evaluateCondition(condition, facts)
      expect(result.matched).toBe(false)
      expect(result.matchedFacts).toEqual([])
    })
  })

  describe('getProbableSymptoms', () => {
    it('should return probable symptoms for given symptoms', async () => {
      const symptoms = [{ id: 'cough', severity: 2 }]
      const result = await ruleEngine.getProbableSymptoms(symptoms)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('probability')
    })

    it('should return empty array for no symptoms', async () => {
      const result = await ruleEngine.getProbableSymptoms([])
      expect(result).toEqual([])
    })
  })
})
