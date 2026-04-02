import { api } from "../lib/axios";
import { AuthResponse } from "../types";

type AuthPayload = {
  email: string;
  password: string;
};

type RegisterPayload = AuthPayload & {
  name: string;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

export const authApi = {
  async register(payload: RegisterPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", payload);
    return response.data.data;
  },

  async login(payload: AuthPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  }
};
