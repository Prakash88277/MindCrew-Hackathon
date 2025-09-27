import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Download,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState(new Set())

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSymptomLogs()
      setLogs(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (error) {
      toast.error('Failed to load history')
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-danger-500" />
      case 'see_gp':
        return <Clock className="h-5 w-5 text-warning-500" />
      case 'self_care':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'teleconsult':
        return <Phone className="h-5 w-5 text-primary-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      case 'see_gp':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'self_care':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'teleconsult':
        return 'text-primary-600 bg-primary-50 border-primary-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const exportAllToCSV = () => {
    const csvData = [
      ['Date', 'Symptoms', 'Duration', 'Recommendation', 'Type', 'Confidence']
    ]

    logs.forEach(log => {
      const symptoms = log.symptoms?.map(s => `${s.id}(${s.severity})`).join('; ') || 'N/A'
      const duration = log.duration_days || 0
      const recommendation = log.result?.suggestions?.[0]?.message || 'N/A'
      const type = log.result?.suggestions?.[0]?.type || 'N/A'
      const confidence = log.result?.suggestions?.[0]?.confidence || 'N/A'
      const date = new Date(log.timestamp).toLocaleDateString()

      csvData.push([date, symptoms, duration, recommendation, type, confidence])
    })

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `symptom-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Symptom History</h1>
          <p className="text-gray-600 mt-2">
            Review your past symptom logs and recommendations.
          </p>
        </div>
        <button
          onClick={exportAllToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export All</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No logs yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start by logging your symptoms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {log.result?.suggestions?.[0] && getSuggestionIcon(log.result.suggestions[0].type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {log.symptoms?.map(s => s.id).join(', ') || 'No symptoms'}
                      </h3>
                      {log.duration_days > 0 && (
                        <span className="text-sm text-gray-500">
                          ({log.duration_days} day{log.duration_days !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {log.result?.suggestions?.[0] && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSuggestionColor(log.result.suggestions[0].type)}`}
                    >
                      {log.result.suggestions[0].type.replace('_', ' ')}
                    </span>
                  )}
                  {expandedLogs.has(log.id) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedLogs.has(log.id) && (
                <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                  <div className="pt-4 space-y-6">
                    {/* Symptoms Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                      <div className="space-y-2">
                        {log.symptoms?.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-gray-900">{symptom.id}</span>
                            <span className="text-sm text-gray-600">Severity: {symptom.severity}/5</span>
                          </div>
                        )) || <p className="text-gray-500">No symptoms recorded</p>}
                      </div>
                    </div>

                    {/* Vitals */}
                    {log.vitals && Object.values(log.vitals).some(v => v !== null && v !== '') && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Vital Signs</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {log.vitals.temp_c && (
                            <div className="p-2 bg-white rounded border text-center">
                              <div className="text-sm text-gray-500">Temperature</div>
                              <div className="font-medium">{log.vitals.temp_c}°C</div>
                            </div>
                          )}
                          {log.vitals.spO2 && (
                            <div className="p-2 bg-white rounded border text-center">
                              <div className="text-sm text-gray-500">SpO2</div>
                              <div className="font-medium">{log.vitals.spO2}%</div>
                            </div>
                          )}
                          {log.vitals.heart_rate && (
                            <div className="p-2 bg-white rounded border text-center">
                              <div className="text-sm text-gray-500">Heart Rate</div>
                              <div className="font-medium">{log.vitals.heart_rate} BPM</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-gray-700 bg-white p-3 rounded border">{log.notes}</p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {log.result?.suggestions && log.result.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {log.result.suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)}`}
                            >
                              <div className="flex items-start space-x-2">
                                {getSuggestionIcon(suggestion.type)}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {suggestion.type.replace('_', ' ').toUpperCase()}
                                  </div>
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
                    {log.result?.rules_trace && log.result.rules_trace.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Rules Applied</h4>
                        <div className="space-y-2">
                          {log.result.rules_trace.map((rule, index) => (
                            <div key={index} className="p-3 bg-white rounded border">
                              <div className="font-medium text-gray-900">{rule.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Matched: {rule.matchedFacts.join(', ')}
                              </div>
                              {rule.confidence && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Confidence: {(rule.confidence * 100).toFixed(0)}%
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
