import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class WhatsAppService extends EventEmitter {
  private socket: any;
  private sessionId: string;
  private isConnected: boolean = false;
  
  constructor(sessionId: string) {
    super();
    this.sessionId = sessionId;
  }
  
  async connect() {
    // Carregar estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${this.sessionId}`);
    
    // Obter versão mais recente do Baileys
    const { version } = await fetchLatestBaileysVersion();
    
    // Criar socket WhatsApp
    this.socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console.log)
      },
      printQRInTerminal: true,
      syncFullHistory: true
    });
    
    // Configurar handlers de eventos
    this.setupEventHandlers(saveCreds);
    
    return this;
  }
  
  private setupEventHandlers(saveCreds: any) {
    // Handler de conexão
    this.socket.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (connection === 'open') {
        this.isConnected = true;
        this.emit('connected', this.socket.user);
        
        // Salvar informações da sessão no banco de dados
        await prisma.whatsAppSession.upsert({
          where: { id: this.sessionId },
          update: { 
            isConnected: true,
            phoneNumber: this.socket.user.id.split(':')[0]
          },
          create: {
            id: this.sessionId,
            isConnected: true,
            phoneNumber: this.socket.user.id.split(':')[0],
            createdAt: new Date()
          }
        });
      } else if (connection === 'close') {
        this.isConnected = false;
        
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        
        // Reconectar se não for logout deliberado
        if (statusCode !== DisconnectReason.loggedOut) {
          this.connect();
        } else {
          // Atualizar status no banco de dados
          await prisma.whatsAppSession.update({
            where: { id: this.sessionId },
            data: { isConnected: false }
          });
          
          this.emit('disconnected', 'logged_out');
        }
      }
      
      if (qr) {
        this.emit('qr', qr);
      }
    });
    
    // Salvar credenciais quando atualizadas
    this.socket.ev.on('creds.update', saveCreds);
    
    // Handler de mensagens
    this.socket.ev.on('messages.upsert', async (m: any) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe) {
            // Processar mensagem recebida
            this.processIncomingMessage(msg);
          }
        }
      }
    });
  }
  
  async processIncomingMessage(msg: any) {
    const sender = msg.key.remoteJid;
    const messageContent = msg.message?.conversation || 
                          msg.message?.extendedTextMessage?.text || 
                          'Mídia não suportada';
    
    // Salvar mensagem no banco de dados
    await prisma.message.create({
      data: {
        sessionId: this.sessionId,
        messageId: msg.key.id,
        sender,
        content: messageContent,
        timestamp: new Date(msg.messageTimestamp * 1000),
        isFromMe: false,
        status: 'received'
      }
    });
    
    // Verificar se já existe uma conversa ou criar nova
    const conversation = await prisma.conversation.findFirst({
      where: { 
        sessionId: this.sessionId,
        phoneNumber: sender
      }
    });
    
    if (conversation) {
      // Atualizar conversa existente
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 }
        }
      });
    } else {
      // Criar nova conversa
      await prisma.conversation.create({
        data: {
          sessionId: this.sessionId,
          phoneNumber: sender,
          lastMessage: messageContent,
          lastMessageAt: new Date(),
          unreadCount: 1,
          status: 'pending'
        }
      });
    }
    
    // Emitir evento de nova mensagem
    this.emit('message', {
      sender,
      content: messageContent,
      timestamp: new Date(msg.messageTimestamp * 1000),
      messageId: msg.key.id
    });
  }
  
  async sendMessage(to: string, text: string) {
    if (!this.isConnected) {
      throw new Error('WhatsApp não está conectado');
    }
    
    // Normalizar número de telefone
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    
    // Enviar mensagem
    const sentMsg = await this.socket.sendMessage(jid, { text });
    
    // Salvar mensagem no banco de dados
    await prisma.message.create({
      data: {
        sessionId: this.sessionId,
        messageId: sentMsg.key.id,
        sender: jid,
        content: text,
        timestamp: new Date(),
        isFromMe: true,
        status: 'sent'
      }
    });
    
    // Atualizar conversa
    const conversation = await prisma.conversation.findFirst({
      where: { 
        sessionId: this.sessionId,
        phoneNumber: jid
      }
    });
    
    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: text,
          lastMessageAt: new Date()
        }
      });
    } else {
      await prisma.conversation.create({
        data: {
          sessionId: this.sessionId,
          phoneNumber: jid,
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: 0,
          status: 'active'
        }
      });
    }
    
    return sentMsg;
  }
  
  async logout() {
    if (this.socket) {
      await this.socket.logout();
      await this.socket.end();
      
      // Atualizar status no banco de dados
      await prisma.whatsAppSession.update({
        where: { id: this.sessionId },
        data: { isConnected: false }
      });
      
      this.isConnected = false;
    }
  }
  
  // Métodos adicionais para gerenciamento de conversas
  async getConversations(status?: string, limit = 50, offset = 0) {
    const where = status ? 
      { sessionId: this.sessionId, status } : 
      { sessionId: this.sessionId };
    
    return prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      skip: offset
    });
  }
  
  async getMessages(phoneNumber: string, limit = 50, offset = 0) {
    return prisma.message.findMany({
      where: {
        sessionId: this.sessionId,
        sender: phoneNumber.includes('@s.whatsapp.net') ? 
          phoneNumber : `${phoneNumber}@s.whatsapp.net`
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
      skip: offset
    });
  }
  
  async updateConversationStatus(phoneNumber: string, status: string) {
    const jid = phoneNumber.includes('@s.whatsapp.net') ? 
      phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    
    return prisma.conversation.updateMany({
      where: {
        sessionId: this.sessionId,
        phoneNumber: jid
      },
      data: { status }
    });
  }
  
  async markConversationAsRead(phoneNumber: string) {
    const jid = phoneNumber.includes('@s.whatsapp.net') ? 
      phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    
    return prisma.conversation.updateMany({
      where: {
        sessionId: this.sessionId,
        phoneNumber: jid
      },
      data: { unreadCount: 0 }
    });
  }
}

export default WhatsAppService;
