import axios from "axios";

// Ako JSON Server radi na portu 3000, postaviti izvršnu varijablu ili koristiti podrazumevani port
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});