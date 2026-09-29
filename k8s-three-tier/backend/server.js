const express = require("express");
const { Pool } = require("pg");
const promClient = require("prom-client");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Application metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

const dbQueryDuration = new promClient.Histogram({
  name: "db_query_duration_seconds",
  help: "Database query latency in seconds",
  labelNames: ["query_type"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

const activeRequests = new promClient.Gauge({
  name: "http_requests_active",
  help: "Number of active HTTP requests",
  registers: [register]
});

const dbConnections = new promClient.Gauge({
  name: "db_connections_active",
  help: "Number of active database connections",
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  activeRequests.inc();
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
    activeRequests.dec();
  });

  next();
});

const pool = new Pool({
  host: process.env.DATABASE_HOST || "postgres-svc",
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl:
    process.env.DATABASE_SSLMODE &&
    process.env.DATABASE_SSLMODE !== "disable"
      ? { rejectUnauthorized: false }
      : false
});

app.get("/", (req, res) => {
  res.json({
    service: "three-tier-backend",
    status: "running"
  });
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.get("/ready", async (req, res) => {
  try {
    const queryStart = Date.now();
    await pool.query("SELECT 1");
    const queryDuration = (Date.now() - queryStart) / 1000;

    dbQueryDuration.labels("health_check").observe(queryDuration);

    res.status(200).json({
      status: "ready",
      database: "connected"
    });
  } catch (error) {
    console.error("Database readiness check failed:", error.message);

    res.status(503).json({
      status: "not_ready",
      database: "disconnected"
    });
  }
});

app.get("/api", async (req, res) => {
  try {
    const queryStart = Date.now();
    const result = await pool.query("SELECT NOW() AS server_time");
    const queryDuration = (Date.now() - queryStart) / 1000;

    dbQueryDuration.labels("api_query").observe(queryDuration);
    dbConnections.set(pool.totalCount || 0);

    res.status(200).json({
      service: "three-tier-backend",
      database: "connected",
      server_time: result.rows[0].server_time
    });
  } catch (error) {
    console.error("API database query failed:", error.message);

    res.status(500).json({
      error: "Database query failed"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
  console.log(`Metrics available at http://0.0.0.0:${port}/metrics`);
});
