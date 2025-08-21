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
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500", "capacitor://localhost", "ionic://localhost"],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use(logger());

// Serve static files
app.use('/js/*', serveStatic({ root: './src/public' }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Authentication check endpoint for client applications
app.get("/api/auth/check", async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (session) {
      return c.json({ 
        authenticated: true, 
        user: session.user,
        session: session.session 
      });
    } else {
      const redirectUri = c.req.query('redirect_uri');
      const authUrl = redirectUri 
        ? `/auth/signin?redirect_uri=${encodeURIComponent(redirectUri)}`
        : '/auth/signin';
        
      return c.json({ 
        authenticated: false,
        authUrl 
      }, 401);
    }
  } catch (error) {
    return c.json({ 
      authenticated: false, 
      error: 'Authentication check failed',
      authUrl: '/auth/signin'
    }, 500);
  }
});

// JSX renderer middleware for auth pages
app.get('/auth/*', jsxRenderer(({ children }) => (
  <AuthLayout>{children}</AuthLayout>
)));

// Auth pages
app.get('/auth/signin', (c) => {
  const redirectUri = c.req.query('redirect_uri') || '/';
  return c.render(<SignInPage redirectUri={redirectUri} />);
});

app.get('/auth/signup', (c) => {
  const redirectUri = c.req.query('redirect_uri') || '/';
  return c.html(`<h1>Sign Up page coming soon</h1><p>After signup, you'll be redirected to: ${redirectUri}</p>`);
});

/**
 * Better Auth routes, see docs before changing
 * @link https://better-auth.com/docs
 */
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default app;
