import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getUserGoals = async () => {
  const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
  if (!userId) {
    return {
      error: true,
      message: "User ID not found",
    };
  }

  const url = `${getApiEndpoint("getUserGoals")}${userId}`;

  const response = await axiosInstance.get(url);
  return response;
};

export const addUserGoal = async (goalData) => {
  const url = getApiEndpoint("addUserGoal");

  const response = await axiosInstance.post(url, goalData);
  return response;
};

export const updateUserGoal = async (goalData) => {
  const url = getApiEndpoint("updateUserGoal");

  const response = await axiosInstance.put(url, goalData);
  return response;
};

export const deleteUserGoal = async (goalId) => {
  const url = `${getApiEndpoint("deleteUserGoal")}${goalId}`;

  const response = await axiosInstance.delete(url);
  return response;
};

export const getFamilyGoals = async () => {
  const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;

  if (!familyId) {
    return {
      error: true,
      message: "Family ID not found",
    };
  }

  const url = `${getApiEndpoint("getFamilyGoals")}${familyId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const addFamilyGoal = async (goalData) => {
  const url = getApiEndpoint("addFamilyGoal");
  const response = await axiosInstance.post(url, goalData);
  return response;
};

export const updateFamilyGoal = async (goalData) => {
  const url = getApiEndpoint("updateFamilyGoal");
  const response = await axiosInstance.put(url, goalData);
  return response;
};

export const deleteFamilyGoal = async (goalId) => {
  const url = `${getApiEndpoint("deleteFamilyGoal")}${goalId}`;
  const response = await axiosInstance.delete(url);
  return response;
};
