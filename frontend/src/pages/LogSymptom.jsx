import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import { Search, Plus, X, Thermometer, Heart, Activity, AlertCircle } from 'lucide-react'

export default function LogSymptom() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [symptoms, setSymptoms] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [probableSymptoms, setProbableSymptoms] = useState([])
  const [showProbableSymptoms, setShowProbableSymptoms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    duration_days: 1,
    vitals: {
      temp_c: '',
      spO2: '',
      heart_rate: ''
    },
    notes: '',
    comorbidities: {
      diabetes: false,
      heart_disease: false,
      hypertension: false,
      immunocompromised: false,
      pregnant: false
    }
  })

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSymptoms()
      setSymptoms(response.data)
    } catch (error) {
      toast.error('Failed to load symptoms')
      console.error('Error fetching symptoms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProbableSymptoms = async () => {
    if (selectedSymptoms.length === 0) return

    try {
      const response = await apiService.getProbableSymptoms({
        symptoms: selectedSymptoms,
        topN: 5
      })
      setProbableSymptoms(response.data)
    } catch (error) {
      console.error('Error fetching probable symptoms:', error)
    }
  }

  useEffect(() => {
    if (showProbableSymptoms && selectedSymptoms.length > 0) {
      fetchProbableSymptoms()
    }
  }, [selectedSymptoms, showProbableSymptoms])

  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.synonyms?.some(synonym => 
      synonym.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      const newSymptom = {
        id: symptom.id,
        severity: 3, // Default severity
        duration: 1
      }
      setSelectedSymptoms([...selectedSymptoms, newSymptom])
    }
    setSearchTerm('')
  }

  const removeSymptom = (symptomId) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId))
  }

  const updateSymptomSeverity = (symptomId, severity) => {
    setSelectedSymptoms(selectedSymptoms.map(s => 
      s.id === symptomId ? { ...s, severity } : s
    ))
  }

  const addProbableSymptom = (symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      const newSymptom = {
        id: symptom.id,
        severity: 2, // Default lower severity for suggested symptoms
        duration: 1
      }
      setSelectedSymptoms([...selectedSymptoms, newSymptom])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const userProfile = {
        id: user.uid,
        age: 30, // Default age - in real app, get from user profile
        comorbidities: Object.keys(formData.comorbidities).filter(
          key => formData.comorbidities[key]
        )
      }

      const evaluationData = {
        userProfile,
        symptoms: selectedSymptoms,
        duration_days: formData.duration_days,
        vitals: {
          temp_c: formData.vitals.temp_c ? parseFloat(formData.vitals.temp_c) : null,
          spO2: formData.vitals.spO2 ? parseInt(formData.vitals.spO2) : null,
          heart_rate: formData.vitals.heart_rate ? parseInt(formData.vitals.heart_rate) : null
        },
        notes: formData.notes
      }

      const response = await apiService.evaluateSymptoms(evaluationData)
      
      // Save the log
      await apiService.saveSymptomLog({
        ...evaluationData,
        result: response.data
      })

      // Navigate to results with the evaluation data
      navigate('/results', { 
        state: { 
          evaluation: response.data,
          formData: evaluationData
        } 
      })
    } catch (error) {
      toast.error('Failed to evaluate symptoms')
      console.error('Evaluation error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Your Symptoms</h1>
        <p className="text-gray-600 mt-2">
          Describe your current symptoms to get personalized recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Symptom Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Symptoms</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mb-4">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredSymptoms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No symptoms found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredSymptoms.slice(0, 10).map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => addSymptom(symptom)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{symptom.label}</div>
                        {symptom.synonyms && (
                          <div className="text-sm text-gray-500">
                            {symptom.synonyms.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                      <Plus className="h-4 w-4 text-primary-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Selected Symptoms</h3>
              {selectedSymptoms.map((symptom) => {
                const symptomData = symptoms.find(s => s.id === symptom.id)
                return (
                  <div key={symptom.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {symptomData?.label || symptom.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Severity: {symptom.severity}/5
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={symptom.severity}
                        onChange={(e) => updateSymptomSeverity(symptom.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <button
                        type="button"
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Probable Symptoms Toggle */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showProbableSymptoms}
                onChange={(e) => setShowProbableSymptoms(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Suggest additional probable symptoms
              </span>
            </label>
          </div>

          {/* Probable Symptoms */}
          {showProbableSymptoms && probableSymptoms.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Suggested Additional Symptoms</h3>
              <div className="space-y-2">
                {probableSymptoms.map((symptom) => (
                  <label key={symptom.id} className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => addProbableSymptom(symptom)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {symptom.id} ({(symptom.probability * 100).toFixed(0)}% likely)
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Duration and Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Duration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long have you had these symptoms?
              </label>
              <select
                value={formData.duration_days}
                onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                className="input-field"
              >
                <option value={0}>Less than 1 day</option>
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Thermometer className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.temp_c}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vitals: {...formData.vitals, temp_c: e.target.value}
                    })}
                    className="input-field pl-10"
                    placeholder="37.0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oxygen Saturation (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.vitals.spO2}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vitals: {...formData.vitals, spO2: e.target.value}
                    })}
                    className="input-field pl-10"
                    placeholder="98"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (BPM)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heart className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.vitals.heart_rate}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vitals: {...formData.vitals, heart_rate: e.target.value}
                    })}
                    className="input-field pl-10"
                    placeholder="72"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comorbidities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select any conditions that apply to you (this helps provide more accurate recommendations):
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.comorbidities).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    comorbidities: {
                      ...formData.comorbidities,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {key.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Describe your symptoms in more detail, any triggers, or other relevant information..."
            className="input-field h-24 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedSymptoms.length === 0 || submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Evaluating...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
    </div>
  )
}
