import React, { useReducer, useEffect } from 'react'
import { createContext } from 'react'
import axios from 'axios'
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

    dispatch({type: 'AUTH_LOADING'})
    try {
      await axios.post('http://localhost:8000/api/token/verify/', {
        token: token
      })
      dispatch({type: 'AUTH_SUCCESS', payload: {user: null}})

    } catch (error) {      
      console.log(error)
      dispatch({type: 'AUTH_ERROR'})
    }
  }
 
  const loginUser = async (username, password) => {
    dispatch({type: 'AUTH_LOADING'})
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { username, password })
      
      // Kiểm tra response có access và refresh token không
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('accessToken', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        
        // Log để debug
        console.log('Access Token:', response.data.access)
        console.log('Refresh Token:', response.data.refresh)
        console.log('Tokens saved to localStorage')
        
        // Gọi loadUser sau khi lưu token
        dispatch({type: 'AUTH_SUCCESS', payload: {user: null}})
        return response.data
      } else {
        console.error('No tokens received from server')
        throw new Error('Authentication failed - no tokens received')
      }
    } catch (error) {
      dispatch({type: 'AUTH_ERROR'})
      console.error('Login error:', error)
      throw error // Re-throw để component có thể xử lý
    }
  }
  const logoutUser = () => {
    dispatch({ type: 'AUTH_ERROR' });
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


