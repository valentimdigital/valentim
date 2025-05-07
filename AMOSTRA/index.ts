import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/../auth';
import WhatsAppService from '@/services/whatsapp/connection';

// Mapa de instâncias de serviço WhatsApp
const whatsappInstances: Map<string, WhatsAppService> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Verificar permissões
  if (session.user.nivelAcesso !== 'total') {
    return res.status(403).json({ error: 'Permissão insuficiente' });
  }

  // Extrair parâmetros da URL
  const { sessionId } = req.query;
  
  if (!sessionId || Array.isArray(sessionId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID de sessão inválido' 
    });
  }

  // Obter instância do WhatsApp
  const whatsapp = whatsappInstances.get(sessionId);
  if (!whatsapp) {
    return res.status(404).json({ 
      success: false, 
      error: 'Sessão não encontrada' 
    });
  }

  // Roteamento baseado no método HTTP
  switch (req.method) {
    case 'GET':
      return getConversations(req, res, whatsapp);
    case 'DELETE':
      return logout(req, res, whatsapp, sessionId);
    default:
      return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Obter todas as conversas de uma sessão
async function getConversations(
  req: NextApiRequest, 
  res: NextApiResponse, 
  whatsapp: WhatsAppService
) {
  try {
    const { status, limit, offset } = req.query;
    
    const conversations = await whatsapp.getConversations(
      status as string,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );
    
    return res.status(200).json({ 
      success: true, 
      data: conversations 
    });
  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao buscar conversas'
    });
  }
}

// Encerrar sessão do WhatsApp
async function logout(
  req: NextApiRequest, 
  res: NextApiResponse, 
  whatsapp: WhatsAppService,
  sessionId: string
) {
  try {
    await whatsapp.logout();
    whatsappInstances.delete(sessionId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Sessão encerrada com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao encerrar sessão:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao encerrar sessão'
    });
  }
}
