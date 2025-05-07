import { NextResponse } from 'next/server';
import { startSock, getStatus, getQrCode, getChats, getMessages } from '@/lib/whatsapp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const chats = searchParams.get('chats');
  const messages = searchParams.get('messages');
  const id = searchParams.get('id');
  const reconnect = searchParams.get('reconnect');

  try {
    if (reconnect) {
      await startSock();
      return NextResponse.json({ success: true });
    }

    if (status) {
      const isConnected = getStatus();
      return NextResponse.json({ 
        status: isConnected ? 'connected' : 'disconnected',
        qr: !isConnected ? getQrCode() : null
      });
    }

    if (chats) {
      const chatsList = getChats();
      return NextResponse.json({ chats: chatsList || [] });
    }

    if (messages && id) {
      const messagesList = await getMessages(id);
      return NextResponse.json({ messages: messagesList || [] });
    }

    return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API do WhatsApp:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const sock = await startSock();
    if (!sock) {
      return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 503 });
    }

    await sock.sendMessage(to, { text: message });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ 
      error: 'Erro ao enviar mensagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 