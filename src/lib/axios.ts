import axios, { AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const httpStatus = error.response?.status ?? 0;
    const backendStatus = error.response?.data?.status;
    const message = error.response?.data?.message ?? error.message;

    return Promise.reject(
      new ApiError(message, httpStatus, backendStatus, error.response?.data)
    );
  }
);
