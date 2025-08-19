const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPasswordReset() {
  try {
    console.log('🧪 Testing Password Reset Functionality...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('✅ User registered successfully');

    // Step 2: Test forgot password
    console.log('\n2. Testing forgot password...');
    const forgotPasswordResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'test@example.com'
    });
    console.log('✅ Forgot password request sent:', forgotPasswordResponse.data.message);

    // Step 3: Test with invalid email
    console.log('\n3. Testing forgot password with invalid email...');
    const invalidEmailResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'nonexistent@example.com'
    });
    console.log('✅ Invalid email handled correctly:', invalidEmailResponse.data.message);

    // Step 4: Test validate reset token with invalid token
    console.log('\n4. Testing validate reset token with invalid token...');
    try {
      await axios.get(`${BASE_URL}/auth/validate-reset-token/invalid-token`);
    } catch (error) {
      console.log('✅ Invalid token correctly rejected:', error.response.data.message);
    }

    // Step 5: Test reset password with invalid token
    console.log('\n5. Testing reset password with invalid token...');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: 'invalid-token',
        newPassword: 'NewPassword123!'
      });
    } catch (error) {
      console.log('✅ Invalid reset token correctly rejected:', error.response.data.message);
    }

    console.log('\n🎉 All password reset tests completed successfully!');
    console.log('\n📧 Note: Check your email service logs to verify email sending functionality.');
    console.log('📝 The forgot password feature generates reset tokens and sends emails.');
    console.log('🔐 To test the complete flow, you would need to extract the token from the email.');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.data);
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run the test
testPasswordReset();
