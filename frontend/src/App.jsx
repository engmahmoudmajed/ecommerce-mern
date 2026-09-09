import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import Signup from "./pages/Singup.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import useUserStore from "./stores/useUserStore.js";

function App() {
  const { user, checkAuth, checkInAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Don't render routes until we know whether
  // the user is authenticated or not.
  if (checkInAuth) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="
              absolute left-1/2 top-0
              h-full w-full
              -translate-x-1/2
              bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]
            "
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-50 pt-20">
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />

          {/* Auth pages */}
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/" replace />}
          />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />

          {/* Optional 404 */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}

export default App;

