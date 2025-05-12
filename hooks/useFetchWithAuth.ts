import { getApiUrl } from "@/storages/apiUrlStorage";
import { getAccessToken, refreshAccessToken } from "@/storages/tokenStorage";


export const fetchWithAuth = async (url: string, options = {}) => {
    const token = await getAccessToken();
    // const apiUrl = await getApiUrl();
    const apiUrl = "http://192.168.41.151:8000";
    // console.log(`[fetchWithAuth] API URL: ${apiUrl}${url}`);

    if (!apiUrl) {
        throw new Error('API URL not found. Please restart the application.');
    }

    let authToken = token;
    if (!authToken) {
        console.log("[fetchWithAuth] No token found, trying to refresh");
        authToken = await refreshAccessToken();
        if (!authToken) {
            throw new Error('Failed to refresh token');
        }
    }

    // console.log("[fetchWithAuth] Using token:", authToken);

    const fetchOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${authToken}`,
        },
    };

    // console.log("[fetchWithAuth] Fetch options:", fetchOptions);

    try {
        const response = await fetch(`${apiUrl}${url}`, fetchOptions);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        return response;
    } catch (error) {
        console.error("[fetchWithAuth] Network error:", error);
        throw error;
    }
};