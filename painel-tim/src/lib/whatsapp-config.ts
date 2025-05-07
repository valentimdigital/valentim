import { WASocket } from 'baileys';

export const whatsappConfig = {
  authDir: 'auth_info_baileys',
  browser: ["AmandaBOT", "Chrome", "1.0.0"],
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 15000,
  retryRequestDelayMs: 3000,
  maxRetries: 3,
  markOnlineOnConnect: true,
  emitOwnEvents: true,
  fireInitQueries: true,
  syncFullHistory: false,
};

export let globalSock: WASocket | null = null;

export function setGlobalSock(sock: WASocket) {
  globalSock = sock;
}

export function getGlobalSock() {
  return globalSock;
} 