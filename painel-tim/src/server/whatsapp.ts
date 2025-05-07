import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { whatsappConfig } from '../config/whatsapp';
import { logger } from '../lib/logger';

let sock: any = null;
let reconnectAttempts = 0;

async function start() {
  try {
    logger.info('Iniciando conexão com WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState(whatsappConfig.authPath);
    
    sock = makeWASocket({
      auth: state,
      ...whatsappConfig.socket,
      browser: ['AmandaBOT', 'Chrome', '1.0.0'] as [string, string, string],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        try {
          const qrString = await QRCode.toString(qr, { type: 'terminal' });
          console.log(qrString);
          reconnectAttempts = 0;
        } catch (err) {
          logger.error('Erro ao gerar QR code:', err);
        }
      }

      if (connection === 'open') {
        logger.info('✅ WhatsApp conectado com sucesso!');
        reconnectAttempts = 0;
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== DisconnectReason.connectionClosed;
        
        if (shouldReconnect && reconnectAttempts < whatsappConfig.reconnect.maxAttempts) {
          reconnectAttempts++;
          setTimeout(start, whatsappConfig.reconnect.delay);
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao iniciar conexão:', error);
    if (reconnectAttempts < whatsappConfig.reconnect.maxAttempts) {
      reconnectAttempts++;
      setTimeout(start, whatsappConfig.reconnect.delay);
    }
  }
}

process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  if (sock) sock.end();
  if (reconnectAttempts < whatsappConfig.reconnect.maxAttempts) {
    reconnectAttempts++;
    setTimeout(start, whatsappConfig.reconnect.delay);
  }
});

process.on('unhandledRejection', (error) => {
  logger.error('Promessa rejeitada não tratada:', error);
  if (sock) sock.end();
  if (reconnectAttempts < whatsappConfig.reconnect.maxAttempts) {
    reconnectAttempts++;
    setTimeout(start, whatsappConfig.reconnect.delay);
  }
});

export { start as startWhatsApp }; 