import axios, { AxiosInstance } from "axios";

export const clientAxios: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
