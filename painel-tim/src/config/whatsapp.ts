import { serverConfig } from './server';

export const whatsappConfig = {
  authPath: 'auth_info_baileys',
  socket: {
    printQRInTerminal: true,
    connectTimeoutMs: serverConfig.whatsapp.connectTimeout,
    defaultQueryTimeoutMs: serverConfig.whatsapp.defaultQueryTimeout,
    keepAliveIntervalMs: serverConfig.whatsapp.keepAliveInterval,
    retryRequestDelayMs: serverConfig.whatsapp.retryRequestDelay,
    maxRetries: serverConfig.whatsapp.maxRetries,
    browser: serverConfig.whatsapp.browser,
    markOnlineOnConnect: true,
    emitOwnEvents: true,
    fireInitQueries: true,
    syncFullHistory: false,
  },
  reconnect: {
    maxAttempts: serverConfig.whatsapp.reconnectAttempts,
    delay: 3000,
  },
}; 