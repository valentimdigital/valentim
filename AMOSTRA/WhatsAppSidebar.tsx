
'use client';

import { Search, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface WhatsAppSidebarProps {
  conversations: Conversation[];
  activeTab: 'active' | 'pending' | 'closed';
  selectedConversation: Conversation | null;
  isLoading: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onTabChange: (tab: 'active' | 'pending' | 'closed') => void;
  onRefresh: () => void;
}

export default function WhatsAppSidebar({
  conversations,
  activeTab,
  selectedConversation,
  isLoading,
  onSelectConversation,
  onTabChange,
  onRefresh
}: WhatsAppSidebarProps) {

  const getContactName = (phoneNumber: string) => {
    // TODO: Implementar busca de nome do contato no futuro
    return phoneNumber.replace('@s.whatsapp.net', '');
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Cabeçalho da Sidebar */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-tim-blue">Conversas</h2>
        <button
          onClick={onRefresh}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          title="Atualizar conversas"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="p-3 border-b border-gray-200 relative">
        <Search className="absolute left-6 top-5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou número..."
          className="w-full pl-10 pr-4 py-2 border rounded-tim focus:outline-none focus:ring-1 focus:ring-tim-blue bg-gray-50"
        />
      </div>

      {/* Abas de Filtro */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onTabChange('active')}
          className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === 'active' ? 'text-tim-blue border-b-2 border-tim-blue' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Ativos
        </button>
        <button
          onClick={() => onTabChange('pending')}
          className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === 'pending' ? 'text-tim-blue border-b-2 border-tim-blue' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Pendentes
        </button>
        <button
          onClick={() => onTabChange('closed')}
          className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === 'closed' ? 'text-tim-blue border-b-2 border-tim-blue' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Fechados
        </button>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Carregando conversas...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhuma conversa encontrada.</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-3 border-b border-gray-100 cursor-pointer flex items-start hover:bg-gray-50 ${selectedConversation?.id === conv.id ? 'bg-tim-light-blue' : ''}`}
            >
              {/* Avatar (placeholder) */}
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold">
                {getContactName(conv.phoneNumber).substring(0, 1).toUpperCase()}
              </div>

              {/* Informações da Conversa */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm truncate">{getContactName(conv.phoneNumber)}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-tim-red text-white text-xs font-bold rounded-full px-1.5 py-0.5 flex-shrink-0 ml-2">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

