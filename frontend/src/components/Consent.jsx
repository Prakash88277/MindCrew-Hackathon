import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AlertTriangle, X } from 'lucide-react'

export default function Consent() {
  const { user, consentAccepted, acceptConsent } = useAuth()

  if (!user || consentAccepted) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Important Disclaimer
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            This is a prototype application for demonstration purposes only. 
            <strong className="text-gray-900"> It does not provide medical advice, diagnosis, or treatment.</strong>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Always consult with qualified healthcare professionals for medical concerns.
          </p>
          <p className="text-sm text-gray-600">
            By continuing, you consent to storing your data for this prototype demonstration.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={acceptConsent}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  )
}
