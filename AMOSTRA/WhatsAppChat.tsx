
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Bot, User, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';

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

interface WhatsAppChatProps {
  conversation: Conversation | null;
  messages: Message[];
  isConnected: boolean;
  qrCode: string | null;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export default function WhatsAppChat({
  conversation,
  messages,
  isConnected,
  qrCode,
  isLoading,
  onSendMessage
}: WhatsAppChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected || !conversation) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const getContactName = (phoneNumber: string) => {
    // TODO: Implementar busca de nome do contato no futuro
    return phoneNumber.replace('@s.whatsapp.net', '');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Cabeçalho do Chat */}
      {conversation && (
        <div className="p-3 border-b border-gray-200 bg-white flex items-center">
          {/* Avatar (placeholder) */}
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold">
            {getContactName(conversation.phoneNumber).substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{getContactName(conversation.phoneNumber)}</h3>
            <p className="text-xs text-gray-500">{isConnected ? 'Online' : 'Offline'}</p>
          </div>
          {/* Ações do Chat (placeholder) */}
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <Search size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isConnected && qrCode && (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-tim shadow-tim-card p-8">
            <h3 className="text-lg font-semibold mb-4 text-tim-blue">Conecte seu WhatsApp</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Para usar o atendimento via WhatsApp, escaneie o QR Code abaixo com o aplicativo WhatsApp no seu celular.
            </p>
            <QRCode value={qrCode} size={200} />
            <p className="text-xs text-gray-500 mt-6">
              Abra o WhatsApp > Configurações > Aparelhos conectados > Conectar um aparelho.
            </p>
          </div>
        )}

        {!isConnected && !qrCode && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-tim shadow-tim-card p-8 text-center">
            <AlertCircle size={40} className="text-tim-red mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-tim-red">WhatsApp Desconectado</h3>
            <p className="text-sm text-gray-600">
              Não foi possível conectar ao WhatsApp. Verifique sua conexão ou tente reiniciar a sessão.
            </p>
          </div>
        )}

        {isConnected && !conversation && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-500">Selecione uma conversa para começar.</p>
          </div>
        )}

        {isConnected && conversation && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] shadow-sm ${msg.isFromMe ? 'bg-tim-blue text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}
            >
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.isFromMe ? 'text-blue-200' : 'text-gray-500'} text-right`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      {isConnected && conversation && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <Smile size={20} />
            </button>
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-tim-blue px-4 bg-gray-50"
              disabled={!isConnected || !conversation}
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-tim-blue text-white hover:bg-tim-dark-blue disabled:opacity-50"
              disabled={!inputValue.trim() || !isConnected || !conversation}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

