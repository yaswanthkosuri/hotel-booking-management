
import React, { useEffect, useState } from "react";
import {
  getCustomers,
  addCustomer,
  updateRecord,
  deleteRecord
} from "../services/api";

const emptyCustomer = {
  name: "",
  email: "",
  phone: ""
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError("Unable to load customers. Check JSON Server.");
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
    setForm(emptyCustomer);
    setEditingId(null);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });

    setEditingId(customer.id);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const customerData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim()
    };

    if (!customerData.name) {
      setError("Please enter the customer name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(customerData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const duplicateEmail = customers.some(
      customer =>
        customer.email.toLowerCase() === customerData.email &&
        String(customer.id) !== String(editingId)
    );

    if (duplicateEmail) {
      setError("This email address is already registered.");
      return;
    }

    try {
      if (editingId !== null) {
        await updateRecord("customers", editingId, {
          id: editingId,
          ...customerData
        });

        setMessage("Customer updated successfully.");
      } else {
        await addCustomer({
          id: String(Date.now()),
          ...customerData
        });

        setMessage("Customer added successfully.");
      }

      setShowForm(false);
      setForm(emptyCustomer);
      setEditingId(null);

      await loadCustomers();
    } catch (err) {
      setError("Unable to save customer. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      await deleteRecord("customers", id);
      setMessage("Customer deleted successfully.");
      await loadCustomers();
    } catch (err) {
      setError("Unable to delete customer.");
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchText = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchText) ||
      customer.email.toLowerCase().includes(searchText) ||
      customer.phone.includes(searchText)
    );
  });

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-page">

      <div className="customers-header">
        <div>
          <p className="welcome-text">HOTEL MANAGEMENT</p>
          <h1>Customer Management</h1>
          <p className="subtitle">
            Manage customer information and registration details.
          </p>
        </div>

        <button
          className="add-customer-btn"
          onClick={openAddForm}
        >
          + Add Customer
        </button>
      </div>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="customer-summary">
        <div className="customer-summary-card">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div className="customer-summary-card">
          <span>Registered Emails</span>
          <strong>
            {new Set(customers.map(customer => customer.email.toLowerCase())).size}
          </strong>
        </div>

        <div className="customer-summary-card">
          <span>Registered Phone Numbers</span>
          <strong>
            {new Set(customers.map(customer => customer.phone)).size}
          </strong>
        </div>
      </div>

      <div className="customers-panel">

        <h3>All Customers</h3>

        <p className="panel-subtitle">
          View, search and manage registered customers.
        </p>

        <div className="customer-search">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-customers">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>#{customer.id}</td>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>{customer.email}</td>

                    <td>{customer.phone}</td>

                    <td>
                      <div className="customer-actions">

                        <button
                          className="edit-btn"
                          onClick={() => openEditForm(customer)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(customer.id)}
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
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>

      </div>

      {showForm && (
        <div className="form-overlay">

          <div className="room-form-card">

            <div className="form-heading">
              <div>
                <h2>
                  {editingId !== null ? "Edit Customer" : "Add New Customer"}
                </h2>

                <p>Enter the customer information below.</p>
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

              <label>Customer Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                required
              />

              <div className="form-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {editingId !== null ? "Update Customer" : "Save Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Customers;
