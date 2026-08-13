import { Route, Routes } from 'react-router-dom'
import UserRegister from '../pages/auth/UserRegister'
import UserLogin from '../pages/auth/UserLogin'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin'
import Home from '../pages/general/Home'
import Saved from '../pages/general/Saved'
import Cart from '../pages/general/Cart'
import Orders from '../pages/general/Orders'
import CreateFood from '../pages/food_partner/createFood'
import FoodPartnerProfile from '../pages/food_partner/foodPartnerProfile'
import ErrorPage from '../pages/general/Error'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import Orderspage from '../pages/food_partner/index'

import PartnerDashboard from '../pages/food_partner/PartnerDashboard'
import PartnerMenu from '../pages/food_partner/PartnerMenu'
import PartnerAnalytics from '../pages/food_partner/PartnerAnalytics'
import PartnerProfile from '../pages/food_partner/PartnerProfile'
import PartnerOrderDetails from '../pages/food_partner/PartnerOrderDetails'
import PartnerSettings from '../pages/food_partner/PartnerSettings'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth / Guest Routes */}
      <Route
        path="/user/register"
        element={
          <PublicRoute>
            <UserRegister />
          </PublicRoute>
        }
      />
      <Route
        path="/user/login"
        element={
          <PublicRoute>
            <UserLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/foodpartner/register"
        element={
          <PublicRoute>
            <FoodPartnerRegister />
          </PublicRoute>
        }
      />
      <Route
        path="/foodpartner/login"
        element={
          <PublicRoute>
            <FoodPartnerLogin />
          </PublicRoute>
        }
      />

      {/* User / Customer Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute role="user">
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute role="user">
            <Saved />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute role="user">
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute role="user">
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* Food Partner Protected Routes */}
      <Route
        path="/foodpartner"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/dashboard"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/orders"
        element={
          <ProtectedRoute role="foodPartner">
            <Orderspage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/orders/:orderId"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerOrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/menu"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/add-food"
        element={
          <ProtectedRoute role="foodPartner">
            <CreateFood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/edit-food/:id"
        element={
          <ProtectedRoute role="foodPartner">
            <CreateFood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/analytics"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/profile"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodpartner/settings"
        element={
          <ProtectedRoute role="foodPartner">
            <PartnerSettings />
          </ProtectedRoute>
        }
      />

      {/* Food Partner Store Profile viewed by Customer */}
      <Route
        path="/foodpartner/:id"
        element={
          <ProtectedRoute role="user">
            <FoodPartnerProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/error"
        element={
          <ProtectedRoute role="user">
            <ErrorPage
              title="Error"
              subtitle="Something went wrong"
              message="An unexpected error occurred."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute role="user">
            <ErrorPage
              title="404"
              subtitle="Page Not Found"
              message="The page you're looking for doesn't exist or may have been moved."
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes

