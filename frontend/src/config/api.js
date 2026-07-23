// Central API configuration
// In development: prefers an explicit env var, otherwise falls back to localhost:5000.
// If no backend is running locally, the app still opens and the UI can render without crashing.

const fallbackHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  `http://${fallbackHost}:5000`;

export default BACKEND_URL;
