import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function FoodPartnerLogin() {

  const navigate = useNavigate();

const handlePartnerLogin = async(e)=>{
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

      const response =await axios.post(
        "http://localhost:3000/api/v1/auth/food-partner/login",
        {
          email,
          password
        },
        {
          withCredentials:true
        }
      );


      console.log(response.data);
      navigate('/create-food');

 }


  return <AuthPage variant="partnerLogin" onSubmit={handlePartnerLogin}/>
}

export default FoodPartnerLogin
