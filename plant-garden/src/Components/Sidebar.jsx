import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/Sidebar.css";

export default function Sidebar() {
  const [coins] = useState(50);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <span className={`hamburger ${isOpen ? "active" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-inner">
          <header>
            <h2>🌿 Virtual Garden</h2>
            <p>Let your flowers bloom</p>
          </header>

          <nav className="nav-buttons">
            <button onClick={() => handleNavigation("/garden")}>
              🌱 Garden
            </button>
            <button onClick={() => handleNavigation("/my-plants")}>
              🌼 My Plants
            </button>
            <button onClick={() => handleNavigation("/harvested")}>
              💐 Bouquets
            </button>
            <button onClick={() => handleNavigation("/bouquets")}>
              🪙 Shop
            </button>
          </nav>

          <div className="coins">🪙 {coins} Coins</div>
        </div>
      </aside>
    </>
  );
}
