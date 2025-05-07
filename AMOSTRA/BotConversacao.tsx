'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import axios from 'axios';
import { formatarCNPJ, formatarCEP } from '@/utils';
import { useSession } from 'next-auth/react';

interface Mensagem {
  id: number;
  texto: string;
  remetente: 'bot' | 'usuario';
  timestamp: Date;
}

export default function BotConversacao() {
  const { data: session } = useSession();
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      texto: 'Olá! Sou o assistente virtual da TIM. Posso ajudar com consultas de CNPJ ou CEP. O que você precisa hoje?',
      remetente: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mensagensRef = useRef<HTMLDivElement>(null);

  // Rolar para a última mensagem quando novas mensagens são adicionadas
  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || !session?.user?.id) return;
    
    const novaMensagem: Mensagem = {
      id: mensagens.length + 1,
      texto: inputValue,
      remetente: 'usuario',
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaMensagem]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Verificar se a entrada parece um CNPJ ou CEP
      const inputLimpo = inputValue.replace(/[^\d]/g, '');
      let tipo = '';
      let valor = '';
      
      if (inputLimpo.length === 14) {
        tipo = 'CNPJ';
        valor = inputLimpo;
      } else if (inputLimpo.length === 8) {
        tipo = 'CEP';
        valor = inputLimpo;
      } else {
        // Tentar extrair CNPJ ou CEP da mensagem
        const cnpjMatch = inputValue.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14}/);
        const cepMatch = inputValue.match(/\d{5}-\d{3}|\d{8}/);
        
        if (cnpjMatch) {
          tipo = 'CNPJ';
          valor = cnpjMatch[0].replace(/[^\d]/g, '');
        } else if (cepMatch) {
          tipo = 'CEP';
          valor = cepMatch[0].replace(/[^\d]/g, '');
        }
      }
      
      if (tipo && valor) {
        // Consultar API
        const response = await axios.post('/api/consulta', {
          tipo,
          valor,
          usuarioId: Number(session.user.id)
        });
        
        let respostaMensagem = '';
        
        if (tipo === 'CNPJ') {
          const { dadosAPI, cliente } = response.data;
          respostaMensagem = `
            Encontrei informações para o CNPJ ${formatarCNPJ(valor)}:
            
            Nome: ${dadosAPI.nome || dadosAPI.razao_social}
            Situação: ${dadosAPI.situacao || 'Não informada'}
            Tipo: ${cliente.tipoEmpresa}
            Data de Abertura: ${dadosAPI.abertura || 'Não informada'}
            Endereço: ${dadosAPI.logradouro ? `${dadosAPI.logradouro}, ${dadosAPI.numero}, ${dadosAPI.bairro}, ${dadosAPI.municipio}-${dadosAPI.uf}` : 'Não informado'}
            
            Os dados foram salvos no sistema.
          `;
        } else {
          const { dadosCEP } = response.data;
          respostaMensagem = `
            Encontrei informações para o CEP ${formatarCEP(valor)}:
            
            Logradouro: ${dadosCEP.logradouro}
            Bairro: ${dadosCEP.bairro}
            Cidade: ${dadosCEP.localidade}
            Estado: ${dadosCEP.uf}
          `;
        }
        
        setMensagens(prev => [...prev, {
          id: prev.length + 1,
          texto: respostaMensagem,
          remetente: 'bot',
          timestamp: new Date()
        }]);
      } else {
        // Resposta genérica se não for identificado CNPJ ou CEP
        setMensagens(prev => [...prev, {
          id: prev.length + 1,
          texto: 'Desculpe, não consegui identificar um CNPJ ou CEP válido na sua mensagem. Por favor, informe um CNPJ (14 dígitos) ou CEP (8 dígitos) para que eu possa consultar.',
          remetente: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error('Erro na consulta:', error);
      setMensagens(prev => [...prev, {
        id: prev.length + 1,
        texto: `Desculpe, ocorreu um erro na consulta: ${error.response?.data?.error || error.message || 'Erro desconhecido'}`,
        remetente: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container h-full">
      <div className="chat-header">
        <Bot className="mr-2" size={20} />
        <h3 className="font-medium">Assistente TIM</h3>
      </div>
      
      <div 
        ref={mensagensRef}
        className="chat-messages"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {mensagens.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.remetente === 'bot' ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={msg.remetente === 'bot' ? 'chat-message-bot' : 'chat-message-user'}
            >
              <div className="flex items-center mb-1">
                {msg.remetente === 'bot' ? (
                  <Bot size={16} className="mr-1" />
                ) : (
                  <User size={16} className="mr-1" />
                )}
                <span className="text-xs opacity-75">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="whitespace-pre-line text-sm">{msg.texto}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-message-bot">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleEnviarMensagem} className="chat-input">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite um CNPJ ou CEP para consultar..."
            className="form-input flex-1 rounded-r-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn-primary rounded-l-none"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
