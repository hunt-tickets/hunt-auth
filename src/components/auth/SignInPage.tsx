import type { FC } from "hono/jsx";

export const SignInPage: FC = () => {
  return (
    <div>
      <div class="auth-header">
        <h2>Welcome back</h2>
        <p>Sign in to your account to continue</p>
      </div>
      
      <div id="error-message" class="error-message" style="display: none;"></div>
      
      <div class="auth-methods">
        <div class="email-otp-section">
          <h3>Sign in with Email</h3>
          <form id="email-form">
            <div class="form-group">
              <label for="email">Email address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" id="email-btn" class="btn-primary">
              Send verification code
            </button>
          </form>
          
          <div id="otp-section" style="display: none; margin-top: 1rem;">
            <p class="otp-instruction">Enter the 6-digit code sent to your email</p>
            <form id="otp-form">
              <input type="hidden" id="verified-email" name="email" />
              <div class="form-group">
                <label for="otp">Verification code</label>
                <input 
                  type="text" 
                  id="otp" 
                  name="otp" 
                  required 
                  placeholder="000000"
                  maxlength="6"
                  pattern="[0-9]{6}"
                />
              </div>
              <button type="submit" id="otp-btn" class="btn-primary">
                Sign in
              </button>
              <button type="button" id="back-btn" class="btn-secondary">
                ← Back to email
              </button>
            </form>
          </div>
        </div>
        
        <div class="divider">
          <span>or</span>
        </div>
        
        <div class="other-methods">
          <button class="btn-passkey" disabled>
            🔐 Sign in with Passkey
            <small>(Coming soon)</small>
          </button>
          
          <button class="btn-google" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <small>(Coming soon)</small>
          </button>
          
          <button class="btn-apple" disabled>
            🍎 Continue with Apple
            <small>(Coming soon)</small>
          </button>
        </div>
      </div>
      
      <div class="auth-footer">
        <p>Don't have an account? <a href="/auth/signup">Sign up</a></p>
      </div>
      
      <style>{`
        .auth-methods {
          space-y: 1.5rem;
        }
        
        .email-otp-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
        }
        
        .divider {
          text-align: center;
          margin: 1.5rem 0;
          position: relative;
        }
        
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }
        
        .divider span {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .other-methods {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .btn-passkey, .btn-google, .btn-apple {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: not-allowed;
          opacity: 0.6;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .btn-google svg {
          width: 18px;
          height: 18px;
        }
        
        .other-methods button small {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-left: 0.25rem;
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .auth-footer p {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .auth-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .auth-footer a:hover {
          text-decoration: underline;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid #fecaca;
        }
        
        .otp-instruction {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .btn-secondary {
          width: 100%;
          background: #f9fafb;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        #otp {
          text-align: center;
          letter-spacing: 0.5em;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
          font-size: 1.25rem;
        }
      `}</style>
      
      <script src="/js/auth.js"></script>
    </div>
  );
};