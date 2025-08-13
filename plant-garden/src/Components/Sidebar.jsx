import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGame } from "../App";
import "./Styles/Sidebar.css";

export default function Sidebar() {
  const {
    coins,
    level,
    experience,
    achievements,
    logout,
    harvestedFlowers,
    gardenSlots,
  } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  // Calculate progress to next level
  const experienceForNextLevel = level * 100;
  const currentLevelExp = experience - (level - 1) * 100;
  const progressPercentage = (currentLevelExp / 100) * 100;

  // Check for ready plants and generate notifications
  useEffect(() => {
    const readyPlants = gardenSlots.filter((slot) => {
      if (slot.stage === "empty") return false;
      return slot.nextStageReadyAt && Date.now() >= slot.nextStageReadyAt;
    });

    const newNotifications = [];

    if (readyPlants.length > 0) {
      newNotifications.push({
        id: "ready-plants",
        message: `${readyPlants.length} plant${
          readyPlants.length > 1 ? "s" : ""
        } ready!`,
        type: "success",
        icon: "🌱",
      });
    }

    const maturePlants = gardenSlots.filter(
      (slot) => slot.stage === "mature"
    ).length;
    if (maturePlants > 0) {
      newNotifications.push({
        id: "mature-plants",
        message: `${maturePlants} plant${
          maturePlants > 1 ? "s" : ""
        } ready to harvest!`,
        type: "harvest",
        icon: "🌸",
      });
    }

    setNotifications(newNotifications);
  }, [gardenSlots]);

  // Navigation items with enhanced info
  const navigationItems = [
    {
      path: "/garden",
      icon: "🌱",
      label: "Garden",
      badge:
        gardenSlots.filter((slot) => slot.stage === "mature").length || null,
    },
    {
      path: "/my-plants",
      icon: "🌼",
      label: "My Plants",
      badge:
        gardenSlots.filter((slot) => slot.stage !== "empty").length || null,
    },
    {
      path: "/harvested",
      icon: "💐",
      label: "Harvested",
      badge: harvestedFlowers.reduce((sum, f) => sum + f.count, 0) || null,
    },
    {
      path: "/bouquets",
      icon: "🎀",
      label: "Bouquets",
      badge: null,
    },
    {
      path: "/shop",
      icon: "🏪",
      label: "Shop",
      badge: null,
    },
  ];

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
          <header className="sidebar-header">
            <h2>🌿 Virtual Garden</h2>
            <p>Level {level} Gardener</p>

            {/* Experience Bar */}
            <div className="experience-bar">
              <div className="exp-bar-container">
                <div
                  className="exp-bar-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="exp-text">{currentLevelExp}/100 XP</span>
            </div>

            {/* Coins Display */}
            <div className="coins-display">
              <span className="coins-icon">🪙</span>
              <span className="coins-amount">{coins.toLocaleString()}</span>
            </div>
          </header>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notifications">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification ${notification.type}`}
                >
                  <span className="notification-icon">{notification.icon}</span>
                  <span className="notification-message">
                    {notification.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <nav className="nav-buttons">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                className={`nav-button ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          {/* Achievements Preview */}
          {achievements.length > 0 && (
            <div className="achievements-preview">
              <h4>🏆 Recent Achievement</h4>
              <div className="achievement-item">
                {achievements[achievements.length - 1]}
              </div>
              <small>{achievements.length} total achievements</small>
            </div>
          )}

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">🌱</span>
              <span className="stat-value">
                {gardenSlots.filter((slot) => slot.stage !== "empty").length}
              </span>
              <span className="stat-label">Growing</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💐</span>
              <span className="stat-value">
                {harvestedFlowers.reduce((sum, f) => sum + f.count, 0)}
              </span>
              <span className="stat-label">Harvested</span>
            </div>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
