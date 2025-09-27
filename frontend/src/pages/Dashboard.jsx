import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { Plus, FileText, History, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoScenarios] = useState([
    {
      id: 'mild_cold',
      name: 'Mild Cold',
      description: 'Cough and sore throat',
      symptoms: [
        { id: 'cough', severity: 1 },
        { id: 'sore_throat', severity: 1 }
      ],
      duration_days: 1
    },
    {
      id: 'high_fever',
      name: 'High Fever',
      description: 'Persistent fever with diabetes',
      symptoms: [
        { id: 'fever', severity: 3 },
        { id: 'headache', severity: 2 }
      ],
      duration_days: 3,
      comorbidities: ['diabetes']
    },
    {
      id: 'emergency',
      name: 'Emergency Case',
      description: 'Severe chest pain',
      symptoms: [
        { id: 'chest_pain', severity: 4 },
        { id: 'shortness_of_breath', severity: 3 }
      ],
      duration_days: 0
    }
  ])

  useEffect(() => {
    fetchRecentLogs()
  }, [])

  const fetchRecentLogs = async () => {
    try {
      const response = await apiService.getSymptomLogs()
      // Check if response.data has logs property (backend format) or is an array directly
      const logs = response.data.logs || response.data
      setRecentLogs(Array.isArray(logs) ? logs.slice(0, 5) : []) // Show last 5 logs
    } catch (error) {
      console.error('Failed to fetch recent logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const runDemoScenario = async (scenario) => {
    try {
      const userProfile = {
        id: user.uid,
        age: 30, // Default age for demo
        comorbidities: scenario.comorbidities || []
      }

      const response = await apiService.evaluateSymptoms({
        userProfile,
        symptoms: scenario.symptoms,
        duration_days: scenario.duration_days,
        vitals: {},
        notes: `Demo scenario: ${scenario.name}`
      })

      // Save the demo log
      await apiService.saveSymptomLog({
        symptoms: scenario.symptoms,
        duration_days: scenario.duration_days,
        vitals: {},
        notes: `Demo scenario: ${scenario.name}`,
        result: response.data
      })

      toast.success(`Demo scenario "${scenario.name}" completed!`)
      fetchRecentLogs() // Refresh the list
    } catch (error) {
      toast.error('Failed to run demo scenario')
      console.error('Demo error:', error)
    }
  }

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-danger-500" />
      case 'see_gp':
        return <Clock className="h-5 w-5 text-warning-500" />
      case 'self_care':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      default:
        return <FileText className="h-5 w-5 text-primary-500" />
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
      default:
        return 'text-primary-600 bg-primary-50 border-primary-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Guest'}!
        </h1>
        <p className="text-gray-600">
          Log your symptoms to get AI-powered suggestions and track your health over time.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Log New Symptoms</h2>
            <Plus className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-gray-600 mb-4">
            Record your current symptoms and get personalized recommendations.
          </p>
          <Link
            to="/log-symptoms"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start Logging
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">View History</h2>
            <History className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-gray-600 mb-4">
            Review your past symptom logs and recommendations.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            View History
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Demo Scenarios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Scenarios</h2>
        <p className="text-gray-600 mb-6">
          Try these pre-configured scenarios to see how the app works:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              <button
                onClick={() => runDemoScenario(scenario)}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Run Demo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/history"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start by logging your symptoms.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getSuggestionIcon(log.result?.suggestions?.[0]?.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.symptoms?.map(s => s.id).join(', ')} 
                      {log.duration_days > 0 && ` (${log.duration_days} days)`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {log.result?.suggestions?.[0] && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSuggestionColor(log.result.suggestions[0].type)}`}
                    >
                      {log.result.suggestions[0].type.replace('_', ' ')}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
