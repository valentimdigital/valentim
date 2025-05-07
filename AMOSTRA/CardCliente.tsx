'use client';

import { useState } from 'react';
import { Cliente } from '@/types/cliente';
import { determinarCorCard, formatarCNPJ, formatarData, formatarMoeda } from '@/utils';
import { Edit, Trash, Phone, Mail, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { verificarPermissao } from '@/utils';

interface CardClienteProps {
  cliente: Cliente;
  nivelAcesso: string;
  onEditar: (cliente: Cliente) => void;
  onExcluir: (cliente: Cliente) => void;
}

export default function CardCliente({ cliente, nivelAcesso, onEditar, onExcluir }: CardClienteProps) {
  const [expandido, setExpandido] = useState(false);
  
  // Determinar a classe CSS para o card com base no tipo de empresa e status
  const getCardClass = () => {
    if (cliente.situacaoCadastral === 'Inapta') {
      return 'card-inapta';
    }
    
    if (cliente.dividasTim) {
      return 'card-divida-tim';
    }
    
    // Verificar se a empresa tem menos de 6 meses de existência
    const dataAtual = new Date();
    const dataAbertura = cliente.dataAbertura ? new Date(cliente.dataAbertura) : null;
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(dataAtual.getMonth() - 6);
    
    const empresaNova = dataAbertura && dataAbertura > seisMesesAtras;
    
    // Determinar classe com base no tipo de empresa
    switch (cliente.tipoEmpresa) {
      case 'MEI':
        return cliente.limiteCredito ? 'card-mei-com-limite' : 'card-mei-sem-limite';
        
      case 'EI':
        return cliente.limiteCredito ? 'card-ei-com-limite' : 'card-ei-sem-limite';
        
      case 'LTDA':
        if (empresaNova) return 'card-ltda-nova';
        if (cliente.dividasTim) return 'card-ltda-divida';
        return cliente.limiteCredito ? 'card-ltda-com-limite' : 'card-ltda-sem-limite';
        
      case 'SLU':
        if (empresaNova) return 'card-slu-nova';
        if (cliente.dividasTim) return 'card-slu-divida';
        return cliente.limiteCredito ? 'card-slu-com-limite' : 'card-slu-sem-limite';
        
      case 'SS':
        return cliente.limiteCredito ? 'card-ss-com-limite' : 'card-ss-sem-limite';
        
      case 'SA':
        return cliente.limiteCredito ? 'card-sa-com-limite' : 'card-sa-sem-limite';
        
      default:
        return 'card';
    }
  };
  
  const cardClass = getCardClass();
  const podeEditar = verificarPermissao(nivelAcesso, 'editar');
  
  return (
    <div className={`card ${cardClass}`}>
      <div 
        className="card-header cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg truncate">{cliente.nomeEmpresarial}</h3>
            <p className="text-sm">{formatarCNPJ(cliente.cnpj)}</p>
          </div>
          
          {cliente.situacaoCadastral === 'Inapta' && (
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Inapta
            </div>
          )}
        </div>
        
        <div className="mt-2 text-sm">
          <p><strong>Tipo:</strong> {cliente.tipoEmpresa}</p>
          <p><strong>Responsável:</strong> {cliente.responsavel?.nome || 'Não atribuído'}</p>
          <p><strong>Etapa:</strong> {cliente.etapaVenda}</p>
        </div>
      </div>
      
      {expandido && (
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 opacity-70" />
              <span>
                <strong>Data de Abertura:</strong> {cliente.dataAbertura ? formatarData(cliente.dataAbertura) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center">
              <DollarSign size={16} className="mr-2 opacity-70" />
              <span>
                <strong>Capital Social:</strong> {cliente.capitalSocial ? formatarMoeda(cliente.capitalSocial) : 'N/A'}
              </span>
            </div>
            
            {cliente.telefone && (
              <div className="flex items-center">
                <Phone size={16} className="mr-2 opacity-70" />
                <span>{cliente.telefone}</span>
              </div>
            )}
            
            {cliente.email && (
              <div className="flex items-center">
                <Mail size={16} className="mr-2 opacity-70" />
                <span>{cliente.email}</span>
              </div>
            )}
            
            <div>
              <strong>Limite de Crédito:</strong> {cliente.limiteCredito ? 'Sim' : 'Não'}
              {cliente.limiteCredito && cliente.valorLimiteCredito && (
                <span> ({formatarMoeda(cliente.valorLimiteCredito)})</span>
              )}
            </div>
            
            <div>
              <strong>Dívidas TIM:</strong> {cliente.dividasTim ? 'Sim' : 'Não'}
              {cliente.dividasTim && cliente.valorDividasTim && (
                <span> ({formatarMoeda(cliente.valorDividasTim)})</span>
              )}
            </div>
          </div>
          
          {cliente.endereco && (
            <div className="mt-3 text-sm">
              <strong>Endereço:</strong> {cliente.endereco}
            </div>
          )}
          
          {podeEditar && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(cliente);
                }}
                className="p-2 bg-tim-light-blue text-tim-blue rounded-full hover:bg-blue-200"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir(cliente);
                }}
                className="p-2 bg-tim-light-red text-tim-red rounded-full hover:bg-red-200"
              >
                <Trash size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
