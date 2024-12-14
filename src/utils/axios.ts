import axios from "axios";

console.log("Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

const instance = axios.create({
  baseURL: "https://bookchangerbackend.onrender.com/api",
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
