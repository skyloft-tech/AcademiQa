// src/services/debugAPI.ts
const API_BASE = '/api';

export const debugAPI = {
  // Test if endpoint exists and returns valid JSON
  testEndpoint: async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options);
      
      const result = {
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      };

      console.log(`API Test ${method} ${endpoint}:`, result);

      const text = await response.text();
      console.log(`Response body (first 500 chars):`, text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log(`✅ Valid JSON from ${endpoint}:`, json);
        return { ...result, success: true, data: json };
      } catch (e) {
        console.error(`❌ Invalid JSON from ${endpoint}. Got HTML instead.`);
        console.error('This usually means:', {
          '404': 'Endpoint does not exist',
          '403': 'Authentication failed',
          '500': 'Server error',
          'HTML Response': 'Django is returning an error page instead of JSON'
        }[response.status] || 'Unknown error');
        return { ...result, success: false, error: 'Invalid JSON', html: text };
      }
    } catch (error) {
      console.error(`🚨 Network error for ${endpoint}:`, error);
      return { success: false, error: 'Network error' };
    }
  },

  // Test all endpoints
  testAllEndpoints: async () => {
    const endpoints = [
      { path: '/tasks/', method: 'GET' },
      { path: '/auth/user/', method: 'GET' },
      { path: '/notifications/', method: 'GET' },
      { path: '/tasks/1/chat/', method: 'GET' }, // Test with a specific task ID
    ];
    
    const results = {};
    for (const endpoint of endpoints) {
      results[endpoint.path] = await debugAPI.testEndpoint(endpoint.path, endpoint.method);
    }
    return results;
  },

  // Test authentication
  testAuth: async () => {
    const token = localStorage.getItem('access_token');
    console.log('Current JWT Token:', token);
    
    if (!token) {
      console.error('❌ No JWT token found in localStorage');
      return false;
    }

    // Test if token is valid by calling a protected endpoint
    const result = await debugAPI.testEndpoint('/auth/user/');
    return result.success;
  },
};