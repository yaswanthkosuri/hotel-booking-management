
import React, { useEffect, useState } from "react";
import {
  getRooms,
  getCustomers,
  getBookings
} from "../services/api";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [roomData, customerData, bookingData] =
        await Promise.all([
          getRooms(),
          getCustomers(),
          getBookings()
        ]);

      setRooms(roomData);
      setCustomers(customerData);
      setBookings(bookingData);
    } catch (err) {
      setError("Unable to load dashboard data. Check JSON Server.");
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter(
    room => room.status === "Available"
  ).length;

  const bookedRooms = rooms.filter(
    room => room.status === "Booked"
  ).length;

  const totalRevenue = bookings
    .filter(booking => booking.status !== "Cancelled")
    .reduce(
      (total, booking) => total + Number(booking.totalAmount || 0),
      0
    );

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <p className="welcome-text">HOTEL MANAGEMENT</p>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Welcome back! Here's what's happening at your hotel today.
          </p>
        </div>

        <button className="refresh-btn" onClick={loadDashboard}>
          ↻ Refresh
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon room-icon">▣</div>
          <p>Total Rooms</p>
          <h2>{rooms.length}</h2>
          <span>Rooms in the hotel</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon available-icon">✓</div>
          <p>Available Rooms</p>
          <h2>{availableRooms}</h2>
          <span>Ready for booking</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon booked-icon">▤</div>
          <p>Booked Rooms</p>
          <h2>{bookedRooms}</h2>
          <span>Currently marked booked</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon customer-icon">♙</div>
          <p>Total Customers</p>
          <h2>{customers.length}</h2>
          <span>Registered customers</span>
        </div>

      </div>

      <div className="dashboard-lower">

        <div className="panel">
          <h3>Recent Bookings</h3>
          <p className="panel-subtitle">
            Latest reservations made by customers
          </p>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h4>No bookings yet</h4>
              <p>Your reservations will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.slice(-5).reverse().map(booking => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.customerName}</td>
                      <td>{booking.roomNumber}</td>
                      <td>₹{booking.totalAmount}</td>
                      <td>
                        <span className="status-badge">
                          {booking.status || "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel revenue-panel">
          <h3>Booking Overview</h3>
          <p className="panel-subtitle">Current booking summary</p>

          <div className="overview-item">
            <span>Total Bookings</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="overview-item">
            <span>Active Bookings</span>
            <strong>
              {bookings.filter(
                booking => booking.status !== "Cancelled"
              ).length}
            </strong>
          </div>

          <div className="overview-item">
            <span>Cancelled Bookings</span>
            <strong>
              {bookings.filter(
                booking => booking.status === "Cancelled"
              ).length}
            </strong>
          </div>

          <div className="revenue-box">
            <span>Total Booking Amount</span>
            <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
