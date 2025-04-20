import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getGoalTransactions = async (goalId) => {
  const url = `${getApiEndpoint("getUserGoalTransactions")}${goalId}`;

  const response = await axiosInstance.get(url);
  return response;
};

export const addGoalTransaction = async (transactionData) => {
  const url = getApiEndpoint("addUserGoalTransaction");

  const response = await axiosInstance.post(url, transactionData);
  return response;
};

export const getFamilyGoalTransactions = async (goalId) => {
  const url = `${getApiEndpoint("getFamilyGoalTransactions")}${goalId}`;
  const response = await axiosInstance.get(url);
  return response;
};

export const addFamilyGoalTransaction = async (transactionData) => {
  const url = getApiEndpoint("addFamilyGoalTransaction");
  const response = await axiosInstance.post(url, transactionData);
  return response;
};
