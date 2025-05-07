import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import makeWASocket, { BinaryInfo, DisconnectReason, encodeWAM, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState, proto, WAMessageContent, WAMessageKey, makeInMemoryStore } from 'baileys';
import MAIN_LOGGER from 'baileys/lib/Utils/logger';
import fs from 'fs';
import { init, handle } from './AmandaBOT';
import { whatsappConfig, setGlobalSock } from './whatsapp-config';

const logger = MAIN_LOGGER.child({});
logger.level = 'error';
const msgRetryCounterCache = new NodeCache();

// Variáveis internas para status e store
let isConnected = false;
let lastQr: string | null = null;
let store: ReturnType<typeof makeInMemoryStore> | null = null;

async function startSock() {
  const authState = await useMultiFileAuthState(whatsappConfig.authDir);
  const { state, saveCreds } = authState;
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);
  
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    browser: whatsappConfig.browser,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage,
    connectTimeoutMs: whatsappConfig.connectTimeoutMs,
    defaultQueryTimeoutMs: whatsappConfig.defaultQueryTimeoutMs,
    keepAliveIntervalMs: whatsappConfig.keepAliveIntervalMs,
    retryRequestDelayMs: whatsappConfig.retryRequestDelayMs,
    maxRetries: whatsappConfig.maxRetries,
    markOnlineOnConnect: whatsappConfig.markOnlineOnConnect,
    emitOwnEvents: whatsappConfig.emitOwnEvents,
    fireInitQueries: whatsappConfig.fireInitQueries,
    syncFullHistory: whatsappConfig.syncFullHistory,
  });

  setGlobalSock(sock);
  store = makeInMemoryStore({});
  store.bind(sock.ev);

  sock.ev.process(async (events) => {
    if (events['connection.update']) {
      const update = events['connection.update'];
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        lastQr = qr;
      }
      if (connection === 'close') {
        isConnected = false;
        if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
          startSock();
        } else {
          console.log('Connection closed. You are logged out.');
        }
      }
      if (connection === 'open') {
        isConnected = true;
        lastQr = null;
        init(sock);
      }
    }
    if (events['creds.update']) {
      await saveCreds();
    }
    if (events['messages.upsert']) {
      const upsert = events['messages.upsert'];
      if (upsert.type === 'notify') {
        for (const msg of upsert.messages) {
          handle(msg);
        }
      }
    }
  });

  async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
    return proto.Message.fromObject({});
  }

  return sock;
}

function getStatus() {
  return isConnected;
}

function getQrCode() {
  return lastQr;
}

function getChats() {
  if (!store || !isConnected) return null;
  console.log('DEBUG store.chats:', store.chats);
  return Object.values(store.chats).map((chat: any) => ({
    id: chat.id,
    name: chat.name || chat.id,
    lastMessage: chat.messages?.last?.message?.conversation || '',
    time: chat.messages?.last?.messageTimestamp || '',
    unread: chat.unreadCount || 0,
    avatar: ''
  }));
}

async function getMessages(chatId: string) {
  if (!store || !isConnected) return null;
  try {
    const msgs = await (store.loadMessages as any)(chatId, 20, null);
    return msgs.map((msg: any) => ({
      id: msg.key.id,
      text: msg.message?.conversation || '',
      time: msg.messageTimestamp,
      isMe: msg.key.fromMe
    }));
  } catch {
    return null;
  }
}

export { startSock, getStatus, getQrCode, getChats, getMessages }; 