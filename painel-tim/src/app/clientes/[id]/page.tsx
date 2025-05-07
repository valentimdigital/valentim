"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Tipagem local para incluir campos opcionais
type ClienteDetalhe = {
  id: string;
  cnpj: string;
  nomeEmpresarial: string;
  dataAbertura: string | Date;
  atividades: string;
  naturezaJuridica: string;
  endereco: string;
  telefone?: string | null;
  email?: string | null;
  capitalSocial: number;
  simplesNacional: boolean;
  mei: boolean;
  situacaoCadastral: string;
  limiteCredito: boolean;
  dividasTim: boolean;
  etapaVenda: string;
  responsavel: string;
  contatoNome?: string | null;
  contatoNumero?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function DetalhesClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<ClienteDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${params.id}`)
        if (!response.ok) {
          throw new Error("Cliente não encontrado")
        }
        const data = await response.json()
        setCliente(data)
      } catch (error) {
        setError("Erro ao carregar dados do cliente")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchCliente()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tim-blue"></div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <div className="text-center text-red-500">{error || "Cliente não encontrado"}</div>
        <div className="mt-4 text-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-tim-blue text-white rounded-md hover:bg-tim-blue/90"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 font-sans">
      {/* Cabeçalho com logo e botões */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo-tim.svg" alt="TIM Logo" className="h-8" />
          <h1 className="text-2xl font-bold text-[#00348D]">Painel de Vendas</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 border border-gray-200 transition">
            <span>Voltar</span>
          </button>
          <button onClick={() => router.push(`/clientes/${params.id}/editar`)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00348D] text-white font-medium hover:bg-[#002266] transition">
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start p-6 border-b border-blue-100 bg-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{cliente.nomeEmpresarial || "Nome não informado"}</h2>
            <p className="text-base text-gray-700 mt-1">{cliente.cnpj || "CNPJ não informado"}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <span className={`badge px-3 py-1 rounded-full text-xs font-bold ${cliente.situacaoCadastral === 'ATIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{cliente.situacaoCadastral}</span>
            <span className="badge px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{cliente.naturezaJuridica || "Tipo não informado"}</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dados Cadastrais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00348D]">Dados Cadastrais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-xs text-gray-500">Nome Empresarial</div><div className="font-medium">{cliente.nomeEmpresarial || "-"}</div></div>
                <div><div className="text-xs text-gray-500">CNPJ</div><div className="font-medium">{cliente.cnpj || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Data de Abertura</div><div className="font-medium">{cliente.dataAbertura ? new Date(cliente.dataAbertura).toLocaleDateString('pt-BR') : "-"}</div></div>
                <div><div className="text-xs text-gray-500">Situação Cadastral</div><div className="font-medium">{cliente.situacaoCadastral || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Natureza Jurídica</div><div className="font-medium">{cliente.naturezaJuridica || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Capital Social</div><div className="font-medium">{typeof cliente.capitalSocial === 'number' && !isNaN(cliente.capitalSocial) ? cliente.capitalSocial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</div></div>
              </div>
            </div>
            {/* Endereço e Contato */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00348D]">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-xs text-gray-500">Endereço</div><div className="font-medium">{cliente.endereco || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Telefone</div><div className="font-medium">{cliente.telefone || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Email</div><div className="font-medium">{cliente.email || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Nome do contato</div><div className="font-medium">{cliente.contatoNome || "-"}</div></div>
                <div><div className="text-xs text-gray-500">WhatsApp do contato</div><div className="font-medium">{cliente.contatoNumero || "-"}</div></div>
              </div>
            </div>
          </div>

          {/* Atividades */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-[#00348D]">Atividades</h3>
            <div className="text-gray-700">{cliente.atividades || "-"}</div>
          </div>

          {/* Financeiro e Venda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00348D]">Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-xs text-gray-500">Limite de Crédito</div><div className="font-medium">{cliente.limiteCredito ? "Sim" : "Não"}</div></div>
                <div><div className="text-xs text-gray-500">Dívidas TIM</div><div className="font-medium">{cliente.dividasTim ? "Sim" : "Não"}</div></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00348D]">Informações de Venda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-xs text-gray-500">Responsável</div><div className="font-medium">{cliente.responsavel || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Etapa da Venda</div><div className="font-medium">{cliente.etapaVenda || "-"}</div></div>
                <div><div className="text-xs text-gray-500">Simples Nacional</div><div className="font-medium">{cliente.simplesNacional ? "Sim" : "Não"}</div></div>
                <div><div className="text-xs text-gray-500">MEI</div><div className="font-medium">{cliente.mei ? "Sim" : "Não"}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 