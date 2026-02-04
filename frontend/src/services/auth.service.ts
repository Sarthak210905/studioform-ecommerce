import { api } from '@/lib/axios';
import type { LoginCredentials, LoginResponse, RegisterData, User, UserUpdate, ChangePassword } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const { data } = await api.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  async register(userData: RegisterData): Promise<User> {
    const { data } = await api.post<User>('/auth/register', userData);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async updateProfile(userData: UserUpdate): Promise<User> {
    const { data } = await api.put<User>('/auth/me', userData);
    return data;
  },

  async verifyEmail(token: string): Promise<string> {
    const { data } = await api.post<string>('/auth/verify-email', null, {
      params: { token },
    });
    return data;
  },

  async resendVerification(email: string): Promise<string> {
    const { data } = await api.post<string>('/auth/resend-verification', null, {
      params: { email },
    });
    return data;
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<string>('/auth/forgot-password', null, {
      params: { email },
    });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const { data } = await api.post<string>('/auth/reset-password', null, {
      params: { token, new_password: newPassword },
    });
    return data;
  },

  async changePassword(passwordData: ChangePassword): Promise<string> {
    const { data } = await api.post<string>('/auth/change-password', passwordData);
    return data;
  },

  async deleteAccount(password: string): Promise<string> {
    const { data } = await api.delete<string>('/auth/me', {
      params: { password },
    });
    return data;
  },
};
