import { useContext } from 'react'
import AuthFlowContext from './authFlowContext'

function useAuthFlow() {
  const context = useContext(AuthFlowContext)

  if (!context) {
    throw new Error('useAuthFlow must be used within an AuthFlowProvider')
  }

  return context
}

export default useAuthFlow
