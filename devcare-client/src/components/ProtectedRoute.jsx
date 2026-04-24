import { Navigate } from 'react-router-dom'

const ACCESS_TOKEN_KEY = 'devcare_access_token'

function ProtectedRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
