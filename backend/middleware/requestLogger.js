const LOG_ALL = process.env.LOG_ALL_REQUESTS === 'true';
const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS || 300);

function requestLogger() {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      const isSlow = durationMs >= SLOW_REQUEST_MS;
      const isError = res.statusCode >= 500;

      if (LOG_ALL || isSlow || isError) {
        const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`;
        if (isSlow) {
          console.warn(`[slow] ${msg}`);
        } else if (isError) {
          console.error(`[error] ${msg}`);
        } else {
          console.log(`[req] ${msg}`);
        }
      }
    });

    next();
  };
}

module.exports = requestLogger;
