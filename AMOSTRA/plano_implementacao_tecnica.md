# Plano de Implementação Técnica - Integração WhatsApp

## Visão Geral

Este documento apresenta o plano de implementação técnica para a integração do WhatsApp ao Painel de Vendas TIM, utilizando a biblioteca Baileys conforme preferência do cliente. A implementação seguirá a interface visual já projetada e demonstrada no mockup.

## Arquitetura da Solução

### Componentes Principais

1. **Backend (Node.js/Express)**
   - API RESTful para comunicação com o frontend
   - Integração com WhatsApp via Baileys
   - Gerenciamento de sessões e autenticação
   - Armazenamento de mensagens e metadados

2. **Frontend (Next.js/React)**
   - Interface de usuário conforme mockup
   - Comunicação em tempo real com o backend
   - Gerenciamento de estado da aplicação
   - Componentes reutilizáveis

3. **Banco de Dados (PostgreSQL/Prisma)**
   - Armazenamento de conversas e mensagens
   - Metadados de clientes e atendimentos
   - Histórico de interações
   - Configurações e preferências

4. **Integração WhatsApp (Baileys)**
   - Conexão com WhatsApp Web
   - Envio e recebimento de mensagens
   - Gerenciamento de sessões
   - Tratamento de eventos (mensagens, status, etc.)

## Detalhamento da Implementação

### 1. Configuração do Ambiente

#### 1.1. Dependências do Backend
```bash
# Instalação das dependências principais
npm install @whiskeysockets/baileys@latest
npm install qrcode-terminal # Para exibir QR code no terminal
npm install express cors socket.io
npm install prisma @prisma/client
npm install dotenv jsonwebtoken bcrypt

# Dependências de desenvolvimento
npm install -D typescript ts-node nodemon
```

#### 1.2. Estrutura de Diretórios
```
/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações da aplicação
│   │   ├── controllers/    # Controladores da API
│   │   ├── middlewares/    # Middlewares (auth, validação)
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços de negócio
│   │   │   └── whatsapp/   # Serviço de integração WhatsApp
│   │   ├── utils/          # Utilitários
│   │   └── app.ts          # Aplicação Express
│   ├── prisma/             # Configuração do Prisma
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── chat/       # Componentes de chat
│   │   │   ├── contacts/   # Lista de contatos
│   │   │   └── info/       # Painel de informações
│   │   ├── contexts/       # Contextos React
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── styles/         # Estilos globais
│   │   └── utils/          # Utilitários
│   └── package.json
```

### 2. Implementação do Backend

#### 2.1. Serviço de Integração WhatsApp (Baileys)

```typescript
// src/services/whatsapp/connection.ts
import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { prisma } from '../../config/database';
import { EventEmitter } from 'events';

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
```

#### 2.2. API RESTful para Comunicação com Frontend

```typescript
// src/controllers/whatsapp.controller.ts
import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsapp/connection';
import { prisma } from '../config/database';

// Mapa de instâncias de serviço WhatsApp
const whatsappInstances: Map<string, WhatsAppService> = new Map();

export const initializeWhatsApp = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Verificar se já existe uma instância
    if (whatsappInstances.has(sessionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sessão já inicializada' 
      });
    }
    
    // Criar nova instância
    const whatsapp = new WhatsAppService(sessionId);
    await whatsapp.connect();
    
    // Armazenar instância
    whatsappInstances.set(sessionId, whatsapp);
    
    // Configurar socket.io para QR code
    whatsapp.on('qr', (qr) => {
      req.app.get('io').to(sessionId).emit('whatsapp:qr', qr);
    });
    
    whatsapp.on('connected', (user) => {
      req.app.get('io').to(sessionId).emit('whatsapp:connected', user);
    });
    
    whatsapp.on('disconnected', (reason) => {
      req.app.get('io').to(sessionId).emit('whatsapp:disconnected', reason);
    });
    
    whatsapp.on('message', (message) => {
      req.app.get('io').to(sessionId).emit('whatsapp:message', message);
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Inicialização em andamento' 
    });
  } catch (error) {
    console.error('Erro ao inicializar WhatsApp:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao inicializar WhatsApp', 
      error: error.message 
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { status, limit, offset } = req.query;
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    const conversations = await whatsapp.getConversations(
      status as string,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );
    
    return res.status(200).json({ 
      success: true, 
      data: conversations 
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar conversas', 
      error: error.message 
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    const { limit, offset } = req.query;
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    const messages = await whatsapp.getMessages(
      phoneNumber,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );
    
    return res.status(200).json({ 
      success: true, 
      data: messages 
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar mensagens', 
      error: error.message 
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Texto da mensagem é obrigatório' 
      });
    }
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    const sentMsg = await whatsapp.sendMessage(phoneNumber, text);
    
    return res.status(200).json({ 
      success: true, 
      data: sentMsg 
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem', 
      error: error.message 
    });
  }
};

export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status é obrigatório' 
      });
    }
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    await whatsapp.updateConversationStatus(phoneNumber, status);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Status atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar status da conversa:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status da conversa', 
      error: error.message 
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    await whatsapp.markConversationAsRead(phoneNumber);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Conversa marcada como lida' 
    });
  } catch (error) {
    console.error('Erro ao marcar conversa como lida:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao marcar conversa como lida', 
      error: error.message 
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const whatsapp = whatsappInstances.get(sessionId);
    if (!whatsapp) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }
    
    await whatsapp.logout();
    whatsappInstances.delete(sessionId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao realizar logout', 
      error: error.message 
    });
  }
};
```

#### 2.3. Modelo de Dados (Prisma Schema)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WhatsAppSession {
  id          String   @id
  isConnected Boolean  @default(false)
  phoneNumber String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Conversation {
  id            String   @id @default(uuid())
  sessionId     String
  phoneNumber   String
  name          String?
  lastMessage   String?
  lastMessageAt DateTime @default(now())
  unreadCount   Int      @default(0)
  status        String   @default("pending") // pending, active, closed
  assignedTo    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([sessionId, phoneNumber])
}

model Message {
  id        String   @id @default(uuid())
  sessionId String
  messageId String?
  sender    String
  content   String
  timestamp DateTime @default(now())
  isFromMe  Boolean  @default(false)
  status    String   @default("sent") // sent, delivered, read
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Client {
  id              String   @id @default(uuid())
  name            String
  phoneNumber     String
  cnpj            String?
  email           String?
  companyType     String?
  creditLimit     Boolean  @default(false)
  hasDebt         Boolean  @default(false)
  status          String   @default("active")
  salesStage      String?
  responsibleUser String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([phoneNumber])
}
```

### 3. Implementação do Frontend

#### 3.1. Componentes React

```typescript
// src/components/chat/ChatContainer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Message } from '../../types';

interface ChatContainerProps {
  sessionId: string;
  phoneNumber: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  sessionId, 
  phoneNumber 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const socket = useSocket();
  const { getMessages, sendMessage, markAsRead } = useWhatsApp();
  
  // Carregar mensagens iniciais
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(sessionId, phoneNumber);
        setMessages(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar mensagens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Marcar conversa como lida
    markAsRead(sessionId, phoneNumber);
  }, [sessionId, phoneNumber]);
  
  // Escutar por novas mensagens via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (message: Message) => {
      if (message.sender === phoneNumber) {
        setMessages(prev => [...prev, message]);
        
        // Marcar conversa como lida se estiver visualizando
        markAsRead(sessionId, phoneNumber);
      }
    };
    
    socket.on('whatsapp:message', handleNewMessage);
    
    return () => {
      socket.off('whatsapp:message', handleNewMessage);
    };
  }, [socket, phoneNumber, sessionId]);
  
  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(sessionId, phoneNumber, text);
      // A mensagem será adicionada via socket quando confirmada
    } catch (err) {
      setError('Erro ao enviar mensagem');
      console.error(err);
    }
  };
  
  return (
    <div className="chat-container">
      <ChatHeader phoneNumber={phoneNumber} />
      
      <div className="chat-messages">
        {loading ? (
          <div className="loading">Carregando mensagens...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
```

#### 3.2. Contexto para Gerenciamento de Estado

```typescript
// src/contexts/WhatsAppContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { Conversation, Message } from '../types';

interface WhatsAppContextData {
  initializeWhatsApp: (sessionId: string) => Promise<void>;
  getConversations: (sessionId: string, status?: string) => Promise<Conversation[]>;
  getMessages: (sessionId: string, phoneNumber: string) => Promise<Message[]>;
  sendMessage: (sessionId: string, phoneNumber: string, text: string) => Promise<void>;
  updateConversationStatus: (sessionId: string, phoneNumber: string, status: string) => Promise<void>;
  markAsRead: (sessionId: string, phoneNumber: string) => Promise<void>;
  logout: (sessionId: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextData>({} as WhatsAppContextData);

export const WhatsAppProvider: React.FC = ({ children }) => {
  const initializeWhatsApp = useCallback(async (sessionId: string) => {
    await api.post(`/whatsapp/${sessionId}/initialize`);
  }, []);
  
  const getConversations = useCallback(async (
    sessionId: string, 
    status?: string
  ): Promise<Conversation[]> => {
    const params = status ? { status } : {};
    const response = await api.get(`/whatsapp/${sessionId}/conversations`, { params });
    return response.data.data;
  }, []);
  
  const getMessages = useCallback(async (
    sessionId: string, 
    phoneNumber: string
  ): Promise<Message[]> => {
    const response = await api.get(`/whatsapp/${sessionId}/messages/${phoneNumber}`);
    return response.data.data;
  }, []);
  
  const sendMessage = useCallback(async (
    sessionId: string, 
    phoneNumber: string, 
    text: string
  ) => {
    await api.post(`/whatsapp/${sessionId}/send/${phoneNumber}`, { text });
  }, []);
  
  const updateConversationStatus = useCallback(async (
    sessionId: string, 
    phoneNumber: string, 
    status: string
  ) => {
    await api.put(`/whatsapp/${sessionId}/conversation/${phoneNumber}/status`, { status });
  }, []);
  
  const markAsRead = useCallback(async (
    sessionId: string, 
    phoneNumber: string
  ) => {
    await api.put(`/whatsapp/${sessionId}/conversation/${phoneNumber}/read`);
  }, []);
  
  const logout = useCallback(async (sessionId: string) => {
    await api.post(`/whatsapp/${sessionId}/logout`);
  }, []);
  
  return (
    <WhatsAppContext.Provider value={{
      initializeWhatsApp,
      getConversations,
      getMessages,
      sendMessage,
      updateConversationStatus,
      markAsRead,
      logout
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export function useWhatsApp(): WhatsAppContextData {
  const context = useContext(WhatsAppContext);
  
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  
  return context;
}
```

### 4. Integração com o Sistema Existente

#### 4.1. Conexão com o Banco de Dados Existente

Para integrar com o banco de dados existente do Painel de Vendas TIM, será necessário:

1. Adicionar os novos modelos ao schema.prisma existente
2. Executar migrações para atualizar o banco de dados
3. Criar relacionamentos entre as tabelas existentes e as novas tabelas

```bash
# Gerar migração
npx prisma migrate dev --name add_whatsapp_integration

# Aplicar migração
npx prisma migrate deploy
```

#### 4.2. Integração com Autenticação Existente

Utilizar o sistema de autenticação existente para controlar o acesso à interface de WhatsApp:

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
    }
    
    const [, token] = authHeader.split(' ');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    req.user = user;
    
    return next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};
```

#### 4.3. Integração com o Frontend Existente

Adicionar a nova página de atendimento ao layout existente:

```typescript
// src/pages/atendimento.tsx
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ContactList from '../components/contacts/ContactList';
import ChatContainer from '../components/chat/ChatContainer';
import InfoPanel from '../components/info/InfoPanel';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useSocket } from '../contexts/SocketContext';

const AtendimentoPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ativos');
  
  const { initializeWhatsApp } = useWhatsApp();
  const socket = useSocket();
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Inicializar WhatsApp e conectar ao socket
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const sessionId = session.user.id;
      
      // Inicializar WhatsApp
      initializeWhatsApp(sessionId).catch(console.error);
      
      // Conectar ao socket
      if (socket) {
        socket.emit('join', sessionId);
      }
    }
  }, [status, session, initializeWhatsApp, socket]);
  
  if (status === 'loading') {
    return <div>Carregando...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container">
        {/* Lista de Contatos */}
        <div className="sidebar">
          <ContactList
            sessionId={session.user.id}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSelectContact={setSelectedContact}
            selectedContact={selectedContact}
          />
        </div>
        
        {/* Área de Chat */}
        {selectedContact ? (
          <ChatContainer
            sessionId={session.user.id}
            phoneNumber={selectedContact}
          />
        ) : (
          <div className="chat-placeholder">
            Selecione um contato para iniciar o atendimento
          </div>
        )}
        
        {/* Painel de Informações */}
        {selectedContact && (
          <InfoPanel
            sessionId={session.user.id}
            phoneNumber={selectedContact}
          />
        )}
      </div>
    </Layout>
  );
};

export default AtendimentoPage;
```

### 5. Configuração de Comunicação em Tempo Real

#### 5.1. Configuração do Socket.IO

```typescript
// src/config/socket.ts
import { Server } from 'socket.io';
import http from 'http';

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} entrou na sala ${room}`);
    });
    
    socket.on('leave', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} saiu da sala ${room}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
  
  return io;
};
```

### 6. Testes e Validação

#### 6.1. Testes Unitários

```typescript
// src/services/whatsapp/__tests__/connection.test.ts
import WhatsAppService from '../connection';
import { prisma } from '../../../config/database';

// Mock do Prisma
jest.mock('../../../config/database', () => ({
  prisma: {
    whatsAppSession: {
      upsert: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn()
    },
    message: {
      create: jest.fn()
    },
    conversation: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

// Mock do Baileys
jest.mock('@whiskeysockets/baileys', () => ({
  default: jest.fn(() => ({
    ev: {
      on: jest.fn()
    },
    sendMessage: jest.fn().mockResolvedValue({
      key: { id: 'test-message-id' }
    }),
    logout: jest.fn().mockResolvedValue(true),
    end: jest.fn().mockResolvedValue(true)
  })),
  DisconnectReason: {
    loggedOut: 401
  },
  useMultiFileAuthState: jest.fn().mockResolvedValue({
    state: {
      creds: {},
      keys: {}
    },
    saveCreds: jest.fn()
  }),
  fetchLatestBaileysVersion: jest.fn().mockResolvedValue({
    version: [2, 2323, 4]
  }),
  makeCacheableSignalKeyStore: jest.fn().mockReturnValue({})
}));

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService;
  
  beforeEach(() => {
    whatsappService = new WhatsAppService('test-session');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should connect to WhatsApp', async () => {
    await whatsappService.connect();
    
    // Verificar se os métodos necessários foram chamados
    expect(require('@whiskeysockets/baileys').useMultiFileAuthState).toHaveBeenCalledWith('sessions/test-session');
    expect(require('@whiskeysockets/baileys').fetchLatestBaileysVersion).toHaveBeenCalled();
    expect(require('@whiskeysockets/baileys').default).toHaveBeenCalled();
  });
  
  it('should send a message', async () => {
    // Configurar o serviço como conectado
    await whatsappService.connect();
    (whatsappService as any).isConnected = true;
    
    // Mock para findFirst
    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({
      id: 'test-conversation-id'
    });
    
    await whatsappService.sendMessage('123456789', 'Test message');
    
    // Verificar se a mensagem foi enviada
    expect((whatsappService as any).socket.sendMessage).toHaveBeenCalledWith(
      '123456789@s.whatsapp.net',
      { text: 'Test message' }
    );
    
    // Verificar se a mensagem foi salva no banco
    expect(prisma.message.create).toHaveBeenCalled();
    
    // Verificar se a conversa foi atualizada
    expect(prisma.conversation.update).toHaveBeenCalled();
  });
  
  // Adicionar mais testes para outros métodos...
});
```

#### 6.2. Testes de Integração

```typescript
// src/tests/integration/whatsapp.test.ts
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';

// Mock do serviço WhatsApp
jest.mock('../../services/whatsapp/connection');

describe('WhatsApp API Integration', () => {
  let authToken: string;
  
  beforeAll(() => {
    // Criar token de autenticação para testes
    const user = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };
    
    authToken = jwt.sign(user, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize WhatsApp session', async () => {
    const response = await request(app)
      .post('/api/whatsapp/test-session/initialize')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  it('should get conversations', async () => {
    // Mock para getConversations
    const mockConversations = [
      {
        id: 'conv-1',
        sessionId: 'test-session',
        phoneNumber: '123456789@s.whatsapp.net',
        lastMessage: 'Hello',
        lastMessageAt: new Date(),
        unreadCount: 1,
        status: 'pending'
      }
    ];
    
    (prisma.conversation.findMany as jest.Mock).mockResolvedValue(mockConversations);
    
    const response = await request(app)
      .get('/api/whatsapp/test-session/conversations')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'conv-1',
        phoneNumber: '123456789@s.whatsapp.net'
      })
    ]));
  });
  
  // Adicionar mais testes para outros endpoints...
});
```

## Cronograma de Implementação

### Fase 1: Configuração e Estrutura Básica (1-2 semanas)
- Configuração do ambiente de desenvolvimento
- Implementação da estrutura de diretórios
- Configuração do banco de dados e migrações
- Implementação do serviço básico de WhatsApp com Baileys

### Fase 2: Backend e API (2-3 semanas)
- Implementação completa do serviço WhatsApp
- Desenvolvimento da API RESTful
- Configuração do Socket.IO para comunicação em tempo real
- Testes unitários e de integração

### Fase 3: Frontend (2-3 semanas)
- Implementação dos componentes React
- Integração com a API e Socket.IO
- Implementação da interface conforme mockup
- Testes de usabilidade

### Fase 4: Integração e Testes (1-2 semanas)
- Integração com o sistema existente
- Testes de sistema completo
- Correção de bugs e ajustes finais
- Documentação

## Considerações Finais

### Segurança
- Implementar autenticação JWT para todas as rotas da API
- Armazenar credenciais do WhatsApp de forma segura
- Implementar controle de acesso baseado em funções (RBAC)
- Validar todas as entradas de usuário

### Escalabilidade
- Utilizar arquitetura de microsserviços para o componente WhatsApp
- Implementar filas para processamento de mensagens em massa
- Configurar balanceamento de carga para múltiplas instâncias

### Manutenção
- Documentar todas as APIs e componentes
- Implementar logging detalhado para facilitar depuração
- Configurar monitoramento e alertas
- Manter atualização regular da biblioteca Baileys

## Próximos Passos

1. Validar o plano de implementação com a equipe técnica
2. Definir prioridades e cronograma detalhado
3. Iniciar implementação da Fase 1
4. Realizar revisões regulares de progresso
5. Ajustar o plano conforme necessário durante a implementação
