import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        console.log("Decoding token...");
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.log(decoded.exp);
            console.log(currentTime);
            console.log("Token expired");
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            return true;
        } else {
            console.log("Token is valid");
            return false;
        }
    } catch (error) {
        console.error('Error decoding token', error);
        return true;
    }
};

export const saveAccessToken = (token) => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        console.log("Token saved successfully");
    } catch (e) {
        console.log("Error saving token: ", e);
    }
};

export const saveRefreshToken = (token) => {
    try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
        console.log("Refresh token saved successfully");
    } catch (e) {
        console.log("Error saving token: ", e);
    }
};

export const getAccessToken = () => {
    try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        console.log("Token received successfully");
        if (token && !isTokenExpired(token)) {
            return token;
        } else {
            return null;
        }
    } catch (e) {
        console.log("Error getting access token: ", e);
        return null;
    }
};

export const getRefreshToken = () => {
    try {
        const token = localStorage.getItem(REFRESH_TOKEN_KEY);
        console.log("Refresh token received successfully");
        if (token && !isTokenExpired(token)) {
            return token;
        }
        return null;
    } catch (e) {
        console.log("Error getting refresh token: ", e);
        return null;
    }
};

export const refreshAccessToken = async () => {
    try {
        const apiUrl = 'https://localhost:8000'; // Захардкодили, как в исходном коде
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            console.log("No refresh token found");
            return null;
        }

        const response = await fetch(`${apiUrl}/jwt/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                saveAccessToken(data.access_token);
                return data.access_token;
            }
        } else {
            const data = await response.json();
            console.log("Failed to refresh token");
            console.log(data);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            return null;
        }
    } catch (error) {
        console.error('Error refreshing access token', error);
        return null;
    }
};