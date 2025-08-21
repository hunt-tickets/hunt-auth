import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
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
      from:
        process.env.FROM_EMAIL || "Hunt Auth <team@support.hunttickets.com>",
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
  // DB config
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    log: console.log,
  }),

  // Session config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    cookieAttributes: {
      domain:
        process.env.NODE_ENV === "production" ? ".hunt-tickets.com" : undefined,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
            subject: `Código de Acceso - ${otp}`,
            html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

  <!--[if gte mso 9]>

  <xml>

    <o:OfficeDocumentSettings>

      <o:AllowPNG/>

      <o:PixelsPerInch>96</o:PixelsPerInch>

    </o:OfficeDocumentSettings>

  </xml>

  <![endif]-->

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="x-apple-disable-message-reformatting">

  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <title>🔐 Tu código de verificación - Hunt Tickets</title>

  <style type="text/css">

    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

    

    * {

      font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;

      box-sizing: border-box;

    }

    

    body {

      margin: 0;

      padding: 0;

      -webkit-text-size-adjust: 100%;

      -ms-text-size-adjust: 100%;

      background-color: #f0f0f0;

      color: #2D2D2D;

    }

    

    table, td {

      border-collapse: collapse;

      mso-table-lspace: 0pt;

      mso-table-rspace: 0pt;

    }

    

    img {

      -ms-interpolation-mode: bicubic;

      border: 0;

      height: auto;

      line-height: 100%;

      outline: none;

      text-decoration: none;

      max-width: 100%;

    }

    

    p {

      margin: 0 0 12px 0;

      line-height: 1.6;

      font-weight: 400;

    }

    

    .otp-container {

      background: linear-gradient(135deg, #000000 0%, #2a2a2a 100%);

      border-radius: 16px;

      padding: 30px;

      text-align: center;

      box-shadow: 0 8px 24px rgba(0,0,0,0.15);

    }

    

    .otp-code {

      background-color: #ffffff;

      color: #000000;

      font-size: 36px;

      font-weight: 700;

      letter-spacing: 10px;

      padding: 20px 30px;

      border-radius: 8px;

      display: inline-block;

      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;

      margin: 15px 0;

      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    }

    

    .timer-text {

      color: #ffffff;

      font-size: 14px;

      font-weight: 500;

      opacity: 0.9;

    }

    

    .social-icon {

      display: inline-block;

      margin: 0 8px;

    }

    

    @media only screen and (max-width: 640px) {

      .wrapper-table {

        width: 100% !important;

      }

      

      .main-container {

        width: 100% !important;

        margin: 0 !important;

      }

      

      .mobile-padding {

        padding-left: 20px !important;

        padding-right: 20px !important;

      }

    }

  </style>

  <!--[if mso]>

  <style type="text/css">

    body, table, td, p, a, li, blockquote {

      font-family: Arial, sans-serif !important;

    }

    .otp-code {

      font-family: Courier New, monospace !important;

    }

  </style>

  <![endif]-->

</head>

<body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif; color: #2D2D2D;">

  <!-- Preheader text -->

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">

    Tu código de verificación es: ${otp}. No lo compartas con nadie. Válido por 10 minutos.

  </div>

  

  <!-- Wrapper table -->

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapper-table" style="background-color: #f0f0f0; table-layout: fixed;">

    <tr>

      <td align="center" style="padding: 30px 15px;">

        

        <!-- Email Container -->

        <!--[if mso]>

        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px;">

        <tr>

        <td>

        <![endif]-->

        

        <table class="main-container" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          

          <!-- Header with gradient -->

          <tr>

            <td style="padding: 0;">

              <table border="0" cellpadding="0" cellspacing="0" width="100%">

                <tr>

                  <td align="center" style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px;">

                    <img src="https://jtfcfsnksywotlbsddqb.supabase.co/storage/v1/object/public/default/hunt_logo.png" alt="Hunt Tickets" width="140" height="46" style="display: block; border: 0; max-width: 140px; height: auto;">

                  </td>

                </tr>

              </table>

            </td>

          </tr>

          

          <!-- Main Content -->

          <tr>

            <td class="mobile-padding" style="padding: 40px 45px 20px 45px;">

              <table border="0" cellpadding="0" cellspacing="0" width="100%">

                <tr>

                  <td align="center">

                    <!-- Welcome message -->

                    <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.6; color: #333333; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif; text-align: center;">

                      Hola, aquí está tu código de verificación para acceder a Hunt Tickets

                    </p>

                    

                    <!-- OTP Section Minimalista -->

                    <div style="margin: 20px 0 30px 0;">

                      <div style="background-color: #f8f8f8; border: 1px solid #cccccc; border-radius: 12px; padding: 30px 20px; text-align: center;">

                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Código de verificación</p>

                        <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif; margin: 0 0 15px 0;">${otp}</div>

                        <p style="margin: 0; font-size: 14px; color: #666666;">Válido por 10 minutos</p>

                      </div>

                    </div>

                    

                    <!-- Instructions -->

                    <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; text-align: left;">

                      <p style="margin: 0 0 8px 0; font-size: 15px; color: #333333; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

                        <strong>📋 Instrucciones:</strong>

                      </p>

                      <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">

                        <li>Ingresa este código en la pantalla de verificación</li>

                        <li>No compartas este código con nadie</li>

                        <li>Si no solicitaste este código, ignora este correo</li>

                      </ul>

                    </div>

                  </td>

                </tr>

              </table>

            </td>

          </tr>

          

          <!-- Security Notice -->

          <tr>

            <td class="mobile-padding" style="padding: 0 45px 30px 45px;">

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff3cd; border-radius: 8px;">

                <tr>

                  <td style="padding: 15px 20px;">

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">

                      <tr>

                        <td width="30" valign="top">

                          <span style="font-size: 20px;">🔒</span>

                        </td>

                        <td>

                          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #856404; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

                            <strong>Recordatorio de seguridad:</strong> Hunt Tickets nunca te pedirá tu código de verificación por teléfono, WhatsApp o correo. Mantén tu código privado.

                          </p>

                        </td>

                      </tr>

                    </table>

                  </td>

                </tr>

              </table>

            </td>

          </tr>

          

          <!-- Legal Footer with all info -->

          <tr>

            <td style="padding: 20px 30px; background-color: #f3f3f3; font-size: 11px; color: #777777; text-align: center; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

              <p style="margin: 0 0 10px 0; font-size: 13px; color: #555555; font-weight: 500; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

                © 2025 Hunt Tickets S.A.S. NIT 901881747-0

              </p>

              <p style="margin: 0 0 15px 0; font-size: 12px; color: #666666; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

                ¿Necesitas ayuda? Escríbenos a <a href="mailto:info@hunt-tickets.com" style="color: #555555; text-decoration: underline;">info@hunt-tickets.com</a>

              </p>

              <p style="margin: 0; line-height: 1.6; font-weight: 400; text-align: justify; font-family: 'Source Sans 3', Helvetica, Arial, sans-serif;">

                Por favor, no respondas ya que esta dirección no acepta correos electrónicos y no recibirás respuesta. Este correo electrónico de servicio contiene información esencial relacionada con tu cuenta de Hunt Tickets, tus compras reciente, reservas o suscripciones a uno de nuestros servicios. En Hunt Tickets respetamos y protegemos tu privacidad de acuerdo con nuestra <a href="https://www.hunt-tickets.com/resources/privacy" style="color: #555; text-decoration: underline;">Política de Privacidad</a> y <a href="https://www.hunt-tickets.com/resources/terms-and-conditions" style="color: #555; text-decoration: underline;">Términos & Condiciones</a>.

                Este correo ha sido enviado por Hunt Tickets S.A.S (NIT 901881747-0), con sede en la ciudad de Bogotá D.C., Colombia. La información contenida es confidencial y de uso exclusivo del destinatario.

              </p>

            </td>

          </tr>

          

        </table>

        

        <!--[if mso]>

        </td>

        </tr>

        </table>

        <![endif]-->

        

      </td>

    </tr>

  </table>

</body>

</html>`,
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
    passkey({
      rpID: "auth.hunt-tickets.com",
      rpName: "Hunt Tickets Auth",
      origin: "https://auth.hunt-tickets.com",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
  ],

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
