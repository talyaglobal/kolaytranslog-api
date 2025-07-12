import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { registerRoutes } from '@api/routes/index';
import { errorHandler } from '@api/middlewares/error-handler';
import { notFoundHandler } from '@api/middlewares/not-found';
import pino from 'pino';
import { config } from '@config';

const logger = pino({ level: config.get('log.level') });

// Load Swagger document
const swaggerDocument = YAML.load(config.get('swagger.path'));

const app: Application = express();

// Trust proxy (required for rate limiting behind reverse proxy)
app.set('trust proxy', true);

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "*"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({ origin: config.get('cors.origins') }));
app.use(
  rateLimit({
    windowMs: config.get('rateLimit.windowMs'),
    max: config.get('rateLimit.maxRequests'),
  })
);

// Logging
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
registerRoutes(app);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;