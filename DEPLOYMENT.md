# Production Deployment Guide

## Overview
This guide covers deploying the Chanitec backend to production environments (Render + AlwaysData MySQL).

## Database Optimization

### AlwaysData MySQL Configuration
- **Connection Limit**: Reduced to 3 connections per pool
- **Queue Limit**: Set to 5 to prevent memory issues
- **Timeout**: 60 seconds for connection acquisition
- **SSL**: Enabled for secure connections

### Environment Variables
```bash
# Database Configuration
DB_HOST=mysql-chanic.alwaysdata.net
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=chanic_db
DB_PORT=3306

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

## Connection Pool Monitoring

### Health Check Endpoint
- **URL**: `GET /api/health`
- **Response**: Connection statistics and database status
- **Use Case**: Load balancer health checks, monitoring

### Connection Statistics
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "connectionStats": {
    "connectionCount": 5,
    "activeConnections": 2,
    "poolSize": 3
  }
}
```

## Performance Optimizations

### Database Queries
- All queries use connection pooling
- Automatic connection release
- Transaction support for complex operations
- Batch operations for bulk inserts

### Connection Management
- **Safe Query Utility**: Automatic connection handling
- **Transaction Support**: Rollback on errors
- **Graceful Shutdown**: Proper connection cleanup

## Deployment Checklist

### Pre-Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Configure database credentials
- [ ] Set up SSL certificates
- [ ] Configure CORS origins

### Database Setup
- [ ] Run migrations: `npm run migrate`
- [ ] Verify connection pool settings
- [ ] Test health check endpoint

### Monitoring
- [ ] Set up connection monitoring
- [ ] Configure error logging
- [ ] Set up performance metrics

## Troubleshooting

### Common Issues

#### Max User Connections Error
**Symptoms**: `max_user_connections` error
**Solution**:
- Reduce `connectionLimit` in pool config
- Check for connection leaks
- Monitor connection usage

#### Connection Timeouts
**Symptoms**: Database connection timeouts
**Solution**:
- Increase `acquireTimeout` and `timeout`
- Check network connectivity
- Verify SSL configuration

#### Memory Issues
**Symptoms**: High memory usage
**Solution**:
- Reduce `queueLimit`
- Monitor connection pool size
- Check for memory leaks in queries

### Debug Commands
```bash
# Check connection status
curl https://your-api.com/api/health

# Monitor logs
tail -f logs/app.log

# Check database connections
mysql -h mysql-chanic.alwaysdata.net -u username -p
SHOW PROCESSLIST;
```

## Security Considerations

### Database Security
- Use SSL connections in production
- Implement connection pooling
- Regular security updates
- Monitor for suspicious activity

### API Security
- CORS configuration
- Input validation
- Error handling
- Rate limiting (consider adding)

## Performance Monitoring

### Key Metrics
- Active connections
- Connection pool utilization
- Query response times
- Error rates

### Monitoring Tools
- Application logs
- Database monitoring
- Health check endpoints
- Performance profiling

## Backup and Recovery

### Database Backups
- Regular automated backups
- Point-in-time recovery
- Test restore procedures

### Application Recovery
- Graceful shutdown handling
- Connection cleanup
- Error recovery procedures