import { useState, useEffect } from 'react';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface SidebarProps {
  onSelect: (conversation: Conversation) => void;
  selectedId: string | null;
}

export default function Sidebar({ onSelect, selectedId }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('wSidebar carregado');

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        const res = await fetch('/api/whatsapp?chats=1');
        const data = await res.json();
        const chats = Array.isArray(data.chats) ? data.chats : [];
        // Garante que cada conversa tenha os campos obrigatórios
        setConversations(
          chats.map((c: any) => ({
            id: c.id || '',
            name: c.name || '',
            lastMessage: c.lastMessage || '',
            time: c.time || '',
            unread: c.unread || 0,
            avatar: c.avatar || '',
          }))
        );
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(search.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Buscar conversas..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00348D]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Carregando...</div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${selectedId === conversation.id ? 'bg-blue-50' : ''}`}
              onClick={() => onSelect(conversation)}
            >
              <img
                src={conversation.avatar || 'https://i.pravatar.cc/150?img=1'}
                alt={conversation.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">{conversation.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread > 0 && (
                <span className="bg-[#00348D] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unread}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>
    </div>
  );
} 