import React, { useReducer, useEffect } from 'react'
import { createContext } from 'react'
import apiClient from '../api/apiClient'
import { LoginReducer } from '../reducers/LoginReducer'
export const LoginContext = createContext();
export const LoginProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(LoginReducer,
    {
      isLoading: true,
      isAuthenticated: false,
      user: null,
    }
  )
  useEffect(() => {
    loadUser();
  }, []);
  const loadUser = async () => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      dispatch({type: 'AUTH_ERROR'})
      return;
    }

    try {
      const response = await apiClient.get('/users/me/')
      dispatch({type: 'AUTH_SUCCESS', payload: {user: response.data}})

    } catch (error) {      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({type: 'AUTH_ERROR'})
    }
  }
 
  const loginUser = async (username, password) => {
    dispatch({type: 'AUTH_LOADING'})
    try {
      const response = await apiClient.post('/token/', { username, password })
      
      // Kiểm tra response có access và refresh token không
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('accessToken', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        await loadUser(); 
      
        return response.data
      } else {
        throw new Error('Authentication failed - no tokens received')
      }
    } catch (error) {
      dispatch({type: 'AUTH_ERROR'})
      console.error('Login error:', error)
      throw error // Re-throw để component có thể xử lý
    }
  }
  const logoutUser = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    dispatch({ type: 'LOGOUT' });
  }
  const authContextData = {
    loginUser,
    loadUser,
    authState,
    logoutUser
  }
  return (
    <LoginContext.Provider value={authContextData}>
        {children}
    </LoginContext.Provider>
  )
}


