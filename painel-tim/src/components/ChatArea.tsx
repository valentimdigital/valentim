import { useState, useEffect } from 'react';

console.log('ChatArea carregado');

interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface ChatAreaProps {
  contactId: string | null;
  contactName: string;
}

export default function ChatArea({ contactId, contactName }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!contactId) return;
    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await fetch(`/api/whatsapp?messages=1&id=${contactId}`);
        const data = await res.json();
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(
          msgs.map((m: any) => ({
            id: m.id || '',
            text: m.text || '',
            time: m.time || '',
            isMe: !!m.isMe,
          }))
        );
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [contactId]);

  const handleSendMessage = async () => {
    if (message.trim() && contactId) {
      setSending(true);
      try {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: contactId, message })
        });
        setMessage('');
      } catch (error) {
        alert('Erro ao enviar mensagem!');
      } finally {
        setSending(false);
      }
    }
  };

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Selecione uma conversa para começar o atendimento.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=1"
            alt="Contato"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium">{contactName}</h3>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Carregando mensagens...</div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.isMe
                    ? 'bg-[#00348D] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-xs mt-1 block ${
                    msg.isMe ? 'text-gray-200' : 'text-gray-500'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400">Nenhuma mensagem encontrada.</div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00348D]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sending || !contactId}
          />
          <button
            className="px-4 py-2 bg-[#00348D] text-white rounded-lg font-bold hover:bg-[#002b6b] disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={sending || !message.trim() || !contactId}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
} 