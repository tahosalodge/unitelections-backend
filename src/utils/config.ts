import 'dotenv/config';

interface Config {
  env: string;
  isDevelopment: boolean;
  port: number;
  jwtSecret: string;
  mongoUrl: string;
  sentry: string;
  mailgun: {
    key: string;
    domain: string;
  };
  fromEmail: string;
  smtp: string;
  publicUrl: string;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  mongoUrl: process.env.MONGO_URL || '',
  sentry: process.env.SENTRY_DSN || '',
  mailgun: {
    key: process.env.MAILGUN_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || '',
  },
  fromEmail: process.env.FROM_EMAIL || '',
  smtp: process.env.SMTP_STRING || '',
  publicUrl: process.env.PUBLIC_URL || '',
};

export default config;
