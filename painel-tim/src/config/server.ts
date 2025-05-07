export const serverConfig = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  whatsapp: {
    reconnectAttempts: 3,
    connectTimeout: 60000,
    defaultQueryTimeout: 60000,
    keepAliveInterval: 15000,
    retryRequestDelay: 3000,
    maxRetries: 3,
    browser: ["AmandaBOT", "Chrome", "1.0.0"],
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por janela
  },
}; 