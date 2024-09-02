import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
    user_id: number;
    username: string;
    email: string;
    role: 'Student' | 'Faculty' | 'HOD';
    department_id: number;
    batch_id?: number;
    roll_id?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (email, password) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    set({
                        user: response.data.user,
                        token: response.data.token,
                        isAuthenticated: true
                    });
                    // Set the token in the API headers for future requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                } catch (error) {
                    console.error('Login failed:', error);
                    throw error;
                }
            },
            register: async (userData) => {
                try {
                    const response = await api.post('/auth/register', userData);
                    set({
                        user: response.data.user,
                        token: response.data.token,
                        isAuthenticated: true
                    });
                    // Set the token in the API headers for future requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                } catch (error) {
                    console.error('Registration failed:', error);
                    throw error;
                }
            },
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                // Remove the token from API headers
                delete api.defaults.headers.common['Authorization'];
            },
            setToken: (token) => {
                set({ token });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage, // Use localStorage for persistence
        }
    )
);