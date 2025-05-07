"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, RefreshCw, Filter, Search } from "lucide-react"
import { CardCliente } from "@/components/cliente/CardCliente"

interface Cliente {
  id: string
  cnpj: string
  nomeEmpresarial: string
  dataAbertura: string
  atividades: string
  naturezaJuridica: string
  endereco: string
  telefone?: string
  email?: string
  capitalSocial: number
  simplesNacional: boolean
  mei: boolean
  situacaoCadastral: string
  limiteCredito: boolean
  dividasTim: boolean
  etapaVenda: string
  responsavel: string
  createdAt: string
  updatedAt: string
  contatoNome?: string
  contatoNumero?: string
}

// Função para converter datas para string
const convertToClienteCard = (cliente: Cliente) => ({
  ...cliente,
  dataAbertura: cliente.dataAbertura,
  createdAt: cliente.createdAt,
  updatedAt: cliente.updatedAt,
  telefone: cliente.telefone ?? null,
  email: cliente.email ?? null,
  contatoNome: cliente.contatoNome ?? null,
  contatoNumero: cliente.contatoNumero ?? null,
})

export default function DashboardPage() {
  const router = useRouter()

  // Estados para busca e filtros
  const [search, setSearch] = useState("")
  const [naturezaJuridica, setNaturezaJuridica] = useState("")
  const [situacaoCadastral, setSituacaoCadastral] = useState("")
  const [limiteCredito, setLimiteCredito] = useState("")
  const [dividasTim, setDividasTim] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchClientes()
    // eslint-disable-next-line
  }, [])

  const fetchClientes = async () => {
    setLoading(true)
    setErrorMsg("")
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (naturezaJuridica) params.append("naturezaJuridica", naturezaJuridica)
    if (situacaoCadastral) params.append("situacaoCadastral", situacaoCadastral)
    if (limiteCredito) params.append("limiteCredito", limiteCredito)
    if (dividasTim) params.append("dividasTim", dividasTim)
    const res = await fetch(`/api/clientes?${params.toString()}`, { credentials: 'include' })
    const data = await res.json()
    if (Array.isArray(data)) {
      setClientes(data)
    } else {
      setClientes([])
      setErrorMsg(data?.error || "Erro ao buscar clientes.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-2 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#00348D] text-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Painel de Vendas TIM</h1>
            {/* <p className="text-sm text-blue-100 mt-1">Bem-vindo, {session?.user?.name}</p> */}
          </div>
        </div>

        {/* Bloco de título, subtítulo e botões de ação */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#00348D]">Gerenciamento de Clientes</h2>
            <p className="text-gray-500 text-sm mt-1">Você tem acesso total ao sistema</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 border border-gray-200 transition" onClick={fetchClientes}>
              <RefreshCw size={18} /> Atualizar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00348D] text-white font-medium hover:bg-[#002266] transition" onClick={() => router.push("/clientes/novo") }>
              <Plus size={18} /> Novo Cliente
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00348D] text-white font-medium hover:bg-[#002266] transition">
              Abrir Bot
            </button>
          </div>
        </div>

        {/* Barra de busca e filtros rápidos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={e => { e.preventDefault(); fetchClientes(); }}>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nome ou CNPJ..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00348D] text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 border border-gray-200 transition" onClick={fetchClientes}>
                <Filter size={18} /> Filtros
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#00348D] text-white font-medium hover:bg-[#002266] transition">
                Buscar
              </button>
            </div>

            {/* Filtros avançados (estáticos) */}
            <div className="bg-[#E6F0FF] rounded-lg p-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Empresa</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm" value={naturezaJuridica} onChange={e => setNaturezaJuridica(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="MEI">MEI</option>
                    <option value="EMPRESÁRIO INDIVIDUAL">EMPRESÁRIO INDIVIDUAL</option>
                    <option value="SOCIEDADE LIMITADA">SOCIEDADE LIMITADA</option>
                    <option value="SOCIEDADE ANÔNIMA">SOCIEDADE ANÔNIMA</option>
                    <option value="SOCIEDADE SIMPLES">SOCIEDADE SIMPLES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Situação Cadastral</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm" value={situacaoCadastral} onChange={e => setSituacaoCadastral(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="ATIVA">Ativa</option>
                    <option value="INAPTA">Inapta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Crédito</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm" value={limiteCredito} onChange={e => setLimiteCredito(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="true">Com Limite</option>
                    <option value="false">Sem Limite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dívidas com a TIM</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm" value={dividasTim} onChange={e => setDividasTim(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="true">Com Dívida</option>
                    <option value="false">Sem Dívida</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Lista de Clientes Recentes (cards logo após filtro) */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Clientes Recentes</h2>
          {errorMsg && (
            <div className="text-center text-red-500 mb-4">{errorMsg}</div>
          )}
          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : clientes.length === 0 && !errorMsg ? (
            <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
          ) : clientes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientes.map(cliente => (
                <CardCliente key={cliente.id} cliente={convertToClienteCard(cliente)} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#00348D]">
            <h3 className="text-lg font-medium text-gray-900">Total de Clientes</h3>
            <p className="mt-2 text-3xl font-bold text-[#00348D]">{clientes.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-lg font-medium text-gray-900">Clientes Ativos</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{clientes.filter(c => c.situacaoCadastral === "ATIVA").length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-lg font-medium text-gray-900">Vendas do Mês</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">R$ 0,00</p>
          </div>
        </div>
      </div>
    </div>
  )
} 