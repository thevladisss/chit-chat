import axios, { AxiosResponse } from 'axios';
import { formatQueryParams } from '../utils/http.util';

const BASE_PATH = (import.meta.env.VITE_API_URL as string) ?? '';



const client = axios.create({
  withCredentials: true,
  baseURL: BASE_PATH,
  transformResponse: [
    ...axios.defaults.transformResponse,
    (response) => {
      return response.data;
    },
  ],
});

export const getRequest = <R>(
  url: string,
  params: Record<string, string> = {},
  options = {},
): Promise<AxiosResponse<R>> => {

  
  
  return client.get(url, {
    params: formatQueryParams(params),
    ...options,
  });
};

export const postRequest = <R>(
  url: string,
  data: Record<string, any> = {},
  options = {},
): Promise<AxiosResponse<R>> => {
  return client.post(url, data, {
    ...options,
  });
};
