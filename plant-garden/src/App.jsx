import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Garden from "./Pages/Garden";
import MyPlants from "./Pages/MyPlants";
import Harvested from "./Pages/Harvest";
import Bouquets from "./Pages/Bouquet";
import Shop from "./Pages/Shop";
import Login from "./Pages/Login";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // Listen for login/logout changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="app-container">
        {isLoggedIn && <Sidebar />}

        <div className={`main-content ${isLoggedIn ? "with-sidebar" : ""}`}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {isLoggedIn ? (
              <>
                <Route path="/" element={<Garden />} />
                <Route path="/garden" element={<Garden />} />
                <Route path="/my-plants" element={<MyPlants />} />
                <Route path="/harvested" element={<Harvested />} />
                <Route path="/bouquets" element={<Bouquets />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
