import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PublicRoute = ({ children }) => {
  const { user } = useAuth()

  if (user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" />
    } else {
      return <Navigate to="/salesman" />
    }
  }

  return children
}

export default PublicRoute