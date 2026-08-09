import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'

function FoodPartnerRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (businessName, ownerName, phone, address, email, password) => {
    const errors = {}

    // Business name validation
    if (!businessName || businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters'
    } else if (businessName.trim().length > 100) {
      errors.businessName = 'Business name must be less than 100 characters'
    }

    // Owner name validation
    if (!ownerName || ownerName.trim().length < 2) {
      errors.ownerName = 'Owner name must be at least 2 characters'
    } else if (ownerName.trim().length > 50) {
      errors.ownerName = 'Owner name must be less than 50 characters'
    } else if (!/^[a-zA-Z\s'-]+$/.test(ownerName.trim())) {
      errors.ownerName = 'Owner name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // Phone validation
    if (!phone) {
      errors.phone = 'Phone number is required'
    } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number (e.g., +1 234 567 8900)'
    } else if (phone.replace(/\s/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits'
    }

    // Address validation
    if (!address || address.trim().length < 5) {
      errors.address = 'Please enter a complete address (at least 5 characters)'
    } else if (address.trim().length > 200) {
      errors.address = 'Address must be less than 200 characters'
    }

    // Email validation
    if (!email) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address (e.g., team@example.com)'
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

  const handlePartnerRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    setIsLoading(true)

    const businessName = e.target.businessName.value
    const ownerName = e.target.ownerName.value
    const phone = e.target.phone.value
    const address = e.target.address.value
    const email = e.target.email.value
    const password = e.target.password.value

    // Client-side validation
    const errors = validateForm(businessName, ownerName, phone, address, email, password)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post(
        '/api/v1/auth/food-partner/register',
        {
          fullName: ownerName.trim(),
          bussinessName: businessName.trim(),
          phoneNumber: phone.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          password,
        }
      )

      login(response.data.account)
      navigate('/foodpartner/dashboard')
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
              email: 'Email already registered. Please use a different email.'
            })
          } else {
            setError({
              message: data.message || 'Please check your input and try again.'
            })
          }
        } else if (status === 409) {
          setValidationErrors({
            email: 'Business email already registered. Please use a different email.'
          })
        } else if (status === 422) {
          const errors = data.errors || {}
          const fieldErrors = {}
          Object.keys(errors).forEach(key => {
            fieldErrors[key] = errors[key]
          })
          setValidationErrors(fieldErrors)
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

  return <AuthPage variant="partnerRegister" onSubmit={handlePartnerRegister} error={error} validationErrors={validationErrors} isLoading={isLoading} />
}

export default FoodPartnerRegister