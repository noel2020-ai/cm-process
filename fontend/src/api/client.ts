import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return typeof error.response?.data?.detail === "string"
      ? error.response.data.detail
      : error.message;
  }
  return "Unexpected error";
};

