import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      setUser(JSON.parse(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    try {
      let response
      
      if (role === 'admin') {
        response = await api.post('auth/admin/login', { email, password })
      } else {
        response = await api.post('auth/salesman/login', { 
          mobile: email, 
          pin: password 
        })
      }

      const { user: userData, token } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)

      toast.success('Login successful!')
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/salesman')
      }
      
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}