import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'production', 'test']).default('development');

const databaseEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  DATABASE_URL: z.string().min(1, 'là bắt buộc'),
  DATABASE_SSL: z.enum(['true', 'false']).default('true'),
});

const appEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  JWT_SECRET: z.string().min(32, 'phải có ít nhất 32 ký tự'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(28800),
  FRONTEND_URL: z.string().min(1, 'là bắt buộc'),
});

function parseEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join('; ');
    // Chỉ nêu tên biến bị lỗi, không in giá trị (tránh lộ secret trong log)
    throw new Error(`Biến môi trường không hợp lệ: ${problems}`);
  }
  return result.data;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  isProduction: boolean;
}

export interface AppConfig {
  isProduction: boolean;
  port: number;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  frontendOrigins: string[];
}

let databaseConfig: DatabaseConfig | undefined;
let appConfig: AppConfig | undefined;

// Tách 2 nhóm cấu hình để script migrate/seed chỉ cần DATABASE_URL
export function getDatabaseConfig(): DatabaseConfig {
  if (!databaseConfig) {
    const env = parseEnv(databaseEnvSchema);
    databaseConfig = {
      url: env.DATABASE_URL,
      ssl: env.DATABASE_SSL === 'true',
      isProduction: env.NODE_ENV === 'production',
    };
  }
  return databaseConfig;
}

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    const env = parseEnv(appEnvSchema);
    appConfig = {
      isProduction: env.NODE_ENV === 'production',
      port: env.PORT,
      jwtSecret: env.JWT_SECRET,
      jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
      frontendOrigins: env.FRONTEND_URL.split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    };
  }
  return appConfig;
}
