import { WASocket, proto } from 'baileys';
import { getGlobalSock } from './whatsapp-config';

export function init(sock: WASocket) {
  console.log('AmandaBOT initialized');
}

export function handle(msg: any) {
  const sock = getGlobalSock();
  if (!sock) return;

  try {
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (!message) return;

    const from = msg.key.remoteJid;
    if (!from) return;

    console.log('Message received:', {
      from,
      message,
      timestamp: msg.messageTimestamp
    });

    // Aqui você pode adicionar lógica de resposta automática
    // Por exemplo:
    if (message.toLowerCase().includes('oi') || message.toLowerCase().includes('olá')) {
      sock.sendMessage(from, { text: 'Olá! Como posso ajudar?' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
} 