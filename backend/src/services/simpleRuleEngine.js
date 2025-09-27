const { rules, symptomRelations } = require('../data/mockData')

class SimpleRuleEngine {
  evaluate(userProfile, symptoms, duration_days, vitals = {}, notes = '') {
    const facts = this.buildFacts(userProfile, symptoms, duration_days, vitals, notes)
    const rulesTrace = []
    const suggestions = []

    // First pass: Check for red-flag rules (emergency)
    const redFlagRules = rules.filter(rule => 
      rule.tags.includes('redflag') && rule.tags.includes('emergency')
    )

    for (const rule of redFlagRules) {
      const match = this.evaluateCondition(rule.condition, facts)
      if (match.matched) {
        const confidence = this.computeRuleConfidence(rule, match.matchedFacts, facts)
        
        rulesTrace.push({
          ruleId: rule.ruleId,
          name: rule.name,
          matchedFacts: match.matchedFacts,
          confidence: confidence
        })

        suggestions.push({
          type: rule.action.type,
          message: rule.action.message,
          confidence: confidence,
          rules_fired: [rule.ruleId]
        })

        // If it's an emergency, return immediately
        if (rule.action.type === 'emergency') {
          return {
            suggestions,
            rules_trace: rulesTrace,
            suggested_additional: this.getProbableSymptoms(symptoms)
          }
        }
      }
    }

    // Second pass: Evaluate other rules
    const otherRules = rules.filter(rule => 
      !rule.tags.includes('redflag') || !rule.tags.includes('emergency')
    )

    const ruleResults = []
    for (const rule of otherRules) {
      const match = this.evaluateCondition(rule.condition, facts)
      if (match.matched) {
        const confidence = this.computeRuleConfidence(rule, match.matchedFacts, facts)
        
        rulesTrace.push({
          ruleId: rule.ruleId,
          name: rule.name,
          matchedFacts: match.matchedFacts,
          confidence: confidence
        })

        ruleResults.push({
          rule: rule,
          confidence: confidence,
          matchedFacts: match.matchedFacts
        })
      }
    }

    // Group by action type and compute aggregate confidence
    const actionGroups = {}
    for (const result of ruleResults) {
      const actionType = result.rule.action.type
      if (!actionGroups[actionType]) {
        actionGroups[actionType] = {
          rules: [],
          maxConfidence: 0,
          totalWeight: 0,
          weightedConfidence: 0
        }
      }
      
      actionGroups[actionType].rules.push(result.rule)
      actionGroups[actionType].maxConfidence = Math.max(
        actionGroups[actionType].maxConfidence, 
        result.confidence
      )
      actionGroups[actionType].totalWeight += result.rule.weight
      actionGroups[actionType].weightedConfidence += result.confidence * result.rule.weight
    }

    // Convert to suggestions
    for (const [actionType, group] of Object.entries(actionGroups)) {
      const avgConfidence = group.totalWeight > 0 
        ? group.weightedConfidence / group.totalWeight 
        : group.maxConfidence

      suggestions.push({
        type: actionType,
        message: group.rules[0].action.message,
        confidence: avgConfidence,
        rules_fired: group.rules.map(r => r.ruleId)
      })
    }

    // Sort by confidence and priority
    suggestions.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence
      }
      const priorityOrder = { emergency: 4, see_gp: 3, teleconsult: 2, self_care: 1, suggest_testing: 0 }
      return (priorityOrder[b.type] || 0) - (priorityOrder[a.type] || 0)
    })

    return {
      suggestions: suggestions.slice(0, 3),
      rules_trace: rulesTrace,
      suggested_additional: this.getProbableSymptoms(symptoms)
    }
  }

  buildFacts(userProfile, symptoms, duration_days, vitals, notes) {
    const facts = {
      symptoms: {},
      duration_days,
      vitals,
      notes,
      age: userProfile.age,
      comorbidities: userProfile.comorbidities || []
    }

    symptoms.forEach(symptom => {
      facts.symptoms[symptom.id] = symptom.severity
    })

    return facts
  }

  evaluateCondition(condition, facts) {
    if (!condition) return { matched: false, matchedFacts: [] }

    if (condition.any) {
      return this.evaluateAny(condition.any, facts)
    } else if (condition.all) {
      return this.evaluateAll(condition.all, facts)
    } else if (condition.not) {
      const result = this.evaluateCondition(condition.not, facts)
      return { matched: !result.matched, matchedFacts: result.matchedFacts }
    } else {
      return this.evaluateClause(condition, facts)
    }
  }

  evaluateAny(conditions, facts) {
    for (const condition of conditions) {
      const result = this.evaluateCondition(condition, facts)
      if (result.matched) {
        return result
      }
    }
    return { matched: false, matchedFacts: [] }
  }

  evaluateAll(conditions, facts) {
    const allMatchedFacts = []
    for (const condition of conditions) {
      const result = this.evaluateCondition(condition, facts)
      if (!result.matched) {
        return { matched: false, matchedFacts: [] }
      }
      allMatchedFacts.push(...result.matchedFacts)
    }
    return { matched: true, matchedFacts: allMatchedFacts }
  }

  evaluateClause(clause, facts) {
    const { symptom, severity_gte, severity_lte, severity_eq, duration_days_gte, 
            metric, gte, lte, eq, comorbidity, age_gte, age_lte } = clause

    const matchedFacts = []

    // Symptom severity checks
    if (symptom && facts.symptoms[symptom] !== undefined) {
      const severity = facts.symptoms[symptom]
      
      if (severity_gte !== undefined && severity >= severity_gte) {
        matchedFacts.push(`${symptom}(${severity})`)
        return { matched: true, matchedFacts }
      }
      if (severity_lte !== undefined && severity <= severity_lte) {
        matchedFacts.push(`${symptom}(${severity})`)
        return { matched: true, matchedFacts }
      }
      if (severity_eq !== undefined && severity === severity_eq) {
        matchedFacts.push(`${symptom}(${severity})`)
        return { matched: true, matchedFacts }
      }
    }

    // Duration checks
    if (duration_days_gte !== undefined && facts.duration_days >= duration_days_gte) {
      matchedFacts.push(`duration_days(${facts.duration_days})`)
      return { matched: true, matchedFacts }
    }

    // Vital signs checks
    if (metric && facts.vitals[metric] !== undefined) {
      const value = facts.vitals[metric]
      
      if (gte !== undefined && value >= gte) {
        matchedFacts.push(`${metric}(${value})`)
        return { matched: true, matchedFacts }
      }
      if (lte !== undefined && value <= lte) {
        matchedFacts.push(`${metric}(${value})`)
        return { matched: true, matchedFacts }
      }
      if (eq !== undefined && value === eq) {
        matchedFacts.push(`${metric}(${value})`)
        return { matched: true, matchedFacts }
      }
    }

    // Comorbidity checks
    if (comorbidity && facts.comorbidities.includes(comorbidity)) {
      matchedFacts.push(comorbidity)
      return { matched: true, matchedFacts }
    }

    // Age checks
    if (age_gte !== undefined && facts.age >= age_gte) {
      matchedFacts.push(`age(${facts.age})`)
      return { matched: true, matchedFacts }
    }
    if (age_lte !== undefined && facts.age <= age_lte) {
      matchedFacts.push(`age(${facts.age})`)
      return { matched: true, matchedFacts }
    }

    return { matched: false, matchedFacts: [] }
  }

  computeRuleConfidence(rule, matchedFacts, facts) {
    let confidence = 1.0
    confidence *= rule.weight

    const totalConditions = this.countConditions(rule.condition)
    const matchedCount = matchedFacts.length
    confidence *= Math.min(1.0, matchedCount / Math.max(1, totalConditions))

    if (rule.tags.includes('redflag')) {
      confidence = Math.min(1.0, confidence * 1.2)
    }

    return Math.min(1.0, confidence)
  }

  countConditions(condition) {
    if (!condition) return 0
    
    if (condition.any || condition.all) {
      const conditions = condition.any || condition.all
      return conditions.reduce((sum, cond) => sum + this.countConditions(cond), 0)
    } else if (condition.not) {
      return this.countConditions(condition.not)
    } else {
      return 1
    }
  }

  getProbableSymptoms(symptoms) {
    if (!symptoms || symptoms.length === 0) return []

    const symptomIds = symptoms.map(s => s.id)
    const relations = symptomRelations.filter(rel => 
      symptomIds.includes(rel.source)
    )

    const candidateSymptoms = new Map()
    
    for (const relation of relations) {
      for (const target of relation.targets) {
        if (!symptomIds.includes(target.id)) {
          const currentProb = candidateSymptoms.get(target.id) || 0
          candidateSymptoms.set(target.id, 1 - (1 - currentProb) * (1 - target.probability))
        }
      }
    }

    return Array.from(candidateSymptoms.entries())
      .map(([id, probability]) => ({ id, probability }))
      .filter(item => item.probability > 0.3)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)
  }

  testRule(payload) {
    const { userProfile, symptoms, duration_days, vitals, notes } = payload
    return this.evaluate(userProfile, symptoms, duration_days, vitals, notes)
  }
}

module.exports = new SimpleRuleEngine()
