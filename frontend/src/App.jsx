import "./App.css";
import LoginForm from "./components/Auth/LoginForm";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import { LoginProvider } from "./contexts/LoginUser/LoginConText";
import ProtectedRoute from "./components/Routing/ProtectedRoute";
import AddRoomPage from "./pages/Room/AddRoomPage";
import { AddRoomProvider } from "./contexts/Room/AddRoomContext";
import { AddRoomTypeProvider } from "./contexts/RoomType/AddRoomTypeContext";
import AddRoomTypePage from "./pages/RoomType/AddRoomTypePage";
import RoomTypeListPage from "./pages/RoomType/RoomTypeListPage";
import { RoomTypeListProvider } from "./contexts/RoomType/RoomTypeListContext";
import RoomListPage from "./pages/Room/RoomListPage";
import { RoomListProvider } from "./contexts/Room/RoomListContext";
import UserInfoPage from "./pages/User/UserInfoPage";
import AmenityManagementPage from "./pages/Amenity/AmenityManagementPage";
import { AmenityProvider } from "./contexts/Amenity/AmenityContext";
import { BookingProvider } from "./contexts/Booking/BookingContext";
import BookingPage from "./pages/Booking/BookingPage";
import UserManagementPage from "./pages/User/UserManagementPage";
import { UserManagementProvider } from "./contexts/LoginUser/UserManagementContext";
import InvoiceTemplate from "./pages/Invoices/InvoiceTemplate";
import InvoiceDetailPage from "./pages/Invoices/InvoiceDetailPage";
import MomoReturn from "./pages/MomoReturn";
import RevenueReportPage  from "./pages/RevenueReportPage";

const App = () => {
  return (
    <LoginProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserInfoPage />} />
          <Route
            path="room-list"
            element={
              <RoomListProvider>
                <BookingProvider>
                  <RoomListPage />
                </BookingProvider>
              </RoomListProvider>
            }
          />
          <Route
            path="add-room"
            element={
              <AddRoomProvider>
                <AddRoomPage />
              </AddRoomProvider>
            }
          />
          <Route
            path="room-type-list"
            element={
              <RoomTypeListProvider>
                <RoomTypeListPage />
              </RoomTypeListProvider>
            }
          />
          <Route
            path="add-room-type"
            element={
              <RoomTypeListProvider>
                <AddRoomTypeProvider>
                  <AmenityProvider>
                    <AddRoomTypePage />
                  </AmenityProvider>
                </AddRoomTypeProvider>
              </RoomTypeListProvider>
            }
          />
          <Route
            path="amenities"
            element={
              <AmenityProvider>
                <AmenityManagementPage />
              </AmenityProvider>
            }
          />
          <Route
            path="booking"
            element={
              <BookingProvider>
                <BookingPage />
              </BookingProvider>
            }
          />
          <Route
            path="user-management"
            element={
              <UserManagementProvider>
                <UserManagementPage />
              </UserManagementProvider>
            }
          />
          <Route path = "revenue-report" element = {<RevenueReportPage />} />
        </Route>
        <Route path="/momo-return" element={<MomoReturn />} />
        <Route path="/invoice-template" element={<InvoiceTemplate />} />
        <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
        
      </Routes>
    </LoginProvider>
  );
};
export default App;
