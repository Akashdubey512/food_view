
import './App.css'
import './styles/header.css'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRouter'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <Header />
      <AppRoutes />
    </Router>
  )
}

export default App
