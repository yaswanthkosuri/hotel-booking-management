
import React, { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Load the saved theme when the application starts
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("hotelTheme") === "dark";
  });

  // Apply and save the selected theme
  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);

    localStorage.setItem(
      "hotelTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Rooms", icon: "▣" },
    { name: "Customers", icon: "♙" },
    { name: "Bookings", icon: "▤" }
  ];

  return (
    <div className="app-container">

      <aside className="sidebar">

        <div className="brand">
          <span className="brand-icon">YV</span>

          <div>
            <h2>Grand Stay</h2>
            <small>HOTEL MANAGEMENT</small>
          </div>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        {menuItems.map(item => (
          <button
            key={item.name}
            className={`menu-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() => setActivePage(item.name)}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile-circle">HS</div>

          <div>
            <strong>Hotel Staff</strong>
            <small>Administrator</small>
          </div>
        </div>

      </aside>

      <main className="main-content">

        {/* Dark Mode Toggle */}
        <div className="theme-toggle-container">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span>{darkMode ? "☀️" : "🌙"}</span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {activePage === "Dashboard" && <Dashboard />}

        {activePage === "Rooms" && <Rooms />}

        {activePage === "Customers" && <Customers />}

        {activePage === "Bookings" && <Bookings />}

      </main>

    </div>
  );
}

export default App;
