import { Route, Routes } from 'react-router-dom'
import UserRegister from '../pages/auth/UserRegister'
import UserLogin from '../pages/auth/UserLogin'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin'
import Home from '../pages/general/Home'
import Saved from '../pages/general/Saved'
import Cart from '../pages/general/Cart'
import Orders from '../pages/general/Orders'
import UserProfile from '../pages/general/UserProfile'
import CreateFood from '../pages/food_partner/createFood'
import FoodPartnerProfile from '../pages/food_partner/foodPartnerProfile'
import ErrorPage from '../pages/general/Error'
import ProtectedRoute from '../components/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/foodpartner/register" element={<FoodPartnerRegister />} />
      <Route path="/foodpartner/login" element={<FoodPartnerLogin />} />
      <Route path="/" element={<Home />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route
        path="/create-food"
        element={
          <ProtectedRoute role="foodPartner">
            <CreateFood />
          </ProtectedRoute>
        }
      />
      <Route path="/foodpartner/:id" element={<FoodPartnerProfile />} />
      <Route
        path="/error"
        element={
          <ErrorPage
            title="Error"
            subtitle="Something went wrong"
            message="An unexpected error occurred."
          />
        }
      />
      <Route
        path="*"
        element={
          <ErrorPage
            title="404"
            subtitle="Page Not Found"
            message="The page you're looking for doesn't exist or may have been moved."
          />
        }
      />
    </Routes>
  )
}

export default AppRoutes
