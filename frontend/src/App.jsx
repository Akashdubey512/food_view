

import './App.css'
import './styles/header.css'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRouter'

function App() {
  return (
    <Router styles="max-height=100vh">
      <AppRoutes />
    </Router>
  )
}

export default App
