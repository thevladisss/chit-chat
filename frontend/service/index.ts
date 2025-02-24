import axios, { AxiosResponse } from 'axios';

const BASE_PATH = (import.meta.env.VITE_API_URL as string) ?? '';

const client = axios.create({
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
    params: {
      ...params,
    },
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
