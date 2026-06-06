import axios from "axios";

const API = "http://localhost:7000/api";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API}/auth/login`, {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API}/auth/register`, {
      name,
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    throw error;
  }
};
