import { Hono } from "hono";
import { auth } from "./lib/auth";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { jsxRenderer } from "hono/jsx-renderer";
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
app.get('/auth/*', jsxRenderer(({ children }) => (
  <AuthLayout>{children}</AuthLayout>
)));

// Auth pages
app.get('/auth/signin', (c) => {
  return c.render(<SignInPage />);
});

app.get('/auth/signup', (c) => {
  return c.html('<h1>Sign Up page coming soon</h1>');
});

/**
 * Better Auth routes, see docs before changing
 * @link https://better-auth.com/docs
 */
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default app;
