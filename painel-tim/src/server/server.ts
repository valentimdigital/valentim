import { startWhatsApp } from './whatsapp';
import { checkHealth } from './health-check';
import { createServer } from 'http';
import next from 'next';
import { serverConfig } from '../config/server';
import { logger } from '../lib/logger';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    logger.info('Iniciando servidor...');

    // Inicia o servidor Next.js
    await app.prepare();
    logger.info('Next.js preparado com sucesso');

    // Cria o servidor HTTP
    const server = createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        logger.error('Erro ao processar requisição:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Inicia o servidor HTTP
    server.listen(Number(serverConfig.port), serverConfig.host, () => {
      logger.info(`🚀 Servidor Next.js rodando em http://${serverConfig.host}:${serverConfig.port}`);
    });

    // Inicia o servidor WhatsApp
    await startWhatsApp();
    logger.info('📱 WhatsApp conectado e pronto para uso');

    // Inicia o health check
    await checkHealth();
    logger.info('🏥 Health check iniciado');

  } catch (error) {
    logger.error('Erro ao iniciar o servidor:', error);
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

// Inicia o servidor
startServer(); 