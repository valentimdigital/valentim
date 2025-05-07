import { useState, useEffect, useCallback } from 'react';
import { POLLING_INTERVAL, ERROR_MESSAGES, AUTO_RECONNECT, MAX_RECONNECT_ATTEMPTS } from '../config';

interface WhatsAppState {
  status: 'loading' | 'connected' | 'disconnected' | 'connecting';
  error: string | null;
  reconnectAttempts: number;
}

export function useWhatsApp() {
  const [state, setState] = useState<WhatsAppState>({
    status: 'loading',
    error: null,
    reconnectAttempts: 0,
  });

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp?status=1');
      const data = await res.json();
      
      setState(prev => ({
        ...prev,
        status: data.status,
        error: null,
      }));

      if (data.status === 'disconnected' && AUTO_RECONNECT && state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setState(prev => ({
          ...prev,
          status: 'connecting',
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
        
        // Tentar reconectar
        await fetch('/api/whatsapp?reconnect=1');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        error: ERROR_MESSAGES.CONNECTION_FAILED,
      }));
    }
  }, [state.reconnectAttempts]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const reconnect = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: 'connecting',
      error: null,
      reconnectAttempts: 0,
    }));

    try {
      await fetch('/api/whatsapp?reconnect=1');
      await checkConnection();
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        error: ERROR_MESSAGES.CONNECTION_FAILED,
      }));
    }
  }, [checkConnection]);

  return {
    ...state,
    reconnect,
  };
} 