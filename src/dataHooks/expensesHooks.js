import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getUserExpenses = async () => {
  const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
  if (!userId) {
    return {
      error: true,
      message: "User ID not found",
    };
  }

  const url = `${getApiEndpoint("getUserExpenses")}${userId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const addUserExpense = async (expensesData) => {
  const url = getApiEndpoint("addUserExpenses");
  const response = await axiosInstance.post(url, expensesData);
  return response;
};

export const deleteUserExpense = async (expensesId) => {
  const url = `${getApiEndpoint("deleteUserExpenses")}${expensesId}`;
  const response = await axiosInstance.delete(url);
  return response;
};

export const getFamilyExpenses = async () => {
  const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;

  if (!familyId) {
    return {
      error: true,
      message: "Family ID not found",
    };
  }

  const url = `${getApiEndpoint("getFamilyExpenses")}${familyId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const addFamilyExpense = async (expensesData) => {
  const url = getApiEndpoint("addFamilyExpense");
  const response = await axiosInstance.post(url, expensesData);
  return response;
};

export const deleteFamilyExpense = async (expensesId) => {
  const url = `${getApiEndpoint("deleteFamilyExpense")}${expensesId}`;
  const response = await axiosInstance.delete(url);
  return response;
};
