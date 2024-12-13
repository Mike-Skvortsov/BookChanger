import axios from "axios";
console.log("Base URL:", process.env.API_BASE_URL);

const instance = axios.create({
  baseURL: process.env.API_BASE_URL + "/api",
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
