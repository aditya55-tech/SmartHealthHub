import axios from "axios";

const API = "http://localhost:7000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function getOrders() {
  const response = await axios.get(`${API}/orders`, getHeaders());
  return response.data;
}

export async function getOrderById(id) {
  const response = await axios.get(`${API}/orders/${id}`, getHeaders());
  return response.data;
}

export async function createOrder(payload) {
  const response = await axios.post(`${API}/orders`, payload, getHeaders());
  return response.data;
}
