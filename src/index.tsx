import { Hono } from "hono";
import { auth } from "./lib/auth";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { jsxRenderer } from "hono/jsx-renderer";
import { serveStatic } from "hono/bun";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { SignInPage } from "./components/auth/SignInPage";

const app = new Hono();

// CORS configuration for mobile and web access
// Important: CORS middleware must be registered before your routes. This ensures that cross-origin requests are properly handled before they reach your authentication endpoints.
app.use(
  "/api/*", // Enable CORS for all API routes
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000", 
      "https://*.hunt-tickets.com"
    ],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use(logger());

// Serve static files
app.use("/js/*", serveStatic({ root: "./src/public" }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// JSX renderer middleware for auth pages
app.get(
  "/auth/*",
  jsxRenderer(({ children }) => <AuthLayout>{children}</AuthLayout>)
);

// Auth pages
app.get("/auth/signin", (c) => {
  const redirectUri = c.req.query("redirect_uri") || "/";
  return c.render(<SignInPage redirectUri={redirectUri} />);
});

// Session validation endpoint for microservices
app.get("/api/auth/validate", async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (!session) {
      return c.json({ valid: false, error: "No session found" }, 401);
    }
    
    return c.json({ 
      valid: true, 
      user: session.user, 
      session: {
        id: session.session.id,
        userId: session.session.userId,
        expiresAt: session.session.expiresAt
      }
    });
  } catch (error) {
    return c.json({ valid: false, error: "Session validation failed" }, 401);
  }
});

// User profile page to test auth flow
app.get("/profile", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.redirect("/auth/signin?redirect_uri=/profile");
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>User Profile - Hunt Auth</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        h1 {
          color: #111827;
          margin: 0;
        }
        .section {
          margin-bottom: 2rem;
        }
        .section h2 {
          color: #374151;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          text-align: left;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .data-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .logout-btn:hover {
          background: #dc2626;
        }
        .json-code {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Hunt Auth!</h1>
          <p>Authentication successful - here's your user data</p>
        </div>

        <div class="section">
          <h2>User Information</h2>
          <table class="data-table">
            <tr>
              <th>User ID</th>
              <td>${session.user.id}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${session.user.email}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>${session.user.name || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Email Verified</th>
              <td>${session.user.emailVerified ? '✅ Yes' : '❌ No'}</td>
            </tr>
            <tr>
              <th>Account Created</th>
              <td>${new Date(session.user.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Last Updated</th>
              <td>${new Date(session.user.updatedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Session Information</h2>
          <table class="data-table">
            <tr>
              <th>Session ID</th>
              <td>${session.session.id}</td>
            </tr>
            <tr>
              <th>IP Address</th>
              <td>${session.session.ipAddress || 'Not available'}</td>
            </tr>
            <tr>
              <th>User Agent</th>
              <td>${session.session.userAgent || 'Not available'}</td>
            </tr>
            <tr>
              <th>Session Created</th>
              <td>${new Date(session.session.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Expires At</th>
              <td>${new Date(session.session.expiresAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Raw Session Data (for testing)</h2>
          <pre class="json-code">${JSON.stringify({ user: session.user, session: session.session }, null, 2)}</pre>
        </div>

        <div class="section">
          <button class="logout-btn" onclick="logout()">Sign Out</button>
        </div>
      </div>

      <script>
        async function logout() {
          try {
            const response = await fetch('/api/auth/sign-out', {
              method: 'POST',
              credentials: 'include'
            });
            
            if (response.ok) {
              window.location.href = '/auth/signin';
            } else {
              alert('Logout failed. Please try again.');
            }
          } catch (error) {
            alert('Network error during logout.');
          }
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * Better Auth routes, see docs before changing
 * @link https://better-auth.com/docs
 */
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default app;
