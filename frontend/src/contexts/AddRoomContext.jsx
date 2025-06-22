// AddRoomContext.js
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import apiClient from "../api/apiClient";

// Định nghĩa dữ liệu gốc cho các loại phòng và tiện nghi
// const ROOM_TYPE_DATA = { ... };
// const ROOM_TYPE_ID_MAP = { ... };

const AMENITIES_DATA = {
  wifi: 0, // Wifi thường miễn phí
  ac: 50000,
  pool: 100000,
  tv: 20000,
  gym: 50000,
  bathtub: 150000,
  parking: 30000,
};

// 1. Tạo Context
const AddRoomContext = createContext();

// 2. Tạo Provider Component
export const AddRoomProvider = ({ children }) => {
  const [roomTypeId, setRoomTypeId] = useState(null); // Lưu ID của loại phòng
  const [roomTypes, setRoomTypes] = useState([]); // Lưu danh sách loại phòng từ API
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // Effect để lấy danh sách loại phòng từ API khi component mount
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoadingInitialData(true);
        const response = await apiClient.get("/room-types/");
        setRoomTypes(response.data);
      } catch (err) {
        setError("Không thể tải danh sách loại phòng.");
        console.error(err);
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchRoomTypes();
  }, []);

  // Hàm xử lý khi thay đổi loại phòng, giờ sẽ nhận vào ID
  const handleRoomTypeChange = (newTypeId) => {
    setRoomTypeId(newTypeId);
  };

  // Hàm xử lý khi thay đổi danh sách tiện nghi
  const handleAmenitiesChange = (amenities) => {
    setSelectedAmenities(amenities);
  };

  // Tính toán thông tin phòng dựa trên state
  const roomDetails = useMemo(() => {
    const details = {
      capacity: 0,
      basePrice: 0,
      amenitiesPrice: 0,
      totalPrice: 0,
    };

    // Tìm loại phòng đã chọn trong danh sách từ API
    const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId);

    if (selectedRoomType) {
      details.capacity = selectedRoomType.capacity; // Dùng trường capacity
      details.basePrice = parseFloat(selectedRoomType.price_per_night); // Dùng price_per_night
    }

    // Tính toán giá tiện nghi
    details.amenitiesPrice = selectedAmenities.reduce((total, amenity) => {
      return total + (AMENITIES_DATA[amenity] || 0);
    }, 0);

    // Tính tổng giá
    details.totalPrice = details.basePrice + details.amenitiesPrice;

    return details;
  }, [roomTypeId, selectedAmenities, roomTypes]);

  // Hàm gọi API để thêm phòng mới
  const addRoom = async (roomData) => {
    setLoading(true);
    setError(null);

    try {
      if (!roomTypeId) {
        throw new Error("Vui lòng chọn một loại phòng.");
      }

      // Ánh xạ lại dữ liệu từ form cho đúng với API backend
      const payload = {
        room_number: roomData.roomNumber,
        floor: roomData.floor,
        status: roomData.status,
        room_type_id: roomTypeId,
      };

      console.log("Submitting data:", payload);

      const response = await apiClient.post("/rooms/", payload);

      setLoading(false);
      console.log("API Response:", response.data);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response ? err.response.data : "An unexpected error occurred."
      );
      console.error("API Error:", err.response || err);
      throw err;
    }
  };

  // Giá trị cần cung cấp cho các component con
  const value = {
    roomTypeId,
    roomDetails,
    selectedAmenities,
    handleRoomTypeChange,
    handleAmenitiesChange,
    addRoom,
    loading,
    error,
    roomTypes, // Truyền danh sách loại phòng xuống
    loadingInitialData, // Truyền trạng thái loading ban đầu
  };

  return (
    <AddRoomContext.Provider value={value}>{children}</AddRoomContext.Provider>
  );
};

// 3. Tạo custom hook để sử dụng Context dễ dàng hơn
export const useAddRoom = () => {
  const context = useContext(AddRoomContext);
  if (context === undefined) {
    throw new Error("useAddRoom must be used within a AddRoomProvider");
  }
  return context;
};
