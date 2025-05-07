import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/../auth";
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
  const { sessionId, phoneNumber } = req.query;
  
  if (!sessionId || Array.isArray(sessionId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID de sessão inválido' 
    });
  }
  
  if (!phoneNumber || Array.isArray(phoneNumber)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Número de telefone inválido' 
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
      return getMessages(req, res, whatsapp, phoneNumber);
    case 'POST':
      return sendMessage(req, res, whatsapp, phoneNumber);
    case 'PUT':
      return updateConversationStatus(req, res, whatsapp, phoneNumber);
    default:
      return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Obter mensagens de uma conversa
async function getMessages(
  req: NextApiRequest, 
  res: NextApiResponse, 
  whatsapp: WhatsAppService, 
  phoneNumber: string
) {
  try {
    const { limit, offset } = req.query;
    
    const messages = await whatsapp.getMessages(
      phoneNumber,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );
    
    return res.status(200).json({ 
      success: true, 
      data: messages 
    });
  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao buscar mensagens'
    });
  }
}

// Enviar mensagem para um contato
async function sendMessage(
  req: NextApiRequest, 
  res: NextApiResponse, 
  whatsapp: WhatsAppService, 
  phoneNumber: string
) {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Texto da mensagem é obrigatório' 
      });
    }
    
    const sentMsg = await whatsapp.sendMessage(phoneNumber, text);
    
    return res.status(200).json({ 
      success: true, 
      data: sentMsg 
    });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao enviar mensagem'
    });
  }
}

// Atualizar status de uma conversa
async function updateConversationStatus(
  req: NextApiRequest, 
  res: NextApiResponse, 
  whatsapp: WhatsAppService, 
  phoneNumber: string
) {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status é obrigatório' 
      });
    }
    
    await whatsapp.updateConversationStatus(phoneNumber, status);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Status atualizado com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status da conversa:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao atualizar status da conversa'
    });
  }
}
