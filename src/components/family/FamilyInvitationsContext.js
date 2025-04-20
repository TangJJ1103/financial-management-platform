"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getFamilyInvitations } from "../../dataHooks/familyHooks";

// Create the context
const FamilyInvitationsContext = createContext({
  invitations: [],
  invitationCount: 0,
  loading: false,
  error: null,
  fetchInvitations: () => {},
  markInvitationResponded: () => {},
});

export const FamilyInvitationsProvider = ({ children }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch invitations function
  const fetchInvitations = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      const response = await getFamilyInvitations(userId);

      if (response.error) {
        if (showLoading) {
          setError(response.message || "Failed to load invitations");
        }
        console.error("Error fetching invitations:", response.message);
      } else {
        setInvitations(response.data.invitationsData || []);
        setLastFetchTime(new Date());
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      if (showLoading) {
        setError("Failed to load invitations");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Mark an invitation as responded to
  const markInvitationResponded = useCallback((invitationId) => {
    setInvitations((prev) =>
      prev.filter((inv) => inv.invitationId !== invitationId)
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Don't poll if we're on the NoInternet page
    if (window.location.pathname === "/noInternet") return;

    // Check for new invitations every 30 seconds
    const intervalId = setInterval(() => {
      fetchInvitations(false); // Don't show loading state during polling
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchInvitations]);

  // Calculate invitation count
  const invitationCount = invitations.length;

  return (
    <FamilyInvitationsContext.Provider
      value={{
        invitations,
        invitationCount,
        loading,
        error,
        fetchInvitations,
        markInvitationResponded,
      }}
    >
      {children}
    </FamilyInvitationsContext.Provider>
  );
};

// Custom hook to use the family invitations context
export const useFamilyInvitations = () => useContext(FamilyInvitationsContext);
