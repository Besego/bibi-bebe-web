const API_URL_KEY = 'api_url';

export const saveApiUrl = (url) => {
    try {
        localStorage.setItem(API_URL_KEY, url);
    } catch (error) {
        console.error('Error saving API URL:', error);
    }
};

export const getApiUrl = () => {
    try {
        const url = localStorage.getItem(API_URL_KEY) || 'http://192.168.41.151:8000';
        return url;
    } catch (error) {
        console.error('Error getting API URL:', error);
        return null;
    }
};