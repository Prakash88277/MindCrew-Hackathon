import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import { 
  Settings, 
  Edit, 
  Save, 
  X, 
  Play, 
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export default function Admin() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState(null)
  const [testPayload, setTestPayload] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [showTestResults, setShowTestResults] = useState(false)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRules()
      setRules(response.data)
    } catch (error) {
      toast.error('Failed to load rules')
      console.error('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRule = (rule) => {
    setEditingRule({
      ...rule,
      condition: JSON.stringify(rule.condition, null, 2),
      action: JSON.stringify(rule.action, null, 2)
    })
  }

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...editingRule,
        condition: JSON.parse(editingRule.condition),
        action: JSON.parse(editingRule.action)
      }

      await apiService.updateRule(editingRule.ruleId, ruleData)
      toast.success('Rule updated successfully')
      setEditingRule(null)
      fetchRules()
    } catch (error) {
      toast.error('Failed to update rule')
      console.error('Error updating rule:', error)
    }
  }

  const handleTestRule = async () => {
    try {
      const payload = JSON.parse(testPayload)
      const response = await apiService.testRule(payload)
      setTestResults(response.data)
      setShowTestResults(true)
      toast.success('Test completed')
    } catch (error) {
      toast.error('Invalid JSON or test failed')
      console.error('Error testing rule:', error)
    }
  }

  const toggleRuleActive = async (rule) => {
    try {
      const updatedRule = { ...rule, active: !rule.active }
      await apiService.updateRule(rule.ruleId, updatedRule)
      toast.success(`Rule ${updatedRule.active ? 'activated' : 'deactivated'}`)
      fetchRules()
    } catch (error) {
      toast.error('Failed to update rule status')
      console.error('Error updating rule:', error)
    }
  }

  const samplePayloads = [
    {
      name: 'Mild Cold',
      payload: {
        userProfile: { id: 'test', age: 30, comorbidities: [] },
        symptoms: [{ id: 'cough', severity: 1 }, { id: 'sore_throat', severity: 1 }],
        duration_days: 1,
        vitals: { temp_c: 36.5, spO2: 98, heart_rate: 72 },
        notes: 'Mild cold symptoms'
      }
    },
    {
      name: 'High Fever',
      payload: {
        userProfile: { id: 'test', age: 30, comorbidities: [] },
        symptoms: [{ id: 'fever', severity: 3 }, { id: 'headache', severity: 2 }],
        duration_days: 3,
        vitals: { temp_c: 39.0, spO2: 95, heart_rate: 85 },
        notes: 'High fever for 3 days'
      }
    },
    {
      name: 'Emergency Case',
      payload: {
        userProfile: { id: 'test', age: 30, comorbidities: [] },
        symptoms: [{ id: 'chest_pain', severity: 4 }, { id: 'shortness_of_breath', severity: 3 }],
        duration_days: 0,
        vitals: { temp_c: 37.0, spO2: 88, heart_rate: 110 },
        notes: 'Severe chest pain and breathing difficulty'
      }
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage rules and test the rule engine with sample data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rules Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Rules Management</h2>
            <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.ruleId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                    {rule.tags?.includes('redflag') && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Red Flag
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRuleActive(rule)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {rule.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Priority:</strong> {rule.priority}</p>
                  <p><strong>Action:</strong> {rule.action?.type} - {rule.action?.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Editor */}
        {editingRule && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Rule</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveRule}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditingRule(null)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={editingRule.priority}
                  onChange={(e) => setEditingRule({...editingRule, priority: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition (JSON)
                </label>
                <textarea
                  value={editingRule.condition}
                  onChange={(e) => setEditingRule({...editingRule, condition: e.target.value})}
                  className="input-field h-32 font-mono text-sm"
                  placeholder='{"symptom": "fever", "severity_gte": 3}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action (JSON)
                </label>
                <textarea
                  value={editingRule.action}
                  onChange={(e) => setEditingRule({...editingRule, action: e.target.value})}
                  className="input-field h-24 font-mono text-sm"
                  placeholder='{"type": "see_gp", "message": "See your doctor"}'
                />
              </div>
            </div>
          </div>
        )}

        {/* Rule Testing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Rule Engine</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Payloads
              </label>
              <div className="space-y-2">
                {samplePayloads.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setTestPayload(JSON.stringify(sample.payload, null, 2))}
                    className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{sample.name}</div>
                    <div className="text-sm text-gray-600">
                      {Object.keys(sample.payload.symptoms).length} symptoms
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Payload (JSON)
              </label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="input-field h-48 font-mono text-sm"
                placeholder="Paste or enter JSON payload to test..."
              />
            </div>

            <button
              onClick={handleTestRule}
              disabled={!testPayload.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>Test Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {showTestResults && testResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            <button
              onClick={() => setShowTestResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {testResults.suggestions && testResults.suggestions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Suggestions</h3>
                <div className="space-y-2">
                  {testResults.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded border">
                      <div className="font-medium text-gray-900">{suggestion.type}</div>
                      <div className="text-gray-700">{suggestion.message}</div>
                      {suggestion.confidence && (
                        <div className="text-sm text-gray-600">
                          Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResults.rules_trace && testResults.rules_trace.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Rules Fired</h3>
                <div className="space-y-2">
                  {testResults.rules_trace.map((rule, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-600">
                        Matched: {rule.matchedFacts?.join(', ')}
                      </div>
                      {rule.confidence && (
                        <div className="text-sm text-gray-500">
                          Confidence: {(rule.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResults.suggested_additional && testResults.suggested_additional.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Suggested Additional Symptoms</h3>
                <div className="space-y-1">
                  {testResults.suggested_additional.map((symptom, index) => (
                    <div key={index} className="flex justify-between p-2 bg-green-50 rounded border">
                      <span className="text-gray-900">{symptom.id}</span>
                      <span className="text-sm text-gray-600">
                        {(symptom.probability * 100).toFixed(0)}% likely
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
