
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get all records
export const getRooms = async () => {
  const response = await fetch(`${API_URL}/rooms`);
  return response.json();
};

export const getCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);
  return response.json();
};

export const getBookings = async () => {
  const response = await fetch(`${API_URL}/bookings`);
  return response.json();
};

// Add a new record
export const addRoom = async (room) => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(room)
  });

  return response.json();
};

export const addCustomer = async (customer) => {
  const response = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customer)
  });

  return response.json();
};

export const addBooking = async (booking) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(booking)
  });

  return response.json();
};

// Update records
export const updateRecord = async (resource, id, data) => {
  const response = await fetch(`${API_URL}/${resource}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};

// Delete records
export const deleteRecord = async (resource, id) => {
  const response = await fetch(`${API_URL}/${resource}/${id}`, {
    method: "DELETE"
  });

  return response.ok;
};
