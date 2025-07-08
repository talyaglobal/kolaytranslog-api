import 'reflect-metadata';
import './container';
import app from './app';
import pino from 'pino';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '@utils/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
