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
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: "http://localhost:3001", // replace with your origin
    allowHeaders: ["Content-Type", "Authorization"],
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

/**
 * Better Auth routes, see docs before changing
 * @link https://better-auth.com/docs
 */
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default app;
