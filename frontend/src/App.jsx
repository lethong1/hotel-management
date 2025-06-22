import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginForm from './components/Auth/LoginForm'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
import Test from './pages/Test'
import { BrowserRouter } from 'react-router-dom'  
import { LoginProvider } from './contexts/LoginConText'
import ProtectedRoute from './components/Routing/ProtectedRoute'
import AddRoomPage  from './pages/AddRoomPage';
import { AddRoomProvider } from './contexts/AddRoomContext';
const App = () => {

  return (

    <LoginProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/test" element={<Test />} />
        <Route path="/add-room" element={<AddRoomProvider><AddRoomPage /></AddRoomProvider>} />
      </Routes>
    </LoginProvider>
  );
}
export default App
