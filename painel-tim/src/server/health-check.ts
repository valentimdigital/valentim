import { PrismaClient } from '@prisma/client';
import http from 'http';
import { serverConfig } from '../config/server';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Banco de dados conectado com sucesso!');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao conectar ao banco de dados:', error);
    return false;
  }
}

async function checkWhatsApp() {
  return new Promise((resolve) => {
    const options = {
      hostname: serverConfig.host,
      port: serverConfig.port,
      path: '/api/whatsapp/status',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        logger.info('✅ Servidor WhatsApp respondendo!');
        resolve(true);
      } else {
        logger.error('❌ Servidor WhatsApp não está respondendo corretamente');
        resolve(false);
      }
    });

    req.on('error', () => {
      logger.error('❌ Servidor WhatsApp não está acessível');
      resolve(false);
    });

    req.end();
  });
}

async function checkNextServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: serverConfig.host,
      port: serverConfig.port,
      path: '/',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        logger.info('✅ Servidor Next.js respondendo!');
        resolve(true);
      } else {
        logger.error('❌ Servidor Next.js não está respondendo corretamente');
        resolve(false);
      }
    });

    req.on('error', () => {
      logger.error('❌ Servidor Next.js não está acessível');
      resolve(false);
    });

    req.end();
  });
}

async function checkAll() {
  logger.info('Verificando saúde dos serviços...');
  
  const dbStatus = await checkDatabase();
  const whatsappStatus = await checkWhatsApp();
  const nextStatus = await checkNextServer();

  if (dbStatus && whatsappStatus && nextStatus) {
    logger.info('✅ Todos os serviços estão funcionando corretamente!');
    process.exit(0);
  } else {
    logger.error('❌ Alguns serviços não estão funcionando corretamente');
    process.exit(1);
  }
}

export { checkAll as checkHealth }; 