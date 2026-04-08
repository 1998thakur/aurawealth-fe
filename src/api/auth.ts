import apiClient from './client';
import type { AuthResponse, LoginRequest, OtpRequestPayload, OtpVerifyPayload, RegisterRequest, User } from '../types/auth';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  requestOtp: async (data: OtpRequestPayload): Promise<void> => {
    await apiClient.post('/auth/otp/request', data);
  },

  verifyOtp: async (data: OtpVerifyPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/otp/verify', data);
    return response.data;
  },

  refresh: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh'
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
