import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import apiClient from "../api/apiClient";

const MomoReturn = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const paramObj = Object.fromEntries(params.entries());
      try {
        const res = await apiClient.post("/bookings/momo/verify-return/", paramObj);
        message.success("✅ Thanh toán thành công!");
        if (res.data.invoice_id) {
          navigate(`/invoices/${res.data.invoice_id}`);
        } else {
          navigate("/dashboard/booking");
        }
      } catch (e) {
        console.log(e);
        message.error("❌ Thanh toán thất bại hoặc bị hủy.");
        navigate("/dashboard/booking");
      }
    };
    verify();
  }, []);

  return <Spin tip="Đang xác minh thanh toán từ MOMO..." fullscreen />;
};

export default MomoReturn;
