# Auth Redirect Flow - Client Integration Example

## How Client Applications Should Integrate

### 1. Check Authentication Before Protected Routes

```javascript
// Example: Client app checking auth before accessing protected content
async function checkAuthAndRedirect(targetUrl) {
  try {
    const response = await fetch(`http://localhost:3000/api/auth/check?redirect_uri=${encodeURIComponent(targetUrl)}`, {
      credentials: 'include' // Important: include cookies
    });
    
    const data = await response.json();
    
    if (data.authenticated) {
      // User is authenticated, proceed with protected content
      console.log('User authenticated:', data.user);
      return data.user;
    } else {
      // User not authenticated, redirect to auth server
      window.location.href = `http://localhost:3000${data.authUrl}`;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Fallback to signin page
    window.location.href = `http://localhost:3000/auth/signin?redirect_uri=${encodeURIComponent(targetUrl)}`;
  }
}

// Usage example
document.getElementById('protected-button').addEventListener('click', () => {
  checkAuthAndRedirect(window.location.href);
});
```

### 2. URL Examples

- **Protected service needing auth:**
  ```
  https://myapp.com/dashboard
  ```

- **Redirect to auth with return URL:**
  ```
  http://localhost:3000/auth/signin?redirect_uri=https%3A//myapp.com/dashboard
  ```

- **After successful authentication:**
  User is redirected back to: `https://myapp.com/dashboard`

### 3. Mobile App Integration

```javascript
// React Native / Capacitor example
import { CapacitorCookies } from '@capacitor/core';

async function authenticateUser(returnUrl) {
  const authUrl = `http://localhost:3000/auth/signin?redirect_uri=${encodeURIComponent(returnUrl)}`;
  
  // Open auth flow in web view
  const result = await Browser.open({
    url: authUrl,
    windowName: '_blank'
  });
  
  // After auth completion, check if cookies are set
  const cookies = await CapacitorCookies.getCookies({
    url: 'http://localhost:3000'
  });
  
  if (cookies['better-auth.session_token']) {
    // User authenticated successfully
    return true;
  }
  
  return false;
}
```

### 4. Testing the Flow

1. **Start the auth server:**
   ```bash
   bun run dev
   ```

2. **Test authentication check:**
   ```bash
   curl -H "Content-Type: application/json" \
        "http://localhost:3000/api/auth/check?redirect_uri=https://example.com/dashboard"
   ```

3. **Test signin page with redirect:**
   Open: `http://localhost:3000/auth/signin?redirect_uri=https://example.com/dashboard`

4. **After successful signin:**
   User should be redirected to: `https://example.com/dashboard`