import AuthPage from './AuthPage'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



function UserRegister() {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  
e.preventDefault();


const name = document.querySelector('input[name="name"]').value;
const email = document.querySelector('input[name="email"]').value;
const password = document.querySelector('input[name="password"]').value;

  const response =await axios.post(
    "http://localhost:3000/api/v1/auth/register",
    {
      fullName: name,
      email,
      password
    },
    {
      withCredentials:true
    }
  );

  document.querySelector('input[name="name"]').value = "";
  document.querySelector('input[name="email"]').value = "";
  document.querySelector('input[name="password"]').value = "";
  console.log(response.data);
  navigate('/');


 }

  return <AuthPage variant="userRegister" onSubmit={handleRegister} />

}

export default UserRegister
