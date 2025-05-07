import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Cliente } from '@/types/cliente';

// Função para combinar classes do Tailwind de forma eficiente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para formatar CNPJ
export function formatarCNPJ(cnpj: string | undefined) {
  if (!cnpj) return 'N/A';
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Função para formatar CEP
export function formatarCEP(cep: string) {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

// Função para formatar data
export function formatarData(data: Date | string | null | undefined) {
  if (!data) return 'N/A';
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
}

// Função para formatar valor monetário
export function formatarMoeda(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para determinar a cor do card com base no tipo de empresa e status
export function determinarCorCard(cliente: Cliente | null) {
  if (!cliente) return 'bg-gray-200'; // Cor padrão se não houver cliente
  
  // Verificar situações especiais primeiro
  if (cliente.situacaoCadastral === 'Inapta') {
    return 'bg-red-200'; // Vermelho claro para empresas inaptas
  }
  
  if (cliente.dividasTim) {
    return 'bg-red-800 text-white'; // Vermelho escuro para empresas com dívida com a TIM
  }
  
  // Verificar se a empresa tem menos de 6 meses de existência
  const dataAtual = new Date();
  const dataAbertura = cliente.dataAbertura ? new Date(cliente.dataAbertura) : null;
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(dataAtual.getMonth() - 6);
  
  const empresaNova = dataAbertura && dataAbertura > seisMesesAtras;
  
  // Determinar cor com base no tipo de empresa
  switch (cliente.tipoEmpresa) {
    case 'MEI':
      return cliente.limiteCredito ? 'bg-blue-300' : 'bg-blue-700 text-white';
      
    case 'EI':
      return cliente.limiteCredito ? 'bg-green-300' : 'bg-green-700 text-white';
      
    case 'LTDA':
    case 'SLU':
      if (empresaNova) return 'bg-yellow-300';
      return cliente.limiteCredito ? 'bg-green-300' : 'bg-green-700 text-white';
      
    case 'SS':
      return cliente.limiteCredito ? 'bg-gray-300' : 'bg-gray-700 text-white';
      
    case 'SA':
      return cliente.limiteCredito ? 'bg-purple-300' : 'bg-purple-700 text-white';
      
    default:
      return 'bg-gray-200';
  }
}

// Função para verificar permissão de acesso
export function verificarPermissao(nivelAcesso: string, acao: 'visualizar' | 'editar' | 'adicionar') {
  switch (nivelAcesso) {
    case 'total':
      return true; // Acesso total a todas as funções
      
    case 'parcial':
      return acao === 'visualizar' || acao === 'editar' || acao === 'adicionar';
      
    case 'limitado':
      return acao === 'visualizar' || acao === 'adicionar';
      
    default:
      return false;
  }
}
