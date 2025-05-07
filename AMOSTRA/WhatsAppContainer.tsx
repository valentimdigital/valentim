'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { io } from 'socket.io-client';
import WhatsAppSidebar from './WhatsAppSidebar';
import WhatsAppChat from './WhatsAppChat';
import WhatsAppInfo from './WhatsAppInfo';

// Tipos
interface Conversation {
  id: number;
  sessionId: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'pending' | 'active' | 'closed';
}

interface Message {
  id: number;
  sessionId: string;
  messageId: string;
  sender: string;
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read' | 'received';
}

interface Cliente {
  id: number;
  cnpj: string;
  nomeEmpresarial: string;
  telefone?: string;
  email?: string;
  tipoEmpresa: string;
  situacaoCadastral: string;
  limiteCredito: boolean;
  dividasTim: boolean;
}

export default function WhatsAppContainer() {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string>('default');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'closed'>('active');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializar Socket.IO
  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Socket.IO conectado');
      socket.emit('join', sessionId);
    });
    
    socket.on('whatsapp:qr', (qr) => {
      setQrCode(qr);
    });
    
    socket.on('whatsapp:connected', (user) => {
      setIsConnected(true);
      setQrCode(null);
      fetchConversations();
    });
    
    socket.on('whatsapp:disconnected', (reason) => {
      setIsConnected(false);
    });
    
    socket.on('whatsapp:message', (message) => {
      // Atualizar mensagens se for da conversa atual
      if (selectedConversation && message.sender === selectedConversation.phoneNumber) {
        setMessages(prev => [...prev, message]);
      }
      
      // Atualizar lista de conversas
      fetchConversations();
    });
    
    return () => {
      socket.disconnect();
    };
  }, [session, sessionId, selectedConversation]);

  // Inicializar WhatsApp
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const initializeWhatsApp = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post('/api/whatsapp', {
          sessionId: `user_${session.user.id}`
        });
        
        setSessionId(`user_${session.user.id}`);
        
        // Verificar status da conexão
        const statusResponse = await axios.get(`/api/whatsapp/${sessionId}`);
        setIsConnected(statusResponse.data.isConnected);
        
        // Buscar conversas
        if (statusResponse.data.isConnected) {
          fetchConversations();
        }
      } catch (error) {
        console.error('Erro ao inicializar WhatsApp:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeWhatsApp();
  }, [session]);

  // Buscar conversas
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/${sessionId}`, {
        params: { status: activeTab }
      });
      
      setConversations(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  };

  // Buscar mensagens de uma conversa
  const fetchMessages = async (conversation: Conversation) => {
    try {
      const response = await axios.get(
        `/api/whatsapp/${sessionId}/${conversation.phoneNumber}`
      );
      
      setMessages(response.data.data);
      
      // Buscar informações do cliente
      fetchClienteInfo(conversation.phoneNumber);
      
      // Marcar conversa como lida
      await axios.put(
        `/api/whatsapp/${sessionId}/${conversation.phoneNumber}`,
        { status: 'active' }
      );
      
      // Atualizar lista de conversas
      fetchConversations();
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  // Buscar informações do cliente
  const fetchClienteInfo = async (phoneNumber: string) => {
    try {
      // Extrair número sem o @s.whatsapp.net
      const cleanNumber = phoneNumber.replace('@s.whatsapp.net', '');
      
      // Buscar cliente por telefone
      const response = await axios.get('/api/clientes', {
        params: { telefone: cleanNumber }
      });
      
      if (response.data.length > 0) {
        setClienteInfo(response.data[0]);
      } else {
        setClienteInfo(null);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do cliente:', error);
      setClienteInfo(null);
    }
  };

  // Enviar mensagem
  const sendMessage = async (text: string) => {
    if (!selectedConversation) return;
    
    try {
      await axios.post(
        `/api/whatsapp/${sessionId}/${selectedConversation.phoneNumber}`,
        { text }
      );
      
      // Atualizar mensagens (otimista)
      const newMessage: Message = {
        id: Date.now(),
        sessionId,
        messageId: `local_${Date.now()}`,
        sender: selectedConversation.phoneNumber,
        content: text,
        timestamp: new Date(),
        isFromMe: true,
        status: 'sent'
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Atualizar lista de conversas
      fetchConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Atualizar status da conversa
  const updateConversationStatus = async (status: 'active' | 'pending' | 'closed') => {
    if (!selectedConversation) return;
    
    try {
      await axios.put(
        `/api/whatsapp/${sessionId}/${selectedConversation.phoneNumber}`,
        { status }
      );
      
      // Atualizar lista de conversas
      fetchConversations();
      
      // Se a conversa foi fechada, limpar seleção
      if (status === 'closed') {
        setSelectedConversation(null);
        setMessages([]);
        setClienteInfo(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
    }
  };

  // Selecionar conversa
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  };

  // Mudar aba
  const handleTabChange = (tab: 'active' | 'pending' | 'closed') => {
    setActiveTab(tab);
    setSelectedConversation(null);
    setMessages([]);
    setClienteInfo(null);
  };

  if (!session) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="whatsapp-container">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar - Lista de Conversas */}
        <WhatsAppSidebar
          conversations={conversations}
          activeTab={activeTab}
          selectedConversation={selectedConversation}
          isLoading={isLoading}
          onSelectConversation={handleSelectConversation}
          onTabChange={handleTabChange}
          onRefresh={fetchConversations}
        />
        
        {/* Área de Chat */}
        <WhatsAppChat
          conversation={selectedConversation}
          messages={messages}
          isConnected={isConnected}
          qrCode={qrCode}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
        
        {/* Painel de Informações */}
        {selectedConversation && (
          <WhatsAppInfo
            conversation={selectedConversation}
            cliente={clienteInfo}
            onUpdateStatus={updateConversationStatus}
          />
        )}
      </div>
    </div>
  );
}
