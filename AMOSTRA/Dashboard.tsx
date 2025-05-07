'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw } from 'lucide-react';
import { Cliente } from '@/types/cliente';
import { Usuario } from '@/types/usuario';
import CardCliente from '@/components/CardCliente';
import FiltroPesquisa from '@/components/FiltroPesquisa';
import BotConversacao from '@/components/BotConversacao';
import { verificarPermissao } from '@/utils';

export default function Dashboard() {
  const { data: session } = useSession();
  const [filtros, setFiltros] = useState({});
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [mostrarBot, setMostrarBot] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  
  // Buscar todos os clientes
  const { data: clientes = [], isLoading, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await axios.get('/api/clientes');
      return response.data;
    }
  });
  
  // Buscar todos os usuários para o filtro de responsáveis
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await axios.get('/api/usuarios');
      return response.data;
    }
  });
  
  // Atualizar clientes filtrados quando os filtros ou dados mudarem
  useEffect(() => {
    if (!clientes.length) return;
    
    let resultado = [...clientes];
    
    // Aplicar filtros
    if (filtros) {
      const { termo, tipoEmpresa, situacaoCadastral, limiteCredito, dividasTim, etapaVenda, responsavelId } = filtros as any;
      
      if (termo) {
        const termoBusca = termo.toLowerCase();
        resultado = resultado.filter(cliente => 
          cliente.nomeEmpresarial.toLowerCase().includes(termoBusca) || 
          cliente.cnpj.includes(termoBusca)
        );
      }
      
      if (tipoEmpresa) {
        resultado = resultado.filter(cliente => cliente.tipoEmpresa === tipoEmpresa);
      }
      
      if (situacaoCadastral) {
        resultado = resultado.filter(cliente => cliente.situacaoCadastral === situacaoCadastral);
      }
      
      if (limiteCredito) {
        const temLimite = limiteCredito === 'true';
        resultado = resultado.filter(cliente => cliente.limiteCredito === temLimite);
      }
      
      if (dividasTim) {
        const temDivida = dividasTim === 'true';
        resultado = resultado.filter(cliente => cliente.dividasTim === temDivida);
      }
      
      if (etapaVenda) {
        resultado = resultado.filter(cliente => cliente.etapaVenda === etapaVenda);
      }
      
      if (responsavelId) {
        resultado = resultado.filter(cliente => cliente.responsavelId === Number(responsavelId));
      }
    }
    
    setClientesFiltrados(resultado);
  }, [clientes, filtros]);
  
  const handleFiltrar = (novosFiltros: any) => {
    setFiltros(novosFiltros);
  };
  
  const handleEditarCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    // Aqui você abriria um modal de edição
  };
  
  const handleExcluirCliente = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${cliente.nomeEmpresarial}?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/clientes/${cliente.id}`);
      refetch(); // Recarregar a lista após exclusão
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    }
  };
  
  if (!session) {
    return <div>Carregando...</div>;
  }
  
  const nivelAcesso = session.user.nivelAcesso as string;
  const podeAdicionar = verificarPermissao(nivelAcesso, 'adicionar');
  
  return (
    <div className="dashboard-container">
      <header className="header p-4 mb-6 rounded-tim">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/tim-logo.png" alt="TIM Logo" className="h-8 mr-3" />
            <h1 className="text-xl font-bold">Painel de Vendas</h1>
          </div>
          <div className="text-sm">
            <span className="opacity-80">Olá, {session.user.name}</span>
          </div>
        </div>
      </header>
      
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Gerenciamento de Clientes</h2>
          <p className="dashboard-subtitle">
            Você tem acesso {nivelAcesso} ao sistema
          </p>
        </div>
        
        <div className="dashboard-actions">
          <button
            onClick={() => refetch()}
            className="filter-button filter-button-secondary"
          >
            <RefreshCw size={16} />
            <span>Atualizar</span>
          </button>
          
          {podeAdicionar && (
            <button
              onClick={() => {/* Abrir modal de adição */}}
              className="btn-primary"
            >
              <Plus size={16} className="mr-1" />
              <span>Novo Cliente</span>
            </button>
          )}
          
          <button
            onClick={() => setMostrarBot(!mostrarBot)}
            className={mostrarBot ? 'btn-secondary' : 'btn-primary'}
          >
            {mostrarBot ? 'Fechar Bot' : 'Abrir Bot'}
          </button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className={`lg:col-span-${mostrarBot ? '3' : '4'}`}>
          <FiltroPesquisa 
            usuarios={usuarios as Usuario[]} 
            onFiltrar={handleFiltrar} 
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tim-blue"></div>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="bg-white rounded-tim shadow-tim-card p-8 text-center">
              <p className="text-gray-500">Nenhum cliente encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="dashboard-cards">
              {clientesFiltrados.map(cliente => (
                <CardCliente
                  key={cliente.id}
                  cliente={cliente}
                  nivelAcesso={nivelAcesso}
                  onEditar={handleEditarCliente}
                  onExcluir={handleExcluirCliente}
                />
              ))}
            </div>
          )}
        </div>
        
        {mostrarBot && (
          <div className="lg:col-span-1">
            <BotConversacao />
          </div>
        )}
      </div>
      
      <footer className="mt-12 p-4 text-center text-sm text-gray-500 border-t">
        <p>© {new Date().getFullYear()} TIM Brasil - Painel de Vendas</p>
      </footer>
      
      {/* Aqui você adicionaria modais para edição e adição de clientes */}
    </div>
  );
}
