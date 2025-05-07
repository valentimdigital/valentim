import { startWhatsApp } from './server/whatsapp';
import { logger } from './lib/logger';

async function start() {
  try {
    logger.info('Iniciando aplicação...');
    
    // Inicia o servidor WhatsApp
    await startWhatsApp();
    
    logger.info('Aplicação iniciada com sucesso!');
  } catch (error) {
    logger.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promessa rejeitada não tratada:', error);
});

// Inicia a aplicação
start(); 