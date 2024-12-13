import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ecommercebackend1-bs8uqau8.b4a.run",

  // baseURL: "http://localhost:8000/",
  withCredentials: true,
});
export default axiosInstance;
