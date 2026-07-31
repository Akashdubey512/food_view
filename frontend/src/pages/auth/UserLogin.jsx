import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'

function UserLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const email = e.target.email.value
      const password = e.target.password.value

      // Basic validation
      if (!email || !password) {
        setError({
          message: 'Please fill in all fields'
        })
        setIsLoading(false)
        return
      }

      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/login',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )

      login(response.data.account)
      navigate('/')
    } catch (error) {
      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          setError({
            message: 'Invalid email or password. Please try again.',
            field: 'password'
          })
        } else if (status === 404) {
          setError({
            message: 'User not found. Please check your email.',
            field: 'email'
          })
        } else {
          setError({
            message: error.response.data.message || 'Something went wrong. Please try again.'
          })
        }
      } else if (error.request) {
        setError({
          message: 'Unable to connect to server. Please check your connection.'
        })
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthPage variant="userLogin" onSubmit={handleLogin} error={error} isLoading={isLoading} />
}

export default UserLogin