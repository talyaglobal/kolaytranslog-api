import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import convict from 'convict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env into process.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Define your Convict schema
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },

  app: {
    port: {
      doc: 'The port to bind',
      format: 'port',
      default: 3000,
      env: 'PORT'
    }
  },

  db: {
    url: {
      doc: 'Database connection url',
      format: 'url',
      env: 'DATABASE_URL'
    }
  },

  cors: {
    origins: {
      doc: 'Allowed CORS origins',
      format: Array,
      default: ['*'],
      env: 'CORS_ORIGINS'
    }
  },

  rateLimit: {
    windowMs: {
      doc: 'Rate limiting window in milliseconds',
      format: 'nat',
      default: 15 * 60 * 1000, // 15 minutes
      env: 'RATE_LIMIT_WINDOW_MS'
    },
    maxRequests: {
      doc: 'Max requests per window per IP',
      format: 'nat',
      default: 100,
      env: 'RATE_LIMIT_MAX'
    }
  },

  swagger: {
    path: {
      doc: 'Path to Swagger YAML file',
      format: String,
      default: path.join(__dirname, '../../docs/swagger.yaml'),
      env: 'SWAGGER_PATH'
    }
  },

  log: {
    level: {
      doc: 'Log level for pino',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    }
  },

  supabase: {
    url: {
      doc: 'Supabase URL',
      format: String,
      default: '',
      env: 'SUPABASE_URL'
    },
    anonKey: {
      doc: 'Supabase Anonymous Key',
      format: String,
      default: '',
      env: 'SUPABASE_ANON_KEY'
    },
    serviceRoleKey: {
      doc: 'Supabase Service Role Key',
      format: String,
      default: '',
      env: 'SUPABASE_SERVICE_ROLE_KEY',
      sensitive: true
    },
    storage: {
      bucketName: {
        doc: 'Supabase Storage Bucket Name',
        format: String,
        default: 'uploads',
        env: 'SUPABASE_STORAGE_BUCKET'
      }
    }
  },

  stripe: {
    secretKey: {
      doc: 'Stripe secret key',
      format: String,
      default: '',
      env: 'STRIPE_SECRET_KEY',
      sensitive: true,
    },
    webhookSecret: {
      doc: 'Stripe webhook secret key',
      format: String,
      default: '',
      env: 'STRIPE_WEBHOOK_SECRET',
      sensitive: true,
    }
  },

  email: {
    host: {
      doc: 'SMTP server host',
      format: String,
      default: 'smtp.gmail.com',
      env: 'EMAIL_HOST'
    },
    port: {
      doc: 'SMTP server port',
      format: 'port',
      default: 587,
      env: 'EMAIL_PORT'
    },
    secure: {
      doc: 'Use secure connection (TLS)',
      format: Boolean,
      default: false,
      env: 'EMAIL_SECURE'
    },
    auth: {
      user: {
        doc: 'SMTP username',
        format: String,
        default: '',
        env: 'EMAIL_USER'
      },
      pass: {
        doc: 'SMTP password',
        format: String,
        default: '',
        env: 'EMAIL_PASS',
        sensitive: true
      }
    },
    from: {
      name: {
        doc: 'Default sender name',
        format: String,
        default: 'TransLog API',
        env: 'EMAIL_FROM_NAME'
      },
      address: {
        doc: 'Default sender email address',
        format: String,
        default: 'noreply@translog.com',
        env: 'EMAIL_FROM_ADDRESS'
      }
    }
  }
});

// 3. Load environment-specific overrides
const env = config.get('env');
config.loadFile(path.join(__dirname, `./${env}.json`));

// 4. Validate
config.validate({ allowed: 'strict' });

export { config };
