import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import apiClient from '../api/apiClient';

const VnpayReturn = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const paramObj = Object.fromEntries(params.entries());
            console.log("Params gửi lên backend:", paramObj);
            try {
                const res = await apiClient.get('/bookings/vnpay/verify-return/', {
                    params: paramObj
                });
                message.success("✅ Thanh toán thành công!");
                navigate(`/invoices/${res.data.booking_id}`);
            } catch (e) {
                message.error("❌ Thanh toán thất bại hoặc bị hủy.");
                navigate('/dashboard/booking');
                console.log(e)
            }
        };

        verify();
    }, []);

    return <Spin tip="Đang xác minh thanh toán từ VNPAY..." fullscreen />;
};

export default VnpayReturn;
