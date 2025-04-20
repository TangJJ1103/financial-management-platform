import axios from "axios";
import { API_BASE_URL } from "./apiEndPoints";

/**
 * Simple function to check server connectivity
 * @returns {Promise<{isOnline: boolean, error: string|null}>}
 */
const getServerPing = async () => {
  try {
    // Create a timeout promise that rejects after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });

    // Use an existing endpoint instead of a dedicated ping endpoint
    // This could be any lightweight endpoint in your API that returns quickly
    const requestPromise = axios.get(`${API_BASE_URL}/currency/getAllType`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    // Race the timeout against the request
    const response = await Promise.race([requestPromise, timeoutPromise]);

    return {
      isOnline: true,
      error: null,
    };
  } catch (error) {
    console.error("Server ping failed:", error);
    return {
      isOnline: false,
      error: error.message || "Connection failed",
    };
  }
};

export default getServerPing;
