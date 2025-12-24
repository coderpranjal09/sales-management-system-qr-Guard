import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" />
    } else {
      return <Navigate to="/salesman" />
    }
  }

  return children
}

export default ProtectedRoute