export interface AppConfiguration {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  frontendUrl: string;
  corsOrigin: string;
  database: { url: string };
  jwt: { secret: string; expiresIn: string };
  uploads: { dir: string; maxBytes: number };
}

export default (): AppConfiguration => ({
  nodeEnv: (process.env.NODE_ENV as AppConfiguration['nodeEnv']) ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  database: { url: process.env.DATABASE_URL ?? '' },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  },
  uploads: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? String(5 * 1024 * 1024), 10),
  },
});
