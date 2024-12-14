// axios.js

import axios from "axios";
const instance = axios.create({
	baseURL: "https://pharmedica.et/fluent/api/",
	timeout: 40000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor
instance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
instance.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Handle token expiration
			localStorage.removeItem('token');
			window.location.href = '/';
		}
		return Promise.reject(error);
	}
);

export default instance;

// https://pharmedica.et/fluent/api/
// https://fluent-gamify-hub-production.up.railway.app/api
//http://localhost:5000/api'