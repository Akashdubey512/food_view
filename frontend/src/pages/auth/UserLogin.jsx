import AuthPage from './AuthPage'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserLogin() {

const navigate = useNavigate();

const handleLogin = async (e) => {
  
e.preventDefault();

const email = e.target.email.value;
const password = e.target.password.value;

  const response =await axios.post(
    "http://localhost:3000/api/v1/auth/login",
    {
      email,
      password
    },
    {
      withCredentials:true
    }
  );
  console.log(response.data);
  navigate('/');

 }

  return <AuthPage variant="userLogin" onSubmit={handleLogin}/>
}

export default UserLogin
