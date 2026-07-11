import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ children, role }) {
  const { account, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!account) {
    return <Navigate to={role === 'foodPartner' ? '/foodpartner/login' : '/user/login'} replace />
  }

  if (role && account.role !== role) {
    return <Navigate to={account.role === 'foodPartner' ? '/create-food' : '/'} replace />
  }

  return children
}

export default ProtectedRoute
