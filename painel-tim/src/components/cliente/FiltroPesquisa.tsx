"use client"

import { useState } from "react"

interface FiltroPesquisaProps {
  onFiltrar: (filtros: FiltrosCliente) => void
}

export interface FiltrosCliente {
  busca: string
  situacaoCadastral: string
  tipoEmpresa: string
  limiteCredito: string
  dividasTim: string
  etapaVenda: string
  responsavel: string
}

export function FiltroPesquisa({ onFiltrar }: FiltroPesquisaProps) {
  const [filtros, setFiltros] = useState<FiltrosCliente>({
    busca: "",
    situacaoCadastral: "",
    tipoEmpresa: "",
    limiteCredito: "",
    dividasTim: "",
    etapaVenda: "",
    responsavel: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }))
    onFiltrar({ ...filtros, [name]: value })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            name="busca"
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.busca}
            onChange={handleChange}
          />
        </div>
        <button
          onClick={() => setFiltros({
            busca: "",
            situacaoCadastral: "",
            tipoEmpresa: "",
            limiteCredito: "",
            dividasTim: "",
            etapaVenda: "",
            responsavel: "",
          })}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Situação Cadastral
          </label>
          <select
            name="situacaoCadastral"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.situacaoCadastral}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="ATIVA">Ativa</option>
            <option value="INAPTA">Inapta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Empresa
          </label>
          <select
            name="tipoEmpresa"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.tipoEmpresa}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="MEI">MEI</option>
            <option value="EI">Empresário Individual</option>
            <option value="LTDA">Sociedade Limitada</option>
            <option value="SS">Sociedade Simples</option>
            <option value="SA">Sociedade Anônima</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limite de Crédito
          </label>
          <select
            name="limiteCredito"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.limiteCredito}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="true">Com Limite</option>
            <option value="false">Sem Limite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dívidas TIM
          </label>
          <select
            name="dividasTim"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.dividasTim}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="true">Com Dívida</option>
            <option value="false">Sem Dívida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etapa da Venda
          </label>
          <select
            name="etapaVenda"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.etapaVenda}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável
          </label>
          <select
            name="responsavel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tim-blue focus:border-transparent"
            value={filtros.responsavel}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="Valentim">Valentim</option>
            <option value="Tayna">Tayna</option>
            <option value="Wellington">Wellington</option>
            <option value="Larissa">Larissa</option>
            <option value="Livia">Livia</option>
            <option value="Ana">Ana</option>
            <option value="Lene">Lene</option>
          </select>
        </div>
      </div>
    </div>
  )
} 