
import React, { useEffect, useState } from "react";
import {
  getRooms,
  addRoom,
  updateRecord,
  deleteRecord
} from "../services/api";

const emptyRoom = {
  roomNumber: "",
  roomType: "Single",
  price: "",
  capacity: "1",
  status: "Available"
};

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyRoom);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError("Unable to load rooms. Check whether JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const openAddForm = () => {
    setForm(emptyRoom);
    setEditingId(null);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (room) => {
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
      capacity: room.capacity,
      status: room.status
    });

    setEditingId(room.id);
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const roomNumber = form.roomNumber.trim();

    if (!roomNumber || Number(form.price) <= 0 || Number(form.capacity) < 1) {
      setError("Please enter valid room details.");
      return;
    }

    const duplicate = rooms.some(
      room =>
        room.roomNumber.toLowerCase() === roomNumber.toLowerCase() &&
        String(room.id) !== String(editingId)
    );

    if (duplicate) {
      setError("This room number already exists.");
      return;
    }

    const roomData = {
      roomNumber,
      roomType: form.roomType,
      price: Number(form.price),
      capacity: Number(form.capacity),
      status: form.status
    };

    try {
      if (editingId !== null) {
        await updateRecord("rooms", editingId, {
          id: editingId,
          ...roomData
        });
        setMessage("Room updated successfully.");
      } else {
        await addRoom({
          id: String(Date.now()),
          ...roomData
        });
        setMessage("Room added successfully.");
      }

      setShowForm(false);
      setForm(emptyRoom);
      setEditingId(null);
      await loadRooms();
    } catch (err) {
      setError("Unable to save room. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    try {
      await deleteRecord("rooms", id);
      setMessage("Room deleted successfully.");
      await loadRooms();
    } catch (err) {
      setError("Unable to delete room.");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || room.roomType === typeFilter;

    const matchesStatus =
      statusFilter === "All" || room.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }

  return (
    <div className="rooms-page">

      <div className="rooms-header">
        <div>
          <p className="welcome-text">HOTEL MANAGEMENT</p>
          <h1>Room Management</h1>
          <p className="subtitle">
            Manage your hotel rooms and their availability.
          </p>
        </div>

        <button className="add-room-btn" onClick={openAddForm}>
          + Add New Room
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="room-summary">
        <div className="room-summary-card">
          <span>Total Rooms</span>
          <strong>{rooms.length}</strong>
        </div>

        <div className="room-summary-card">
          <span>Available</span>
          <strong>
            {rooms.filter(room => room.status === "Available").length}
          </strong>
        </div>

        <div className="room-summary-card">
          <span>Booked</span>
          <strong>
            {rooms.filter(room => room.status === "Booked").length}
          </strong>
        </div>
      </div>

      <div className="rooms-panel">

        <h3>All Rooms</h3>
        <p className="panel-subtitle">
          View, search, filter and manage hotel rooms.
        </p>

        <div className="room-filters">
          <input
            type="text"
            placeholder="Search room number..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value)}
          >
            <option value="All">All Room Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Room Type</th>
                <th>Price / Day</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-rooms">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => (
                  <tr key={room.id}>
                    <td><strong>{room.roomNumber}</strong></td>
                    <td>{room.roomType}</td>
                    <td>₹{Number(room.price).toLocaleString("en-IN")}</td>
                    <td>{room.capacity} Person(s)</td>
                    <td>
                      <span className={
                        room.status === "Available"
                          ? "room-status available"
                          : "room-status booked"
                      }>
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="room-actions">
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm(room)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(room.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="room-count">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </p>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="room-form-card">

            <div className="form-heading">
              <div>
                <h2>{editingId !== null ? "Edit Room" : "Add New Room"}</h2>
                <p>Enter the room information below.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                placeholder="Example: 104"
                value={form.roomNumber}
                onChange={handleChange}
                required
              />

              <label>Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>

              <label>Price Per Day (₹)</label>
              <input
                type="number"
                name="price"
                min="1"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
                required
              />

              <label>Room Capacity</label>
              <input
                type="number"
                name="capacity"
                min="1"
                placeholder="Number of people"
                value={form.capacity}
                onChange={handleChange}
                required
              />

              <label>Room Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
              </select>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {editingId !== null ? "Update Room" : "Save Room"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Rooms;
