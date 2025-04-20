import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const validateLogin = async (user) => {
  const url = getApiEndpoint("login");

  const response = await axiosInstance.post(url, user);
  return response;
};

export const userRegister = async (user) => {
  const url = getApiEndpoint("register");
  const response = await axiosInstance.post(url, user);
  return response;
};
