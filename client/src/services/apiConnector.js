// apiConnector.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Modified to accept a signal
export const apiConnector = (method, url, bodyData, headers, params, signal) => {
    console.log(`[apiConnector] Sending request: ${method} ${url}`, { bodyData, headers, params, hasSignal: !!signal });
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
        signal: signal // Pass the signal to axios
    })
        .then(response => {
            console.log(`[apiConnector] Response from ${url}:`, response.data);
            return response;
        })
        .catch(error => {
            // Don't log error if it's due to aborting
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log(`[apiConnector] Request to ${url} was aborted.`);
            } else {
                console.error(`[apiConnector] Error from ${url}:`, error);
            }
            throw error; // Re-throw the error so it can be caught by the caller
        });
};