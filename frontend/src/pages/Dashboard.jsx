import React from 'react'
import Sidebar from '../components/Nav/Sidebar'
import Panel from '../components/Nav/Panel'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <Sidebar />
      <Panel />
      <Outlet />
    </div>
  )
}

export default Dashboard