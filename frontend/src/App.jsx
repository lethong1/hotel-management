import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login'
import Dashboard from './components/pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
const App = () => {

  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
  );
}
export default App
