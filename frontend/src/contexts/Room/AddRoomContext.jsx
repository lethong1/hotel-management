import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import apiClient from "../../api/apiClient";

const AMENITIES_DATA = {
  wifi: 0, 
  ac: 50000,
  pool: 100000,
  tv: 20000,
  gym: 50000,
  bathtub: 150000,
  parking: 30000,
};

const AddRoomContext = createContext();

export const AddRoomProvider = ({ children }) => {
  const [roomTypeId, setRoomTypeId] = useState(null); 
  const [roomTypes, setRoomTypes] = useState([]); 
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

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
      details.capacity = selectedRoomType.capacity; 
      details.basePrice = parseFloat(selectedRoomType.price_per_night); 
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


      const response = await apiClient.post("/rooms/", payload);

      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response ? err.response.data : "An unexpected error occurred."
      );
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
    roomTypes, 
    loadingInitialData, 
  };

  return (
    <AddRoomContext.Provider value={value}>{children}</AddRoomContext.Provider>
  );
};


export const useAddRoom = () => {
  const context = useContext(AddRoomContext);
  if (context === undefined) {
    throw new Error("useAddRoom must be used within a AddRoomProvider");
  }
  return context;
};
