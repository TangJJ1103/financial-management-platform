import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

// Create a new family
export const createFamily = async (familyData) => {
  const url = getApiEndpoint("createFamily");
  const response = await axiosInstance.post(url, familyData);
  return response;
};

// Search for families by name or tag
export const searchFamilies = async (nameAndTag) => {
  const url = getApiEndpoint("searchFamilies");
  console.log(sessionStorage.getItem("authToken"));
  console.log(nameAndTag);
  const response = await axiosInstance.post(url, nameAndTag);
  return response;
};

// Join an existing family
export const joinFamily = async (joinData) => {
  const url = getApiEndpoint("joinFamily");
  const response = await axiosInstance.post(url, joinData);
  return response;
};

// Invite a user to join a family
export const inviteToFamily = async (inviteData) => {
  const url = getApiEndpoint("inviteToFamily");
  const response = await axiosInstance.post(url, inviteData);
  return response;
};

export const getFamilyMembers = async (familyId) => {
  const url = `${getApiEndpoint("getFamilyMembers")}${familyId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const removeFamilyMember = async (userId) => {
  const url = `${getApiEndpoint("removeFamilyMember")}${userId}`;
  const response = await axiosInstance.delete(url);
  return response;
};

// Get family invitations for the current user
export const getFamilyInvitations = async (userId) => {
  const url = `${getApiEndpoint("getFamilyInvitations")}${userId}`;
  const response = await axiosInstance.get(url);
  return response;
};

// Respond to a family invitation (accept/reject)
export const respondToInvitation = async (invitationData) => {
  const url = getApiEndpoint("respondToInvitation");
  const response = await axiosInstance.post(url, invitationData);
  return response;
};

// Get join requests for a family
export const getJoinRequests = async (familyId) => {
  const url = `${getApiEndpoint("getJoinRequests")}${familyId}`;
  const response = await axiosInstance.get(url);
  return response;
};

// Respond to a join request (accept/reject)
export const respondToJoinRequest = async (joinRequestData) => {
  const url = getApiEndpoint("respondToJoinRequest");
  const response = await axiosInstance.post(url, joinRequestData);
  return response;
};

// Check if user's family status has changed (for real-time updates)
export const checkUserFamilyStatus = async (userId) => {
  const url = `${getApiEndpoint("checkUserFamilyStatus")}${userId}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const updateFamilyRole = async (roleData) => {
  const url = getApiEndpoint("updateFamilyRole");
  const response = await axiosInstance.put(url, roleData);
  return response;
};
