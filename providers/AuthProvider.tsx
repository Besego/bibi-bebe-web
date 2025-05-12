import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveAccessToken, saveRefreshToken, getAccessToken, refreshAccessToken, getRefreshToken } from '@/storages/tokenStorage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { getCurrentUrl } from '@/hooks/useGetCurrentUrl';
import { getApiUrl } from '@/storages/apiUrlStorage';
import { fetchWithAuth } from '@/hooks/useFetchWithAuth';
import { AuthContextType } from '@/types/types';
import { saveSpace } from '@/storages/spaceStorage';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState();
    // const apiUrl = getApiUrl();
    const apiUrl = "http://192.168.41.151:8000";
    // console.log(apiUrl)

    // Проверка аутентификации при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("Проверка авторизации");
                const accessToken = await getAccessToken();
                const refreshToken = await getRefreshToken();

                // Сначала пробуем использовать существующий accessToken
                if (accessToken && refreshToken) {
                    console.log("Токены найдены");
                    setIsAuthenticated(true);
                    router.push('/(private)/home');
                    console.log("Пользователь перенаправлен на домашний экран");
                    return;
                }

                // Если нет accessToken, но есть refreshToken, пробуем обновить
                if (!accessToken && refreshToken) {
                    console.log("Access token отсутствует, пробуем обновить");
                    try {
                        const newAccessToken = await refreshAccessToken();
                        if (newAccessToken) {
                            setIsAuthenticated(true);
                            router.push('/(private)/home');
                            console.log("Токен обновлен, пользователь перенаправлен");
                            return;
                        }
                    } catch (refreshError) {
                        console.error('Ошибка при обновлении токена:', refreshError);
                        // Если обновление не удалось, удаляем refresh токен, так как он недействителен
                        // await clearRefreshToken();
                    }
                }

                // Если ни один из сценариев выше не сработал, отправляем на экран регистрации
                console.log("Токены отсутствуют или недействительны");
                setIsAuthenticated(false);
                router.push('/(public)/signUp');
                console.log("Пользователь перенаправлен на экран регистрации");

            } catch (error) {
                console.error('Ошибка при проверке аутентификации:', error);
                setIsAuthenticated(false);
                router.push('/(public)/signUp');
            } finally {
                setIsLoading(false);
            }
        };

        // checkAuth();
        // SecureStore.deleteItemAsync('access_token');
        // SecureStore.deleteItemAsync('refresh_token');
        router.push('/(private)/home');
        // router.push('/(private)/onboardingScreen');
    }, []);

    // Функция для входа в аккаунт
    const signIn = async (username: string, password: string) => {
        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${apiUrl}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                await saveAccessToken(data.access_token);
                await saveRefreshToken(data.refresh_token);
                setUser(data.user)
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: data.detail || 'Ошибка авторизации' };
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            return { success: false, error: 'Произошла ошибка при входе' };
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для регистрации
    const signUp = async (username: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${apiUrl}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Если API возвращает токены при регистрации
                if (data.access_token && data.refresh_token) {
                    await saveAccessToken(data.access_token);
                    await saveRefreshToken(data.refresh_token);
                    setUser(data.user)
                    setIsAuthenticated(true);
                }
                return { success: true };
            } else {
                return { success: false, error: data.detail || 'Ошибка регистрации' };
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            return { success: false, error: 'Произошла ошибка при регистрации' };
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для выхода из аккаунта
    const signOut = async () => {
        try {
            setIsLoading(true);
            // Удаляем токены из хранилища
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during sign out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // const getUserInfo = async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await fetchWithAuth(`${apiUrl}/user/me/`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             console.log("Данные пользователя:", data);
    //             setUser(data);
    //             return { success: true };
    //         } else {
    //             return { success: false, error: data.detail || 'Ошибка при получении данных пользователей' };
    //         }

    //     } catch (error) {
    //         console.error('Error during getting user info:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    const createUserSpace = async (spaceName: string) => {
        try {
            setIsLoading(true);

            const response = await fetchWithAuth(`/space/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: spaceName }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Данные:", data);
                await saveSpace(data);

                return { success: true };
            } else {
                return { success: false, error: data.detail || 'Ошибка при получении данных пространства' };
            }

        } catch (error) {
            console.error('Error during create new space:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const value = {
        isAuthenticated,
        isLoading,
        user,
        signIn,
        signUp,
        signOut,
        // getUserInfo,
        createUserSpace,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};