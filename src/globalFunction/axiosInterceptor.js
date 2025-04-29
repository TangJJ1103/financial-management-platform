import axios from "axios";
import { API_BASE_URL } from "../dataHooks/apiEndPoints";

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Create a standardized error response
    const errorResponse = {
      status: 500,
      message: "An unexpected error occurred",
      data: null,
      error: true,
    };

    if (error.message === "Network Error") {
      errorResponse.message =
        "Network error. Please check your internet connection.";

      // Only redirect if we're not already on the NoInternet page
      if (window.location.pathname !== "/noInternet") {
        window.location.href = "/noInternet";
      }

      return Promise.resolve(errorResponse);
    }

    // Handle HTTP errors with response
    if (error.response) {
      errorResponse.status = error.response.status;

      // Extract message from response data if available
      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorResponse.message = error.response.data;
        } else if (error.response.data.message) {
          errorResponse.message = error.response.data.message;
        }
      }

      // Handle specific status codes
      switch (error.response.status) {
        case 400:
          errorResponse.message = errorResponse.message || "Bad Request";
          break;

        case 401:
          errorResponse.message = "Unauthorized: Session expired";
          // Clear session storage
          sessionStorage.clear();
          // Redirect to login page
          window.location.href = "/";
          break;

        case 403:
          errorResponse.message =
            errorResponse.message ||
            "Forbidden: You don't have permission to access this resource";
          break;

        case 404:
          errorResponse.message =
            errorResponse.message ||
            "Not Found: The requested resource was not found";
          break;

        case 405:
          errorResponse.message =
            errorResponse.message ||
            "Incorrect Method: The method is not allowed";
          break;

        case 500:
          errorResponse.message =
            "Server Error: Something went wrong on the server";
          break;
      }
    }

    // Instead of rejecting, return a resolved promise with the error information
    return Promise.resolve(errorResponse);
  }
);

// Add a request interceptor to add the auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
