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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

  useEffect(() => {
    const checkConnection = async () => {
      // Don't check if we're already on the NoInternet page
      if (window.location.pathname === "/noInternet") return;

      if (!navigator.onLine) return;

      try {
        const result = await getServerPing();

        if (result.isOnline) {
          if (!isOnline) {
            setIsOnline(true);
            setLastOnlineTime(new Date());
          }
        } else {
          setIsOnline(false);
          if (window.location.pathname !== "/noInternet") {
            navigate("/noInternet");
          }
        }
      } catch (error) {
        setIsOnline(false);
        if (window.location.pathname !== "/noInternet") {
          navigate("/noInternet");
        }
      }
    };

    const intervalId = setInterval(checkConnection, 60000);

    return () => clearInterval(intervalId);
  }, [isOnline, navigate]);

  useEffect(() => {
    const checkFamilyStatus = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const hasFamily = sessionStorage.getItem("hasFamily") === "true";
      const familyRole = sessionStorage.getItem("familyRole");
      if (!user || !user.userId) return;

      try {
        const result = await checkUserFamilyStatus(user.userId);

        if (result.hasFamily && !hasFamily) {
          sessionStorage.setItem("hasFamily", result.hasFamily);
          sessionStorage.setItem("family", JSON.stringify(result.family));
          sessionStorage.setItem("familyRole", result.familyRole);

          window.dispatchEvent(
            new CustomEvent("familyStatusChanged", {
              detail: {
                hasFamily: result.hasFamily,
                family: result.family,
                role: result.familyRole,
              },
            })
          );

          if (window.location.pathname === "/family/invitations") {
            navigate("/family/viewExpenses");
          }
        } else if (!result.hasFamily && hasFamily) {
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
        } else if (
          result.familyRole !== familyRole &&
          result.hasFamily &&
          hasFamily
        ) {
          sessionStorage.setItem("familyRole", result.familyRole);
          window.dispatchEvent(
            new CustomEvent("familyStatusChanged", {
              detail: {
                familyRole: result.familyRole,
              },
            })
          );
        }
      } catch (error) {
        console.error("Error checking family status:", error);
      }
    };

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
