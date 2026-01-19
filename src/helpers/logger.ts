/**
 * Logger helper using Winston
 */

import winston from 'winston';

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Get log level from environment or default to 'info'
 */
function getLogLevel(): string {
  return process.env.LOG_LEVEL || 'info';
}

/**
 * Create a Winston logger instance
 */
function createWinstonLogger(context?: string): winston.Logger {
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, context: ctx, ...meta }) => {
      const contextStr = ctx || context || 'app';
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level.toUpperCase()}] [${contextStr}] ${message}${metaStr}`;
    })
  );

  return winston.createLogger({
    level: getLogLevel(),
    format: logFormat,
    transports: [
      // Write logs to stderr to avoid interfering with MCP stdio transport
      new winston.transports.Console({
        stderrLevels: ['error', 'warn', 'info', 'debug'],
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      })
    ]
  });
}

/**
 * Create a startup logger
 */
export function createStartupLogger(): winston.Logger {
  return createWinstonLogger('startup');
}

/**
 * Create a middleware logger
 */
export function createMiddlewareLogger(): winston.Logger {
  return createWinstonLogger('middleware');
}

/**
 * Create a service logger with context
 */
export function createLogger(context: string): winston.Logger {
  return createWinstonLogger(context);
}

/**
 * Default logger instance
 */
export const logger = createLogger('app');
