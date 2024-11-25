// axios.js

import axios from "axios";
const instance = axios.create({
	baseURL: "http://localhost:5000/api/",
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

// // Add request interceptor
// instance.interceptors.request.use(
// 	(config) => {
// 		console.log('🚀 API Request:', {
// 			method: config.method,
// 			url: config.url,
// 			data: config.data
// 		});
// 		return config;
// 	},
// 	(error) => {
// 		console.error('❌ Request Error:', error);
// 		return Promise.reject(error);
// 	}
// );

// // Add response interceptor
// instance.interceptors.response.use(
// 	(response) => {
// 		console.log('✅ API Response:', {
// 			status: response.status,
// 			data: response.data
// 		});
// 		return response;
// 	},
// 	(error) => {
// 		console.error('❌ Response Error:', error.response || error);
// 		return Promise.reject(error);
// 	}
// );

export default instance;
