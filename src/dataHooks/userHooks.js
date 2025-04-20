import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getUserById = async () => {
  const userId = JSON.parse(sessionStorage.getItem("user")).userId;
  const url = getApiEndpoint("getUserById") + userId;
  const response = await axiosInstance.get(url);
  return response;
};

export const updateUser = async (updateData) => {
  const url = getApiEndpoint("updateUser");
  const response = await axiosInstance.put(url, updateData);
  return response;
};
