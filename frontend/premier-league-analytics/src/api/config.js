// Central API configuration for Premier League Analytics app.
// In production (e.g. Netlify deployment), '/api' will be used to hit Netlify Functions.
// In local development, defaults to 'http://localhost:5000/api'.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

export const ML_API_BASE_URL =
  import.meta.env.VITE_ML_API_BASE_URL || "http://127.0.0.1:8000";

export default API_BASE_URL;
