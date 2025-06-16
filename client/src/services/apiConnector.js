import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Modified to handle params correctly
export const apiConnector = (method, url, bodyData, headers, params) => {
    console.log(`[apiConnector] Sending request: ${method} ${url}`, { bodyData, headers, params });

    const config = {
        method: method,
        url: url,
        data: bodyData || {}, // can't be null since the content-type is application/json
        params: params || null
    };

    // Only add headers if they are provided
    if (headers) {
        config.headers = headers;
    }

    return axiosInstance(config)
        .then(response => {
            console.log(`[apiConnector] Response from ${url}:`, response.data);
            return response;
        })
        .catch(error => {
         
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log(`[apiConnector] Request to ${url} was aborted.`);
            } else {
                console.error(`[apiConnector] Error from ${url}:`, error);
            }
            throw error; 
        });
};