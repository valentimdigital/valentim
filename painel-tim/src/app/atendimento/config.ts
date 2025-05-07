export const POLLING_INTERVAL = 5000; // Intervalo de atualização das conversas (5 segundos)
export const MESSAGES_LIMIT = 50; // Número máximo de mensagens a carregar por conversa
export const AUTO_RECONNECT = true; // Tentar reconectar automaticamente
export const MAX_RECONNECT_ATTEMPTS = 3; // Número máximo de tentativas de reconexão

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Não foi possível conectar ao WhatsApp',
  FETCH_CHATS_FAILED: 'Erro ao carregar conversas',
  FETCH_MESSAGES_FAILED: 'Erro ao carregar mensagens',
  SEND_MESSAGE_FAILED: 'Erro ao enviar mensagem',
};

export const STATUS_MESSAGES = {
  CONNECTING: 'Conectando ao WhatsApp...',
  CONNECTED: 'WhatsApp conectado',
  DISCONNECTED: 'WhatsApp desconectado',
  LOADING: 'Carregando...',
}; 