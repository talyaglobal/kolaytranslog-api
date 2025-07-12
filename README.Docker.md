# Docker Deployment Guide

This guide explains how to deploy the TransLog API using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Environment variables configured

## Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your actual configuration values:
- Database credentials
- Supabase keys
- Stripe keys
- Email configuration

### 2. Development Environment

For local development with hot reload:
```bash
npm run docker:up:dev
```

This uses `docker-compose.dev.yml` which includes:
- Hot reload with volume mounting
- Uses your Supabase database
- Debug-friendly configuration

### 3. Production Environment

For production deployment:
```bash
npm run docker:up
```

This uses `docker-compose.yml` which includes:
- Optimized production build
- Nginx reverse proxy with SSL termination
- Health checks
- Uses your Supabase database

## Available Scripts

- `npm run docker:build` - Build the Docker image
- `npm run docker:run` - Run a single container
- `npm run docker:up` - Start all services (production)
- `npm run docker:up:dev` - Start all services (development)
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View application logs
- `npm run docker:shell` - Access container shell

## Services

### Application (app)
- **Port**: 3000
- **Health Check**: GET /health
- **Logs**: `docker-compose logs app`

### Database
- **Type**: Supabase PostgreSQL (external)
- **Connection**: Via DATABASE_URL environment variable

### Nginx (nginx) - Production Only
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: SSL termination, rate limiting, gzip compression

## SSL Configuration

For HTTPS support, place your SSL certificates in `./ssl/`:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

Or use Let's Encrypt with:
```bash
# Generate certificates (example)
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

## Database Migrations

Run migrations in production:
```bash
docker-compose exec app npm run migrate:deploy
```

## Monitoring

### Health Checks
- Application: `curl http://localhost:3000/health`
- Database: `docker-compose exec db pg_isready -U postgres`

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx
```

### Resource Usage
```bash
docker stats
```

## Troubleshooting

### Application won't start
1. Check logs: `docker-compose logs app`
2. Verify environment variables
3. Ensure database is healthy: `docker-compose logs db`

### Database connection issues
1. Verify DATABASE_URL in .env points to your Supabase instance
2. Check Supabase console for connection limits
3. Ensure your IP is allowed in Supabase settings
4. Test connection: `docker-compose exec app node -e "console.log(process.env.DATABASE_URL)"`

### SSL/HTTPS issues
1. Verify certificate files exist in `./ssl/`
2. Check nginx logs: `docker-compose logs nginx`
3. Test certificate: `openssl x509 -in ./ssl/cert.pem -text -noout`

### Performance issues
1. Monitor resources: `docker stats`
2. Check application logs for errors
3. Review nginx access logs
4. Consider scaling: `docker-compose up --scale app=3`

## Production Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates in place
- [ ] Database backups configured
- [ ] Log rotation configured
- [ ] Monitoring/alerting setup
- [ ] Firewall rules configured
- [ ] Domain DNS pointing to server
- [ ] Let's Encrypt auto-renewal setup

## Security Considerations

1. **Environment Variables**: Never commit .env files
2. **Database**: Use strong passwords, limit connections
3. **SSL**: Use strong ciphers, HSTS headers
4. **Rate Limiting**: Configure appropriate limits
5. **File Uploads**: Validate file types and sizes
6. **CORS**: Configure specific origins, not "*"

## Backup Strategy

### Database Backup
Database backups are handled by Supabase:
- Automatic daily backups in Supabase dashboard
- Point-in-time recovery available
- Manual backups can be created via Supabase console

### Application Data
- Document uploads are stored in Supabase
- Configuration should be version controlled
- Logs can be archived periodically