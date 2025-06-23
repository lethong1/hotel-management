// import React, { useState, useEffect } from 'react';
// import apiClient from '../api/apiClient'; // Import apiClient đã tạo

// function Dashboard() {
//     const [rooms, setRooms] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     useEffect(() => {
//         const fetchRooms = async () => {
//             try {
//                 setLoading(true);
//                 // Dùng apiClient để gọi API, không cần lo về token nữa
//                 const response = await apiClient.get('/rooms/');
//                 console.log(response.data);
//                 setRooms(response.data);
//             } catch (err) {
//                 setError('Không thể tải danh sách phòng.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchRooms();
//     }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

//     if (loading) return <p>Đang tải dữ liệu...</p>;
//     if (error) return <p style={{ color: 'red' }}>{error}</p>;

//     return (
//         <div>
//             <h1>Trang chủ - Sơ đồ phòng</h1>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
//                 {rooms.map(room => (
//                     <div key={room.id} style={{ 
//                         border: '1px solid black', 
//                         padding: '20px', 
//                         width: '100px',
//                         backgroundColor: room.status === 'available' ? 'lightgreen' : (room.status === 'occupied' ? 'lightcoral' : 'lightgray')
//                     }}>
//                         <h4>Phòng {room.room_number}</h4>
//                         <p>Tầng: {room.floor}</p>
//                         <p>Trạng thái: {room.status}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default Dashboard;


import React from 'react'
import Sidebar from '../components/Nav/Sidebar'
import Panel from '../components/Nav/Panel'
const Dashboard = () => {
  return (
    <div>
        <Sidebar />
        <Panel />
        <div className="dashboard-content">
          <h1>Trang chủ</h1>
        </div>
      </div>
  )
}

export default Dashboard