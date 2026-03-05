import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';
import type { LoginFormValues } from '@/schemas/auth.schema';
import type { User } from '@/types/auth';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      // 1. Format data for FastAPI OAuth2
      const formData = new URLSearchParams();
      formData.append('username', data.email);
      formData.append('password', data.password);

      // 2. Get Token
      const tokenResponse = await api.post('/auth/login/access-token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const token = tokenResponse.data.access_token;

      // 3. Get User Profile
      const profileResponse = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { token, user: profileResponse.data };
    },
    onSuccess: ({ token, user }) => {
      // 4. Update global state and redirect on success
      setAuth(token, user);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // 5. Handle errors cleanly
      const errorMsg = error.response?.data?.detail || 'Failed to login. Please check your credentials.';
      toast.error(errorMsg);
    },
  });
}