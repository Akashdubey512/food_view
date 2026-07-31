import AuthPage from './AuthPage'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function UserRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (name, email, password) => {
    const errors = {}

    // Name validation
    if (!name || name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters'
    } else if (name.trim().length > 50) {
      errors.name = 'Full name must be less than 50 characters'
    } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // Email validation
    if (!email) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address (e.g., name@example.com)'
    } else if (email.length > 100) {
      errors.email = 'Email address must be less than 100 characters'
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (password.length > 50) {
      errors.password = 'Password must be less than 50 characters'
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter'
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number'
    } else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      errors.password = 'Password must contain at least one special character (!@#$%^&* etc.)'
    }

    return errors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    setIsLoading(true)

    const name = e.target.name.value
    const email = e.target.email.value
    const password = e.target.password.value

    // Client-side validation
    const errors = validateForm(name, email, password)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/register',
        {
          fullName: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        {
          withCredentials: true,
        }
      )

      // Clear form
      e.target.name.value = ''
      e.target.email.value = ''
      e.target.password.value = ''

      login(response.data.account)
      navigate('/')
    } catch (error) {
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            const fieldErrors = {}
            data.errors.forEach(err => {
              const field = err.param || err.field || 'general'
              fieldErrors[field] = err.msg || err.message || 'Invalid input'
            })
            setValidationErrors(fieldErrors)
          } else if (data.message && data.message.toLowerCase().includes('email')) {
            setValidationErrors({
              email: 'Email already registered. Please use a different email or login.'
            })
          } else {
            setError({
              message: data.message || 'Please check your input and try again.'
            })
          }
        } else if (status === 409) {
          setValidationErrors({
            email: 'Email already exists. Please login or use a different email.'
          })
        } else {
          setError({
            message: data.message || 'Something went wrong. Please try again later.'
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

  return <AuthPage variant="userRegister" onSubmit={handleRegister} error={error} validationErrors={validationErrors} isLoading={isLoading} />
}

export default UserRegister