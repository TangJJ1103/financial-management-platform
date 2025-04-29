import axiosInstance from "../globalFunction/axiosInterceptor";
import getApiEndpoint from "./apiEndPoints";

export const getCurrencyConverter = async (
  fromCurrency,
  toCurrency,
  amount
) => {
  const url = getApiEndpoint("convertCurrency");

  const response = await axiosInstance.post(url, {
    fromCurrency,
    toCurrency,
    amount,
  });

  return response;
};

export const getCurrencyList = async () => {
  const url = getApiEndpoint("getCurrencyList");
  const response = await axiosInstance.get(url);
  return response;
};
