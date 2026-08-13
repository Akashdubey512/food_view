import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function PublicRoute({ children }) {
  const { account, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#fff' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (account) {
    return <Navigate to={account.role === 'foodPartner' ? '/foodpartner' : '/'} replace />
  }

  return children
}

export default PublicRoute
