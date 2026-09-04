// Central API configuration for Premier League Analytics app.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://premier-league-gwer.onrender.com/api");

export const ML_API_BASE_URL =
  import.meta.env.VITE_ML_API_BASE_URL || "http://127.0.0.1:8000";

export default API_BASE_URL;
