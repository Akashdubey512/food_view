import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'

function FoodPartnerLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePartnerLogin = async (e) => {
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
        'http://localhost:3000/api/v1/auth/food-partner/login',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )

      login(response.data.account)
      navigate('/foodpartner/dashboard')
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
            message: 'Partner account not found. Please check your email or register.',
            field: 'email'
          })
        } else if (status === 403) {
          setError({
            message: 'Your partner account is not active. Please contact support.'
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

  return <AuthPage variant="partnerLogin" onSubmit={handlePartnerLogin} error={error} isLoading={isLoading} />
}

export default FoodPartnerLogin