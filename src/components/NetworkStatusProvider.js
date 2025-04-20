"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import getServerPing from "../dataHooks/getServerPing";
import { checkUserFamilyStatus } from "../dataHooks/familyHooks"; // Import the new function

// Create context
const NetworkStatusContext = createContext({
  isOnline: true,
  lastOnlineTime: null,
});

export const NetworkStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(
    isOnline ? new Date() : null
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Only navigate if we're not already on the NoInternet page
      // and we're not on the login page
      if (
        window.location.pathname !== "/noInternet" &&
        window.location.pathname !== "/"
      ) {
        navigate("/noInternet");
      }
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

  // Periodically check connection by making a small request
  useEffect(() => {
    const checkConnection = async () => {
      // Don't check if we're already on the NoInternet page
      if (window.location.pathname === "/noInternet") return;

      if (!navigator.onLine) return;

      try {
        // Use the getServerPing function instead of direct fetch
        const result = await getServerPing();

        if (result.isOnline) {
          // We're online
          if (!isOnline) {
            setIsOnline(true);
            setLastOnlineTime(new Date());
          }
        } else {
          // Connection failed
          console.log("Connection check failed:", result.error);
          setIsOnline(false);
          // Only navigate if we're not already on the NoInternet page
          if (window.location.pathname !== "/noInternet") {
            navigate("/noInternet");
          }
        }
      } catch (error) {
        console.log("Connection check failed:", error);
        setIsOnline(false);
        // Only navigate if we're not already on the NoInternet page
        if (window.location.pathname !== "/noInternet") {
          navigate("/noInternet");
        }
      }
    };

    // Reduce check frequency to prevent excessive requests
    const intervalId = setInterval(checkConnection, 60000); // Check every minute instead of 30 seconds

    return () => clearInterval(intervalId);
  }, [isOnline, navigate]);

  // Periodically check if the user's family status has changed
  useEffect(() => {
    const checkFamilyStatus = async () => {
      // Only check if user is logged in
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.userId) return;

      try {
        const result = await checkUserFamilyStatus(user.userId);

        if (result.hasFamily) {
          sessionStorage.setItem("hasFamily", result.hasFamily);
          sessionStorage.setItem("family", JSON.stringify(result.family));
          sessionStorage.setItem("familyRole", result.familyRole);

          // Dispatch a custom event to notify components about the change
          window.dispatchEvent(
            new CustomEvent("familyStatusChanged", {
              detail: {
                hasFamily: result.hasFamily,
                family: result.family,
                role: result.familyRole,
              },
            })
          );

          // Show notification to user
          if (window.location.pathname === "/family/invitations") {
            // If on invitations page, navigate to family dashboard
            navigate("/family/viewExpenses");
          } else {
            // Otherwise just show a notification (you could implement this with a toast)
            console.log("Your family request has been accepted!");
          }
        } else {
          sessionStorage.setItem("hasFamily", result.hasFamily);
          sessionStorage.removeItem("family");
          sessionStorage.removeItem("familyRole");
          window.dispatchEvent(
            new CustomEvent("familyStatusChanged", {
              detail: {
                hasFamily: result.hasFamily,
              },
            })
          );
        }
      } catch (error) {
        console.error("Error checking family status:", error);
      }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkFamilyStatus, 10000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, lastOnlineTime }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Custom hook to use the network status
export const useNetworkStatus = () => useContext(NetworkStatusContext);

export default NetworkStatusProvider;
