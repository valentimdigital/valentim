"use client";

import { useEffect, useState, useRef } from "react";

export default function ConfiguracaoPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function startPolling() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchStatus, 2000);
    }
    async function fetchStatus() {
      try {
        const res = await fetch('/api/whatsapp?status=1');
        const data = await res.json();
        setStatus(data.status);
      } catch (e) {
        setStatus('disconnected');
      }
    }
    fetchStatus();
    startPolling();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white rounded-lg shadow p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#00348D] mb-6">Configuração do WhatsApp</h1>
      <div className="mb-6">
        <span className={`px-4 py-2 rounded-full text-white font-bold ${
          status === 'connected' ? 'bg-green-600' : 
          status === 'disconnected' ? 'bg-red-600' : 
          'bg-yellow-600'
        }`}>
          {status === 'connected' ? 'Conectado' :
           status === 'connecting' ? 'Conectando...' :
           'Desconectado'}
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-4 text-center">
        {status === "connected" ? (
          "WhatsApp conectado com sucesso!"
        ) : (
          "A conexão agora é feita exclusivamente pelo terminal do servidor."
        )}
      </p>
    </div>
  );
} 