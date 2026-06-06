import axios from "axios";

const API = "https://medinest-t13z.onrender.com/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function getMedicines() {
  const response = await axios.get(`${API}/medicines`);
  return response.data;
}

export async function getMedicineById(id) {
  const response = await axios.get(`${API}/medicines/${id}`);
  return response.data;
}

export async function createMedicine(payload) {
  const response = await axios.post(
    `${API}/medicines`,
    payload,
    getHeaders()
  );

  return response.data;
}

export async function deleteMedicine(id) {
  const response = await axios.delete(
    `${API}/medicines/${id}`,
    getHeaders()
  );

  return response.data;
}