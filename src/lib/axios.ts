import axios, { AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/common';
import { getQuotaConfig, triggerQuotaUpgradeModal } from '@/constants/quota-limits';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ilms.page/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
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
    const responseData = error.response?.data as
      | { status?: number; error?: string; message?: string }
      | undefined;
    const backendStatus = responseData?.status;
    const errorCode = typeof responseData?.error === 'string' ? responseData.error : undefined;
    const message = responseData?.message ?? error.message;

    // Tự động phát hiện lỗi chạm trần hạn mức (Quota Limits) và kích hoạt Modal nâng cấp
    const quotaConfig = getQuotaConfig(errorCode || message);
    if (quotaConfig) {
      triggerQuotaUpgradeModal({
        errorCode: quotaConfig.code,
        message: responseData?.message || quotaConfig.message,
        status: httpStatus || quotaConfig.status,
      });
    }

    return Promise.reject(
      new ApiError(message, httpStatus, backendStatus, error.response?.data, errorCode)
    );
  }
);
