'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Usuario } from '@/types/usuario';

interface FiltroPesquisaProps {
  usuarios: Usuario[];
  onFiltrar: (filtros: any) => void;
}

export default function FiltroPesquisa({ usuarios, onFiltrar }: FiltroPesquisaProps) {
  const [filtros, setFiltros] = useState({
    termo: '',
    tipoEmpresa: '',
    situacaoCadastral: '',
    limiteCredito: '',
    dividasTim: '',
    etapaVenda: '',
    responsavelId: ''
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltrar(filtros);
  };
  
  const limparFiltros = () => {
    setFiltros({
      termo: '',
      tipoEmpresa: '',
      situacaoCadastral: '',
      limiteCredito: '',
      dividasTim: '',
      etapaVenda: '',
      responsavelId: ''
    });
    onFiltrar({});
  };
  
  return (
    <div className="filter-container">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              name="termo"
              value={filtros.termo}
              onChange={handleChange}
              placeholder="Buscar por nome ou CNPJ..."
              className="filter-input"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="filter-button filter-button-secondary"
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
          
          <button
            type="submit"
            className="filter-button filter-button-primary"
          >
            Buscar
          </button>
        </div>
        
        {mostrarFiltros && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-tim-light-blue rounded-tim">
            <div>
              <label className="form-label">
                Tipo de Empresa
              </label>
              <select
                name="tipoEmpresa"
                value={filtros.tipoEmpresa}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="MEI">MEI</option>
                <option value="EI">EI</option>
                <option value="LTDA">LTDA</option>
                <option value="SLU">SLU</option>
                <option value="SS">SS</option>
                <option value="SA">SA</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Situação Cadastral
              </label>
              <select
                name="situacaoCadastral"
                value={filtros.situacaoCadastral}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="Ativa">Ativa</option>
                <option value="Inapta">Inapta</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Limite de Crédito
              </label>
              <select
                name="limiteCredito"
                value={filtros.limiteCredito}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="true">Com Limite</option>
                <option value="false">Sem Limite</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Dívidas com a TIM
              </label>
              <select
                name="dividasTim"
                value={filtros.dividasTim}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="true">Com Dívida</option>
                <option value="false">Sem Dívida</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Etapa da Venda
              </label>
              <select
                name="etapaVenda"
                value={filtros.etapaVenda}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Fechado">Fechado</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Responsável
              </label>
              <select
                name="responsavelId"
                value={filtros.responsavelId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={limparFiltros}
                className="flex items-center gap-1 px-3 py-2 text-tim-blue hover:text-tim-dark-blue"
              >
                <X size={16} />
                <span>Limpar Filtros</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
