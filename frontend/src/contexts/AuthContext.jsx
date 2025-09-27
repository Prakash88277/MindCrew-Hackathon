import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // Check for consent
    const consent = localStorage.getItem('consentAccepted')
    setConsentAccepted(consent === 'true')
  }, [])

  const signup = async (email, password, name) => {
    try {
      setLoading(true)
      // Mock signup - just create a user object
      const newUser = {
        uid: `user_${Date.now()}`,
        email,
        name,
        displayName: name
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      // Mock login - just create a user object
      const newUser = {
        uid: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        displayName: email.split('@')[0]
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginAsGuest = async () => {
    try {
      setLoading(true)
      // Mock guest login
      const guestUser = {
        uid: 'guest_user',
        email: 'guest@example.com',
        name: 'Guest User',
        displayName: 'Guest User',
        isAnonymous: true
      }
      
      setUser(guestUser)
      localStorage.setItem('user', JSON.stringify(guestUser))
      return guestUser
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('consentAccepted')
      setConsentAccepted(false)
    } catch (error) {
      throw error
    }
  }

  const acceptConsent = () => {
    setConsentAccepted(true)
    localStorage.setItem('consentAccepted', 'true')
  }

  const value = {
    user,
    login,
    signup,
    loginAsGuest,
    logout,
    consentAccepted,
    acceptConsent,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}