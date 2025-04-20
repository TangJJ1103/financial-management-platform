import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getUserBudget = async () => {
  const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
  if (!userId) {
    return {
      error: true,
      message: "User ID not found",
    };
  }

  const url = `${getApiEndpoint("getUserBudgets")}${userId}`;

  const response = await axiosInstance.get(url);
  console.log(response);
  return response;
};

export const addUserBudget = async (budgetData) => {
  const url = getApiEndpoint("addUserBudget");

  const response = await axiosInstance.post(url, budgetData);
  return response;
};

export const updateUserBudget = async (budgetData) => {
  const url = getApiEndpoint("updateUserBudget");

  const response = await axiosInstance.patch(url, budgetData);
  return response;
};

export const deleteUserBudget = async (budgetId) => {
  const url = `${getApiEndpoint("deleteUserBudget")}${budgetId}`;

  const response = await axiosInstance.delete(url);
  return response;
};

export const getFamilyBudget = async () => {
  const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;

  if (!familyId) {
    return {
      error: true,
      message: "Family ID not found",
    };
  }

  const url = `${getApiEndpoint("getFamilyBudgets")}${familyId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const addFamilyBudget = async (budgetData) => {
  const url = getApiEndpoint("addFamilyBudget");
  const response = await axiosInstance.post(url, budgetData);
  return response;
};

export const updateFamilyBudget = async (budgetData) => {
  const url = getApiEndpoint("updateFamilyBudget");
  const response = await axiosInstance.patch(url, budgetData);
  return response;
};

export const deleteFamilyBudget = async (budgetId) => {
  const url = `${getApiEndpoint("deleteFamilyBudget")}${budgetId}`;
  const response = await axiosInstance.delete(url);
  return response;
};
