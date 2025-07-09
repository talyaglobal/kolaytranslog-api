import path from 'path';
import dotenv from 'dotenv';
import convict from 'convict';

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
    host: {
      doc: 'Database host name/IP',
      format: String,
      default: 'localhost',
      env: 'DB_HOST'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 5432,
      env: 'DB_PORT'
    },
    user: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'DB_USER'
    },
    password: {
      doc: 'Database password',
      format: String,
      default: '',
      env: 'DB_PASS',
      sensitive: true
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'appdb',
      env: 'DB_NAME'
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
  }
});

// 3. Load environment-specific overrides
const env = config.get('env');
config.loadFile(path.join(__dirname, `./${env}.json`));

// 4. Validate
config.validate({ allowed: 'strict' });

export { config };
