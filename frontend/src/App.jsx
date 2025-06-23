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
import RoomListPage from "./pages/RoomListPage";
import RoomTypeListPage from "./pages/RoomTypeListPage";
import { RoomTypeListProvider } from "./contexts/RoomTypeListContext";
import { RoomListProvider } from "./contexts/RoomListContext";
import UserInfoPage from "./pages/UserInfoPage";
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
          <Route index element={<RoomListPage />} />
          <Route path="room-list" element={<RoomListPage />} />
          <Route
            path="add-room"
            element={
              <AddRoomProvider>
                <AddRoomPage />
              </AddRoomProvider>
            }
          />
        </Route>
        <Route path="/test" element={<Test />} />
        <Route
          path="/add-room-type"
          element={
            <AddRoomTypeProvider>
              <AddRoomTypePage />
            </AddRoomTypeProvider>
          }
        />
        <Route
          path="/room-list"
          element={
            <RoomListProvider>
              <RoomListPage />
            </RoomListProvider>
          }
        />
        <Route
          path="/room-type-list"
          element={
            <RoomTypeListProvider>
              <RoomTypeListPage />
            </RoomTypeListProvider>
          }
        />
        <Route
          path="/user-info"
          element={
            <ProtectedRoute>
              <UserInfoPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </LoginProvider>
  );
};
export default App;
