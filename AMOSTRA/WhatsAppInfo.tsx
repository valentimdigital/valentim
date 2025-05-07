
'use client';

import { User, Building, Phone, Mail, Briefcase, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatarCNPJ, formatarMoeda } from '@/utils';

// Tipos
interface Conversation {
  id: number;
  sessionId: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'pending' | 'active' | 'closed';
}

interface Cliente {
  id: number;
  cnpj: string;
  nomeEmpresarial: string;
  telefone?: string;
  email?: string;
  tipoEmpresa: string;
  situacaoCadastral: string;
  limiteCredito: boolean;
  valorLimiteCredito?: number;
  dividasTim: boolean;
  valorDividasTim?: number;
  etapaVenda?: string;
  responsavel?: {
    nome: string;
  };
}

interface WhatsAppInfoProps {
  conversation: Conversation;
  cliente: Cliente | null;
  onUpdateStatus: (status: 'active' | 'pending' | 'closed') => void;
}

export default function WhatsAppInfo({
  conversation,
  cliente,
  onUpdateStatus
}: WhatsAppInfoProps) {

  const getContactName = (phoneNumber: string) => {
    // TODO: Implementar busca de nome do contato no futuro
    return phoneNumber.replace('@s.whatsapp.net', '');
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Cabeçalho do Painel de Informações */}
      <div className="p-3 border-b border-gray-200 bg-tim-blue text-white">
        <h2 className="text-lg font-semibold">Informações do Cliente</h2>
      </div>

      {/* Conteúdo do Painel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {cliente ? (
          <>
            {/* Informações Básicas */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Building size={16} className="mr-2 text-gray-500" />
                <span className="font-semibold text-sm truncate">{cliente.nomeEmpresarial}</span>
              </div>
              <div className="flex items-center">
                <Briefcase size={16} className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">{formatarCNPJ(cliente.cnpj)}</span>
              </div>
              {cliente.telefone && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">{cliente.telefone}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">{cliente.email}</span>
                </div>
              )}
            </div>

            {/* Status e Detalhes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Status</h4>
              <div className="flex items-center">
                {cliente.situacaoCadastral === 'Ativa' ? (
                  <CheckCircle size={16} className="mr-2 text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="mr-2 text-red-600" />
                )}
                <span className={`text-sm ${cliente.situacaoCadastral === 'Ativa' ? 'text-green-700' : 'text-red-700'}`}>
                  Situação: {cliente.situacaoCadastral}
                </span>
              </div>
              <div className="flex items-center">
                {cliente.limiteCredito ? (
                  <CheckCircle size={16} className="mr-2 text-green-600" />
                ) : (
                  <XCircle size={16} className="mr-2 text-gray-500" />
                )}
                <span className="text-sm text-gray-700">
                  Limite de Crédito: {cliente.limiteCredito ? 'Sim' : 'Não'}
                  {cliente.limiteCredito && cliente.valorLimiteCredito && ` (${formatarMoeda(cliente.valorLimiteCredito)})`}
                </span>
              </div>
              <div className="flex items-center">
                {cliente.dividasTim ? (
                  <AlertTriangle size={16} className="mr-2 text-red-600" />
                ) : (
                  <CheckCircle size={16} className="mr-2 text-green-600" />
                )}
                <span className={`text-sm ${cliente.dividasTim ? 'text-red-700' : 'text-green-700'}`}>
                  Dívidas TIM: {cliente.dividasTim ? 'Sim' : 'Não'}
                  {cliente.dividasTim && cliente.valorDividasTim && ` (${formatarMoeda(cliente.valorDividasTim)})`}
                </span>
              </div>
            </div>

            {/* Informações de Venda */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Venda</h4>
              {cliente.etapaVenda && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">Etapa: {cliente.etapaVenda}</span>
                </div>
              )}
              {cliente.responsavel && (
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">Responsável: {cliente.responsavel.nome}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <User size={32} className="mx-auto mb-2" />
            <p className="text-sm">Nenhuma informação de cliente encontrada para este número.</p>
            <p className="text-xs mt-1">Verifique se o número está cadastrado no sistema.</p>
          </div>
        )}
      </div>

      {/* Ações do Painel */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ações da Conversa</h4>
        {conversation.status !== 'active' && (
          <button
            onClick={() => onUpdateStatus('active')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-tim bg-green-100 text-green-800 hover:bg-green-200"
          >
            <CheckCircle size={16} />
            Marcar como Ativa
          </button>
        )}
        {conversation.status !== 'pending' && (
          <button
            onClick={() => onUpdateStatus('pending')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-tim bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            <Clock size={16} />
            Marcar como Pendente
          </button>
        )}
        {conversation.status !== 'closed' && (
          <button
            onClick={() => onUpdateStatus('closed')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-tim bg-red-100 text-red-800 hover:bg-red-200"
          >
            <XCircle size={16} />
            Fechar Conversa
          </button>
        )}
      </div>
    </div>
  );
}

