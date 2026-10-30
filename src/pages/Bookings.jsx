
import React, { useEffect, useState } from "react";

import {
  getBookings,
  getRooms,
  getCustomers,
  addBooking,
  updateRecord
} from "../services/api";

const emptyForm = {
  customerId: "",
  roomId: "",
  checkIn: "",
  checkOut: ""
};

// Get today's date
function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Calculate booking days
function calculateDays(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);

  const start = Date.UTC(y1, m1 - 1, d1);
  const end = Date.UTC(y2, m2 - 1, d2);

  return Math.round((end - start) / 86400000);
}

// Generate IDs like BK001, BK002, BK003
function generateBookingId(bookings) {
  const existingIds = bookings.map(booking =>
    String(booking.id)
  );

  let number = 1;
  let newId;

  do {
    newId = "BK" + String(number).padStart(3, "0");
    number++;
  } while (existingIds.includes(newId));

  return newId;
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [bookingData, roomData, customerData] =
        await Promise.all([
          getBookings(),
          getRooms(),
          getCustomers()
        ]);

      setBookings(bookingData);
      setRooms(roomData);
      setCustomers(customerData);
    } catch (err) {
      setError("Unable to load booking information.");
    } finally {
      setLoading(false);
    }
  };

  // Selected room
  const selectedRoom = rooms.find(
    room => String(room.id) === String(form.roomId)
  );

  // Calculate amount
  const days = calculateDays(form.checkIn, form.checkOut);

  const totalAmount =
    selectedRoom && days > 0
      ? Number(selectedRoom.price) * days
      : 0;

  // Open booking form
  const openBookingForm = () => {
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  // Handle input changes
  const handleChange = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  // Create booking
  const handleSubmit = async event => {
    event.preventDefault();

    setError("");
    setMessage("");

    const customer = customers.find(
      item => String(item.id) === String(form.customerId)
    );

    const room = rooms.find(
      item => String(item.id) === String(form.roomId)
    );

    const bookingDays = calculateDays(
      form.checkIn,
      form.checkOut
    );

    if (!customer || !room) {
      setError("Please select a customer and room.");
      return;
    }

    if (room.status !== "Available") {
      setError("This room is not available.");
      await loadData();
      return;
    }

    if (form.checkIn < getToday()) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    if (bookingDays <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    // Generate custom booking ID
    const newBookingId = generateBookingId(bookings);

    const booking = {
      id: newBookingId,
      customerId: String(customer.id),
      customerName: customer.name,
      roomId: String(room.id),
      roomNumber: room.roomNumber,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      days: bookingDays,
      pricePerDay: Number(room.price),
      totalAmount: Number(room.price) * bookingDays,
      status: "Confirmed"
    };

    try {
      // Save booking
      await addBooking(booking);

      // Update room status
      await updateRecord("rooms", room.id, {
        ...room,
        status: "Booked"
      });

      setMessage(
        `Booking ${newBookingId} created successfully!`
      );

      setShowForm(false);
      setForm(emptyForm);

      await loadData();

    } catch (err) {
      setError("Unable to create booking. Please try again.");
      await loadData();
    }
  };

  // Cancel booking
  const cancelBooking = async booking => {
    if (booking.status === "Cancelled") return;

    const confirmed = window.confirm(
      `Cancel booking ${booking.id}?`
    );

    if (!confirmed) return;

    try {
      await updateRecord("bookings", booking.id, {
        ...booking,
        status: "Cancelled"
      });

      const room = rooms.find(
        item => String(item.id) === String(booking.roomId)
      );

      if (room) {
        await updateRecord("rooms", room.id, {
          ...room,
          status: "Available"
        });
      }

      setMessage("Booking cancelled successfully.");

      await loadData();

    } catch (err) {
      setError("Unable to cancel booking.");
      await loadData();
    }
  };

  // Search bookings
  const filteredBookings = bookings.filter(booking => {
    const text = search.toLowerCase();

    return (
      String(booking.id).toLowerCase().includes(text) ||
      String(booking.customerName || "").toLowerCase().includes(text) ||
      String(booking.roomNumber || "").toLowerCase().includes(text) ||
      String(booking.status || "").toLowerCase().includes(text)
    );
  });

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings-page">

      <div className="bookings-header">
        <div>
          <p className="welcome-text">HOTEL MANAGEMENT</p>
          <h1>Booking Management</h1>
          <p className="subtitle">
            Create, view and manage hotel reservations.
          </p>
        </div>

        <button
          className="add-booking-btn"
          onClick={openBookingForm}
        >
          + Create Booking
        </button>
      </div>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="booking-summary">

        <div className="booking-summary-card">
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </div>

        <div className="booking-summary-card">
          <span>Confirmed Bookings</span>
          <strong>
            {bookings.filter(b => b.status === "Confirmed").length}
          </strong>
        </div>

        <div className="booking-summary-card">
          <span>Cancelled Bookings</span>
          <strong>
            {bookings.filter(b => b.status === "Cancelled").length}
          </strong>
        </div>

      </div>

      <div className="bookings-panel">

        <h3>All Bookings</h3>

        <p className="panel-subtitle">
          Search and manage customer reservations.
        </p>

        <div className="booking-search">
          <input
            type="text"
            placeholder="Search by booking ID, customer, room or status..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>

            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Days</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-customers">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong></td>
                    <td>{booking.customerName}</td>
                    <td>{booking.roomNumber}</td>
                    <td>{booking.checkIn}</td>
                    <td>{booking.checkOut}</td>
                    <td>{booking.days}</td>
                    <td>
                      ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span className={
                        booking.status === "Confirmed"
                          ? "booking-status confirmed"
                          : "booking-status cancelled"
                      }>
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      {booking.status === "Confirmed" ? (
                        <button
                          className="delete-btn"
                          onClick={() => cancelBooking(booking)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="cancelled-label">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        <p className="room-count">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>

      </div>

      {showForm && (
        <div className="form-overlay">

          <div className="room-form-card booking-form-card">

            <div className="form-heading">
              <div>
                <h2>Create New Booking</h2>
                <p>Enter the reservation details below.</p>
              </div>

              <button
                className="close-btn"
                type="button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Select Customer</label>

              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a customer</option>

                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>

              <label>Select Available Room</label>

              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                required
              >
                <option value="">Choose an available room</option>

                {rooms
                  .filter(room => room.status === "Available")
                  .map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.roomType} - ₹{room.price}/day
                    </option>
                  ))}
              </select>

              <label>Check-in Date</label>

              <input
                type="date"
                name="checkIn"
                min={getToday()}
                value={form.checkIn}
                onChange={handleChange}
                required
              />

              <label>Check-out Date</label>

              <input
                type="date"
                name="checkOut"
                min={form.checkIn || getToday()}
                value={form.checkOut}
                onChange={handleChange}
                required
              />

              <div className="booking-calculation">

                <div>
                  <span>Number of Days</span>
                  <strong>{days > 0 ? days : 0}</strong>
                </div>

                <div>
                  <span>Price Per Day</span>
                  <strong>
                    ₹{selectedRoom ? Number(selectedRoom.price).toLocaleString("en-IN") : 0}
                  </strong>
                </div>

                <div className="booking-total">
                  <span>Total Amount</span>
                  <strong>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>

              </div>

              {customers.length === 0 && (
                <p className="error-message">
                  Add a customer before creating a booking.
                </p>
              )}

              {!rooms.some(room => room.status === "Available") && (
                <p className="error-message">
                  No available rooms.
                </p>
              )}

              <div className="form-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    customers.length === 0 ||
                    !rooms.some(room => room.status === "Available")
                  }
                >
                  Confirm Booking
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Bookings;
