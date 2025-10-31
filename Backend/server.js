require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const { limiter, authLimiter } = require('./middleware/security');
const globalErrorHandler = require('./utils/errorHandler');
const cache = require('./utils/cache');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://edu-nexus-backend.vercel.app",
  ],
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(mongoSanitize());
app.use(cookieParser());

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edunexus');
cache.connect();

// Root status page for quick live check
app.get('/', (req, res) => {
  res.status(200).send(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Edu-Nexus API</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu; background:#f8fafc; color:#0f172a; margin:0;}
    .wrap{max-width:720px;margin:80px auto;padding:24px}
    .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;box-shadow:0 1px 2px rgba(16,24,40,.04)}
    h1{margin:0 0 8px 0;font-size:28px}
    p{margin:0 0 8px 0;color:#334155}
    code{background:#f1f5f9;padding:2px 6px;border-radius:6px}
    .meta{margin-top:12px;font-size:14px;color:#475569}
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Edu-Nexus API is live ✅</h1>
      <p>Environment: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
      <p>Time: <code>${new Date().toISOString()}</code></p>
      <p>Try the health check: <code>/health</code></p>
    </div>
  </div>
</body>
</html>`
  );
});

// Health check endpoint for uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/instructor', require('./routes/instructor'));

app.use(globalErrorHandler);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));