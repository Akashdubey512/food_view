import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthFlowProvider } from './context/AuthFlowContext.jsx'
import './styles/auth.css'
import './styles/theme.css'

createRoot(document.getElementById('root')).render(
    <AuthFlowProvider>
        <App />
    </AuthFlowProvider>
)
