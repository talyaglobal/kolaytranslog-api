import 'reflect-metadata';
import './container';
import app from './app';
import pino from 'pino';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const logger = pino({ level: process.env.LOG_LEVEL });
const port = parseInt(process.env.PORT || '3000');

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Graceful shutdown initiated');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
