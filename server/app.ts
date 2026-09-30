import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { getAppConfig } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): express.Express {
  const config = getAppConfig();
  const app = express();

  // Vercel / reverse proxy đứng trước app
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      // Chỉ cho phép các origin khai báo trong FRONTEND_URL (phân tách bằng dấu phẩy)
      origin: (origin, callback) => {
        callback(null, !origin || config.frontendOrigins.includes(origin));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
