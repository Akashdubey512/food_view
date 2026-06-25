import { useMemo, useState } from 'react'
import AuthFlowContext from './authFlowContext'

const fieldAliases = {
  name: ['ownerName'],
  ownerName: ['name'],
}

function AuthFlowProvider({ children }) {
  const [formData, setFormData] = useState({})

  const updateFieldValue = (fieldId, value) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value }

      for (const alias of fieldAliases[fieldId] || []) {
        next[alias] = value
      }

      return next
    })
  }

  const value = useMemo(() => ({
    formData,
    updateFieldValue,
  }), [formData])

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>
}

export { AuthFlowProvider }
