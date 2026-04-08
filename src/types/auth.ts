export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Backend returns { accessToken, user } — refresh token is in HTTP-only cookie
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpVerifyPayload {
  phone: string;
  code: string;
}
