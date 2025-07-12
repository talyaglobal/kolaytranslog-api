import 'reflect-metadata';
import './container.js';
import app from './app.js';
import pino from 'pino';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '@utils/logger';
import { config } from '@config';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log(config.get('app.port'));
const port = config.get('app.port');

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
