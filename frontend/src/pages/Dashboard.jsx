import React from 'react'
import Sidebar from '../components/Nav/Sidebar'
import Panel from '../components/Nav/Panel'
import AddRoomPage from './AddRoomPage'
import { Outlet } from 'react-router-dom'
import { AddRoomProvider } from '../contexts/AddRoomContext'

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <Sidebar />
      <Panel />
        <AddRoomProvider>
          <AddRoomPage />
        </AddRoomProvider>
    </div>
  )
}

export default Dashboard