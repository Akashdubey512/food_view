import AuthPage from './AuthPage'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function UserRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()

    const name = e.target.name.value
    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post(
      'http://localhost:3000/api/v1/auth/register',
      {
        fullName: name,
        email,
        password,
      },
      {
        withCredentials: true,
      }
    )

    e.target.name.value = ''
    e.target.email.value = ''
    e.target.password.value = ''

    login(response.data.account)
    navigate('/')
  }

  return <AuthPage variant="userRegister" onSubmit={handleRegister} />
}
export default UserRegister