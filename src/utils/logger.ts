import pino from 'pino';

const logger = pino(
  process.env.NODE_ENV === 'development'
    ? {
        level: process.env.LOG_LEVEL || 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
              level: 'debug',
            },            
            {
              target: 'pino/file',
              options: {
                destination: './logs/app.log',
              },
              level: 'info',
            },

            {
              target: 'pino/file',
              options: {
                destination: './logs/error.log',
              },
              level: 'error',
            },
          ],
        },
        serializers: {
          err: pino.stdSerializers.err,
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
        },
      }
    : {
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        transport: {
          targets: [
            {
              target: 'pino/file',
              options: {
                destination: './logs/app.log',
              },
              level: 'info',
            },
            {
              target: 'pino/file',
              options: {
                destination: './logs/error.log',
              },
              level: 'error',
            },
          ],
        },
        serializers: {
          err: pino.stdSerializers.err,
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
        },
      }
);

export default logger;