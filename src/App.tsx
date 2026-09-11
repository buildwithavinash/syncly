import { Route, Routes } from "react-router";
import CreateListPage from "./pages/CreateListPage";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ListPage from "./pages/ListPage";
import InvitePage from "./pages/InvitePage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/create-list"
          element={
            <ProtectedRoute>
              <CreateListPage />
            </ProtectedRoute>
          }
        />

        <Route path="/invite/:token" element={<InvitePage />} />

        <Route
          path="/lists/:id"
          element={
            <ProtectedRoute>
              <ListPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
