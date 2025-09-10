// Simple test script to verify API authentication
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000';

async function testAPI() {
  try {
    console.log('Testing API authentication...');
    
    // Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', {
      status: loginResponse.status,
      hasAccessToken: !!loginResponse.data.accessToken,
      hasRefreshToken: !!loginResponse.data.refreshToken,
      user: loginResponse.data.user
    });
    
    const accessToken = loginResponse.data.accessToken;
    
    if (accessToken) {
      // Test authenticated endpoint
      console.log('\n2. Testing authenticated endpoint...');
      const userResponse = await axios.get(`${API_BASE_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('User profile response:', {
        status: userResponse.status,
        data: userResponse.data
      });
    }
    
  } catch (error) {
    console.error('API test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
}

testAPI();
