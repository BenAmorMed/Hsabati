"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (data: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: () => void;
    updateUser: (newUser: any) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: () => { },
    updateUser: () => { },
    isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (data: any) => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555'}/auth/login`, data);
        if (res.data.success) {
            const { token: newToken, user: newUser } = res.data.data;
            setToken(newToken);
            setUser(newUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        }
        return res.data;
    };

    const register = async (data: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
        console.log('Registering with URL:', `${apiUrl}/auth/register`);
        try {
            const res = await axios.post(`${apiUrl}/auth/register`, data);
            console.log('Register response:', res.data);
            const { token: newToken, user: newUser } = res.data.data;
            setToken(newToken);
            setUser(newUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        } catch (err: any) {
            console.error('Registration error details:', err.response?.data || err.message);
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (newUser: any) => {
        setUser((prevUser: any) => {
            const updatedUser = { ...(prevUser || {}), ...newUser };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
