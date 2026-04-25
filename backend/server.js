'use strict';

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const { PORT, APP_NAME, API_VERSION } = require('./config/env');
const requestLogger              = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const routes                     = require('./routes/index');

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    /^http:\/\/localhost:\d+$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────

// Global limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait and try again.' },
});

// Strict limiter for auth routes: 10 per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait.' },
});

app.use(globalLimiter);
app.use(`/api/${API_VERSION}/auth`, authLimiter);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(requestLogger);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(`/api/${API_VERSION}`, routes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Port Binding ─────────────────────────────────────────────────────────────
const MAX_RETRIES = 5;

function startServer(port, attempt = 1) {
  const server = app.listen(port);

  server.on('listening', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🚀  ${APP_NAME} is running`);
    console.log(`  ENV : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  PORT: ${port}`);
    console.log(`  URL : http://localhost:${port}/api/${API_VERSION}`);
    console.log(`  DB  : JSON file store (data/)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempt >= MAX_RETRIES) {
        console.error(`❌ Could not bind to any port in range ${PORT}–${PORT + MAX_RETRIES - 1}.`);
        process.exit(1);
      }
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} in use → retrying on ${nextPort}…`);
      startServer(nextPort, attempt + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  return server;
}

startServer(PORT);

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

module.exports = app;
