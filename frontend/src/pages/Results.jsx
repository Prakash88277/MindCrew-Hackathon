import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Phone, 
  Download, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedRules, setExpandedRules] = useState(new Set())
  const [evaluation, setEvaluation] = useState(null)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (location.state?.evaluation) {
      setEvaluation(location.state.evaluation)
      setFormData(location.state.formData)
    } else {
      // If no evaluation data, redirect back to log symptoms
      navigate('/log-symptoms')
    }
  }, [location.state, navigate])

  const toggleRuleExpansion = (ruleId) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-6 w-6 text-danger-500" />
      case 'see_gp':
        return <Clock className="h-6 w-6 text-warning-500" />
      case 'self_care':
        return <CheckCircle className="h-6 w-6 text-success-500" />
      case 'teleconsult':
        return <Phone className="h-6 w-6 text-primary-500" />
      default:
        return <Info className="h-6 w-6 text-gray-500" />
    }
  }

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'border-danger-500 bg-danger-50'
      case 'see_gp':
        return 'border-warning-500 bg-warning-50'
      case 'self_care':
        return 'border-success-500 bg-success-50'
      case 'teleconsult':
        return 'border-primary-500 bg-primary-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getSuggestionTitle = (type) => {
    switch (type) {
      case 'emergency':
        return 'Emergency Care Required'
      case 'see_gp':
        return 'See Your Doctor'
      case 'self_care':
        return 'Self-Care Recommended'
      case 'teleconsult':
        return 'Teleconsultation Suggested'
      default:
        return 'Recommendation'
    }
  }

  const exportToCSV = () => {
    if (!evaluation || !formData) return

    const csvData = [
      ['Symptom', 'Severity', 'Duration (days)'],
      ...formData.symptoms.map(s => [s.id, s.severity, formData.duration_days]),
      [''],
      ['Recommendation', 'Type', 'Confidence'],
      ...evaluation.suggestions.map(s => [s.message, s.type, s.confidence || 'N/A']),
      [''],
      ['Rule', 'Matched Facts', 'Confidence'],
      ...evaluation.rules_trace.map(r => [r.name, r.matchedFacts.join(', '), r.confidence || 'N/A'])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `symptom-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/log-symptoms')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Log Symptoms</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Suggestion */}
      {evaluation.suggestions.length > 0 && (
        <div className={`suggestion-card ${getSuggestionColor(evaluation.suggestions[0].type)}`}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getSuggestionIcon(evaluation.suggestions[0].type)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {getSuggestionTitle(evaluation.suggestions[0].type)}
              </h1>
              <p className="text-gray-700 text-lg mb-4">
                {evaluation.suggestions[0].message}
              </p>
              {evaluation.suggestions[0].confidence && (
                <div className="text-sm text-gray-600">
                  Confidence: {(evaluation.suggestions[0].confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Banner */}
      {evaluation.suggestions.some(s => s.type === 'emergency') && (
        <div className="bg-danger-600 text-white p-6 rounded-lg text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <h2 className="text-xl font-bold mb-2">Emergency Situation Detected</h2>
          <p className="text-lg">
            Please call emergency services immediately or go to the nearest emergency room.
          </p>
          <div className="mt-4">
            <a
              href="tel:911"
              className="inline-block bg-white text-danger-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Call 911 Now
            </a>
          </div>
        </div>
      )}

      {/* All Suggestions */}
      {evaluation.suggestions.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Recommendations</h2>
          <div className="space-y-4">
            {evaluation.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getSuggestionIcon(suggestion.type)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getSuggestionTitle(suggestion.type)}
                    </h3>
                    <p className="text-gray-700 mt-1">{suggestion.message}</p>
                    {suggestion.confidence && (
                      <p className="text-sm text-gray-600 mt-1">
                        Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Trace */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How We Decided</h2>
        <p className="text-gray-600 mb-6">
          Here's the reasoning behind our recommendations. Each rule that was triggered is shown below:
        </p>
        
        <div className="space-y-4">
          {evaluation.rules_trace.map((rule, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleRuleExpansion(rule.ruleId)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Matched: {rule.matchedFacts.join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {rule.confidence && (
                    <span className="text-sm text-gray-500">
                      {(rule.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {expandedRules.has(rule.ruleId) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedRules.has(rule.ruleId) && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Rule Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Rule ID:</strong> {rule.ruleId}</p>
                      <p><strong>Matched Facts:</strong> {rule.matchedFacts.join(', ')}</p>
                      {rule.confidence && (
                        <p><strong>Confidence:</strong> {(rule.confidence * 100).toFixed(0)}%</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Additional Symptoms */}
      {evaluation.suggested_additional && evaluation.suggested_additional.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Symptoms to Consider</h2>
          <p className="text-gray-600 mb-4">
            Based on your current symptoms, you might also want to consider these:
          </p>
          <div className="space-y-2">
            {evaluation.suggested_additional.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-900">{symptom.id}</span>
                <span className="text-sm text-gray-600">
                  {(symptom.probability * 100).toFixed(0)}% likely
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/log-symptoms')}
          className="btn-secondary"
        >
          Log New Symptoms
        </button>
        <button
          onClick={() => navigate('/history')}
          className="btn-primary"
        >
          View History
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This is a prototype application for demonstration purposes only. 
            It does not provide medical advice, diagnosis, or treatment. Always consult with qualified 
            healthcare professionals for medical concerns.
          </div>
        </div>
      </div>
    </div>
  )
}
