import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { getItem, setItem, removeItem } from "../utils/localStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(getItem("accessToken") || null);
    const [refreshToken, setRefreshToken] = useState(getItem("refreshToken") || null);
    const [user, setUser] = useState(getItem("user") || null);
    const [loading, setLoading] = useState(true);

    // Ref so interceptor always has latest refreshToken without stale closure
    const refreshTokenRef = useRef(refreshToken);
    useEffect(() => { refreshTokenRef.current = refreshToken; }, [refreshToken]);

    // Track if a refresh is already in-flight to avoid parallel refresh calls
    const isRefreshing = useRef(false);
    const failedQueue = useRef([]);

    const processQueue = (error, token = null) => {
        failedQueue.current.forEach(({ resolve, reject }) => {
            if (error) reject(error);
            else resolve(token);
        });
        failedQueue.current = [];
    };

    const clearAuth = () => {
        removeItem("accessToken");
        removeItem("refreshToken");
        removeItem("user");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post("/api/login", { email, password });
            const { Username, accessToken: at, refreshToken: rt } = response.data;

            setItem("accessToken", at);
            setItem("refreshToken", rt);
            setAccessToken(at);
            setRefreshToken(rt);
            axios.defaults.headers.common["Authorization"] = `Bearer ${at}`;

            const userData = { name: Username, email };
            setUser(userData);
            setItem("user", userData);
            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await axios.post("/api/register", { name, email, password });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            if (refreshTokenRef.current) {
                await axios.post("/api/logout", { refreshToken: refreshTokenRef.current });
            }
        } catch (error) {
            console.error("Logout error:", error.response?.data || error.message);
        } finally {
            clearAuth();
        }
    };

    const refreshAccessToken = async () => {
        const rt = refreshTokenRef.current;
        if (!rt) return null;

        try {
            // Use a plain axios call (not the instance with interceptor) to avoid loops
            const response = await axios.post("/api/refresh", { refreshToken: rt });
            const { accessToken: newAt, refreshToken: newRt } = response.data;

            setAccessToken(newAt);
            setItem("accessToken", newAt);
            axios.defaults.headers.common["Authorization"] = `Bearer ${newAt}`;

            // Store rotated refresh token if server sends one back
            if (newRt) {
                setRefreshToken(newRt);
                setItem("refreshToken", newRt);
            }

            return newAt;
        } catch (error) {
            const code = error.response?.data?.code;
            const status = error.response?.status;
            // If refresh token itself is expired (401) or invalid (403), force logout
            if (status === 401 || status === 403 || code === 'REFRESH_EXPIRED') {
                clearAuth();
                alert("Your session has expired. Please log in again.");
                window.location.href = "/Login";
            }
            return null;
        }
    };

    // Axios response interceptor — auto-refresh on 401
    useEffect(() => {
        if (accessToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Only retry once, and skip the refresh endpoint itself to avoid loops
                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes("/api/refresh") &&
                    !originalRequest.url?.includes("/api/login")
                ) {
                    if (isRefreshing.current) {
                        // Queue the request while refresh is in flight
                        return new Promise((resolve, reject) => {
                            failedQueue.current.push({ resolve, reject });
                        })
                            .then((token) => {
                                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                                return axios(originalRequest);
                            })
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing.current = true;

                    const newToken = await refreshAccessToken();
                    isRefreshing.current = false;

                    if (newToken) {
                        processQueue(null, newToken);
                        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } else {
                        processQueue(error, null);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []); // run once — interceptor uses ref for latest token

    // On page load: if we have a refresh token but no access token, try to get one
    useEffect(() => {
        const initializeAuth = async () => {
            const rt = getItem("refreshToken");
            const at = getItem("accessToken");

            if (rt && !at) {
                await refreshAccessToken();
            } else if (at) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${at}`;
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                login,
                register,
                logout,
                loading,
                refreshAccessToken,
                isAuthenticated: !!accessToken,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};