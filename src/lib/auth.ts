import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { Redis } from "ioredis";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sending function with Resend
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured - email not sent");
      console.log(`📧 Would send to: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`📄 Content: ${html}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Auth <team@support.hunttickets.com>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("✅ Email sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}

const redis = new Redis(`${process.env.REDIS_URL}?family=0`)
  .on("error", (err) => {
    console.error("Redis connection error:", err);
  })
  .on("connect", () => {
    console.log("Redis connected");
  })
  .on("ready", () => {
    console.log("Redis ready");
  });

// Check better-auth docs for more info https://www.better-auth.com/docs/
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // Session config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // Add your plugins here
  plugins: [
    emailOTP({
      // Use the sendVerificationOtp() method to send an OTP to the user's email address.
      async sendVerificationOTP({ email, otp, type }) {
        // Agregar proveedor de email (Resend, SendGrid, etc.)
        if (type === "sign-in") {
          await sendEmail({
            to: email,
            subject: "Código de acceso",
            html: `Tu código de acceso es: <strong>${otp}</strong>`,
          });
        } else if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Verifica tu email",
            html: `Código de verificación: <strong>${otp}</strong>`,
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Restablecer contraseña",
            html: `Código para restablecer: <strong>${otp}</strong>`,
          });
        }
      },
      // Configuraciones opcionales
      otpLength: 6,
      expiresIn: 300, // 5 minutos
      allowedAttempts: 3,
    }),
  ],
  // DB config
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    log: console.log,
  }),
  // This is for the redis session storage
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, "EX", ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
});
