import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Needed for correct client IPs (and therefore rate limiting) behind a reverse proxy.
  if (env.trustProxy) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigins,
      methods: ['GET', 'POST', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logs never include bodies, so tracking tokens and passwords are not logged.
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use(express.json({ limit: '50kb' }));

  // Responses contain credentials or private data; never let intermediaries cache them.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/admin', adminRoutes);
  app.use('/api', publicRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
