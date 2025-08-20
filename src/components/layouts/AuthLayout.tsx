import type { FC } from "hono/jsx";

interface AuthLayoutProps {
  children: any;
  title?: string;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children, title = "Hunt Auth" }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
          }
          
          .auth-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            margin: 1rem;
          }
          
          .logo {
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .logo img {
            max-width: 140px;
            height: auto;
          }
          
          .logo h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-top: 0.5rem;
          }
          
          .auth-header {
            text-align: center;
            margin-bottom: 1.5rem;
          }
          
          .auth-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
          
          .auth-header p {
            color: #718096;
            font-size: 0.875rem;
          }
          
          @media (max-width: 480px) {
            .auth-container {
              margin: 0.5rem;
              padding: 1.5rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div class="auth-container">
          <div class="logo">
            <img src="https://jtfcfsnksywotlbsddqb.supabase.co/storage/v1/object/public/default/hunt_logo.png" alt="Hunt Tickets" />
            <h1>Hunt Auth</h1>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
};