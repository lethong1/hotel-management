import "./App.css";
import LoginForm from "./components/Auth/LoginForm";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import { BrowserRouter } from "react-router-dom";
import { LoginProvider } from "./contexts/LoginConText";
import ProtectedRoute from "./components/Routing/ProtectedRoute";
import AddRoomPage from "./pages/AddRoomPage";
import { AddRoomProvider } from "./contexts/AddRoomContext";
import { AddRoomTypeProvider } from "./contexts/AddRoomTypeContext";
import AddRoomTypePage from "./pages/AddRoomTypePage";

import RoomTypeListPage from "./pages/RoomTypeListPage";
import { RoomTypeListProvider } from "./contexts/RoomTypeListContext";
import RoomListPage from "./pages/RoomListPage";
import { RoomListProvider } from "./contexts/RoomListContext";
import UserInfoPage from "./pages/UserInfoPage";
import AmenityManagementPage from "./pages/AmenityManagementPage";
import { AmenityProvider } from "./contexts/AmenityContext";
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
                <RoomListPage />
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
            path="amenity-management"
            element={
              <AmenityProvider>
                <AmenityManagementPage />
              </AmenityProvider>
            }
          />
        </Route>
        <Route
          path="/add-room-type"
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
      </Routes>
    </LoginProvider>
  );
};
export default App;
