import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const hiddenPaths = new Set([
  '/user/login',
  '/user/register',
  '/foodpartner/login',
  '/foodpartner/register',
])

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { account, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate(account?.role === 'foodPartner' ? '/foodpartner/login' : '/user/login')
  }

  if (hiddenPaths.has(location.pathname)) {
    return null
  }

  return (
    <header className="app-header" role="banner">
      <div className="app-header__brand">
        <Link to="/" className="app-header__logo">
          Food View
        </Link>
      </div>

      <div className="app-header__actions">
        {isAuthenticated ? (
          <>
            {account?.role === 'foodPartner' ? (
              <Link to="/create-food" className="app-button app-button--secondary">
                Dashboard
              </Link>
            ) : (
              <Link to="/" className="app-button app-button--secondary">
                Discover
              </Link>
            )}
            <button
              type="button"
              className="app-button app-button--primary"
              onClick={handleLogout}
              aria-label="Logout of Food View"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/user/login"
              className="app-button app-button--secondary"
              aria-label="Login to Food View"
            >
              Login
            </Link>
            <Link
              to="/user/register"
              className="app-button app-button--primary"
              aria-label="Sign up for Food View"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header