import React, { useState } from 'react';
import axios from 'axios'; // Đảm bảo bạn đã chạy 'npm install axios'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // URL của API Django
        const API_URL = 'http://localhost:8000/api/token/';

        try {
            const response = await axios.post(API_URL, {
                username: username,
                password: password
            });
            
            setSuccessMessage("Đăng nhập thành công!");
            console.log("Access Token:", response.data.access);
            console.log("Refresh Token:", response.data.refresh);
            
            // Lưu access token vào localStorage để dùng cho các request sau này
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            
            // TODO: Chuyển hướng người dùng đến trang dashboard sau khi đăng nhập thành công
            // window.location.href = '/dashboard';

        } catch (err) {
            console.error("Lỗi đăng nhập:", err.response);
            setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }
    };

    return (
        <div style={{ width: '300px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Đăng nhập hệ thống</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Đăng nhập
                </button>
            </form>
        </div>
    );
}

export default Login;