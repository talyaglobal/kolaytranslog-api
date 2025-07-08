import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { registerRoutes } from '@api/routes';
import { errorHandler } from '@api/middlewares/error-handler';
import { notFoundHandler } from '@api/middlewares/not-found';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL });

// Load Swagger document
const swaggerDocument = YAML.load(process.env.SWAGGER_PATH || '');

const app: Application = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS }));
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  })
);

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

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