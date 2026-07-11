import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext.jsx'

function FoodPartnerRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handlePartnerRegister = async (e) => {
    e.preventDefault()
    const businessName = e.target.businessName.value
    const ownerName = e.target.ownerName.value
    const phone = e.target.phone.value
    const address = e.target.address.value
    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post(
      'http://localhost:3000/api/v1/auth/food-partner/register',
      {
        fullName: ownerName,
        bussinessName: businessName,
        phoneNumber: phone,
        email,
        address,
        password,
      },
      {
        withCredentials: true,
      }
    )

    login(response.data.account)
    navigate('/create-food')
  }

  return <AuthPage variant="partnerRegister" onSubmit={handlePartnerRegister} />
}

export default FoodPartnerRegister
