import { saveApiUrl } from "@/storages/apiUrlStorage";

export const getCurrentUrl = async () => {
    try {
        const response = await fetch('https://67f3f549cbef97f40d2cd52a.mockapi.io/ApiUrl');

        if (!response.ok) {
            throw new Error('HTTP error Status: ', response.status);
        }

        const apiUrl = await response.json();
        console.log(apiUrl[0].url);
        await saveApiUrl(apiUrl[0].url);

        return apiUrl;
    } catch (error) {
        console.error('Error fetching API URL:', error.message);
        throw new Error('API URL not found. Please restart the application.');
    }
}