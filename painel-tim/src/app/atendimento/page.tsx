"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import InfoPanel from "@/components/InfoPanel";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWhatsApp } from "./hooks/useWhatsApp";
import { STATUS_MESSAGES } from "./config";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

function AtendimentoPage() {
  const { status, error, reconnect } = useWhatsApp();
  const [selected, setSelected] = useState<Conversation | null>(null);

  // Resetar seleção quando desconectar
  useEffect(() => {
    if (status === 'disconnected') {
      setSelected(null);
    }
  }, [status]);

  if (status === 'loading' || status === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-gray-500">
          {status === 'loading' ? STATUS_MESSAGES.LOADING : STATUS_MESSAGES.CONNECTING}
        </span>
      </div>
    );
  }

  if (status !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="text-xl text-red-600 font-bold">WhatsApp não conectado!</span>
        {error && <span className="text-red-500">{error}</span>}
        <div className="flex gap-4">
          <button
            onClick={reconnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Reconectar
          </button>
          <Link 
            href="/configuracao" 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Ir para Configurações
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-80 border-r">
          <Sidebar onSelect={setSelected} selectedId={selected?.id || null} />
        </div>
        {/* Chat Area */}
        <div className="flex-1 border-r">
          <ChatArea contactId={selected?.id || null} contactName={selected?.name || ''} />
        </div>
        {/* Info Panel */}
        <div className="w-80">
          <InfoPanel />
        </div>
      </div>
    </div>
  );
}

export default function AtendimentoPageWrapper() {
  return (
    <ErrorBoundary>
      <AtendimentoPage />
    </ErrorBoundary>
  );
} 