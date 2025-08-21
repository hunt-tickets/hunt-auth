class AuthForm {
  constructor() {
    this.state = {
      step: 'email', // 'email' | 'otp'
      email: '',
      loading: false,
      error: null
    };
    
    this.redirectUri = new URLSearchParams(window.location.search).get('redirect_uri') || '/';
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const emailForm = document.getElementById('email-form');
    const otpForm = document.getElementById('otp-form');
    const backBtn = document.getElementById('back-btn');

    if (emailForm) {
      emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
    }

    if (otpForm) {
      otpForm.addEventListener('submit', (e) => this.handleOtpSubmit(e));
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBack());
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  async handleEmailSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    this.setState({ loading: true, error: null, email });
    
    try {
      const response = await fetch('/api/auth/email-otp/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'sign-in' })
      });
      
      if (response.ok) {
        this.setState({ step: 'otp', loading: false });
        document.getElementById('verified-email').value = email;
        setTimeout(() => document.getElementById('otp')?.focus(), 100);
      } else {
        const error = await response.text();
        this.setState({ loading: false, error });
      }
    } catch (error) {
      this.setState({ loading: false, error: 'Network error. Please try again.' });
    }
  }

  async handleOtpSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const otp = formData.get('otp');
    
    this.setState({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/sign-in/email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      if (response.ok) {
        window.location.href = this.redirectUri;
      } else {
        this.setState({ loading: false, error: 'Invalid code. Please try again.' });
        document.getElementById('otp')?.focus();
      }
    } catch (error) {
      this.setState({ loading: false, error: 'Network error. Please try again.' });
    }
  }

  handleBack() {
    this.setState({ step: 'email', error: null });
    document.getElementById('email')?.focus();
  }

  render() {
    const emailSection = document.getElementById('email-form').parentElement;
    const otpSection = document.getElementById('otp-section');
    const submitBtns = document.querySelectorAll('button[type="submit"]');
    const errorElement = document.getElementById('error-message');

    // Update visibility
    if (this.state.step === 'email') {
      emailSection.style.display = 'block';
      otpSection.style.display = 'none';
    } else {
      emailSection.style.display = 'none';
      otpSection.style.display = 'block';
    }

    // Update button states
    submitBtns.forEach(btn => {
      btn.disabled = this.state.loading;
      if (this.state.loading) {
        btn.textContent = btn.id === 'email-btn' ? 'Sending...' : 'Signing in...';
      } else {
        btn.textContent = btn.id === 'email-btn' ? 'Send verification code' : 'Sign in';
      }
    });

    // Update error message
    if (errorElement) {
      errorElement.textContent = this.state.error || '';
      errorElement.style.display = this.state.error ? 'block' : 'none';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AuthForm();
});