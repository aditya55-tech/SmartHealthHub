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

export async function submitPrescription(formData) {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API}/prescriptions`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getPrescriptions() {
  const response = await axios.get(`${API}/prescriptions`, getHeaders());
  return response.data;
}

export async function updatePrescriptionStatus(id, status) {
  const response = await axios.put(
    `${API}/prescriptions/${id}`,
    { status },
    getHeaders()
  );
  return response.data;
}
