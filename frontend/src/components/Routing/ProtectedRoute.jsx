import React from 'react'
import { LoginContext } from '../../contexts/LoginUser/LoginConText'
import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
const ProtectedRoute = ({ children }) => {
  const { authState: {isLoading,isAuthenticated} } = useContext(LoginContext)

  if (isLoading) {
    return <Spin />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return (<>{children}</>)
}

export default ProtectedRoute   