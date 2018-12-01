import 'dotenv/config';

interface Config {
  env: string;
  port: number;
  jwtSecret: string;
  mongoUrl: string;
  dsn: string;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  mongoUrl: process.env.MONGO_URL || '',
  dsn: process.env.SENTRY_DSN || '',
};

export default config;
