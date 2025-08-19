#!/usr/bin/env node

// Test script for Email OTP endpoints on Railway deployment
const RAILWAY_URL = 'https://your-app.railway.app'; // Replace with your actual Railway URL
const TEST_EMAIL = 'test@example.com'; // Replace with your test email

async function testSendOTP() {
  console.log('🧪 Testing Send OTP endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/email-otp/send-verification-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        type: 'sign-in'
      })
    });

    const data = await response.text();
    console.log('📤 Send OTP Response:', response.status, data);
    
    if (response.ok) {
      console.log('✅ OTP sent successfully! Check your email.');
      return true;
    } else {
      console.log('❌ Failed to send OTP');
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    return false;
  }
}

async function testVerifyOTP(otp) {
  console.log('🧪 Testing Verify OTP endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/email-otp/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        otp: otp
      })
    });

    const data = await response.text();
    console.log('🔍 Verify OTP Response:', response.status, data);
    
    if (response.ok) {
      console.log('✅ OTP verified successfully!');
      return true;
    } else {
      console.log('❌ Failed to verify OTP');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/health`);
    const data = await response.json();
    console.log('💚 Health Check Response:', response.status, data);
    return response.ok;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting OTP Tests on Railway Deployment');
  console.log('📍 URL:', RAILWAY_URL);
  console.log('📧 Test Email:', TEST_EMAIL);
  console.log('─'.repeat(50));

  // Test health first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Health check failed. Check your Railway deployment.');
    return;
  }

  console.log('─'.repeat(50));
  
  // Test send OTP
  const sendOk = await testSendOTP();
  
  if (sendOk) {
    console.log('─'.repeat(50));
    console.log('📬 Check your email for the OTP code');
    console.log('💡 To test verification, run:');
    console.log(`   node test-otp.js verify YOUR_OTP_CODE`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args[0] === 'verify' && args[1]) {
  testVerifyOTP(args[1]);
} else {
  runTests();
}