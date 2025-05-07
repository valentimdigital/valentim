"use client"

import { useEffect, useState } from "react"
import { Cliente } from "@prisma/client"
import { CardCliente } from "@/components/cliente/CardCliente"
import { FiltroPesquisa, FiltrosCliente } from "@/components/cliente/FiltroPesquisa"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Função para converter Cliente em ClienteCard
const convertToClienteCard = (cliente: Cliente) => ({
  ...cliente,
  createdAt: cliente.createdAt ? cliente.createdAt.toString() : "",
  updatedAt: cliente.updatedAt ? cliente.updatedAt.toString() : "",
  dataAbertura: cliente.dataAbertura ? cliente.dataAbertura.toString() : "",
  nomeEmpresarial: cliente.nomeEmpresarial || "",
  cnpj: cliente.cnpj || "",
  naturezaJuridica: cliente.naturezaJuridica || "",
  atividades: cliente.atividades || "",
  endereco: cliente.endereco || "",
  capitalSocial: cliente.capitalSocial || 0,
  simplesNacional: !!cliente.simplesNacional,
  mei: !!cliente.mei,
  situacaoCadastral: cliente.situacaoCadastral || "",
  limiteCredito: !!cliente.limiteCredito,
  dividasTim: !!cliente.dividasTim,
  etapaVenda: cliente.etapaVenda || "",
  responsavel: cliente.responsavel || "",
  telefone: cliente.telefone || null,
  email: cliente.email || null,
  contatoNome: cliente.contatoNome || null,
  contatoNumero: cliente.contatoNumero || null,
})

function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Removido: verificação de sessão
  }, [])

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("/api/clientes")
        const data = await response.json()
        if (Array.isArray(data)) {
          setClientes(data)
          setFilteredClientes(data)
        } else {
          setClientes([])
          setFilteredClientes([])
          setError("Erro ao carregar clientes: resposta inesperada do servidor.")
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
        setClientes([])
        setFilteredClientes([])
        setError("Erro ao carregar clientes. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const handleFiltrar = (filtros: FiltrosCliente) => {
    let filtered = clientes

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      filtered = filtered.filter(
        cliente =>
          cliente.nomeEmpresarial.toLowerCase().includes(busca) ||
          cliente.cnpj.includes(busca)
      )
    }

    if (filtros.situacaoCadastral) {
      filtered = filtered.filter(
        cliente => cliente.situacaoCadastral === filtros.situacaoCadastral
      )
    }

    if (filtros.tipoEmpresa) {
      filtered = filtered.filter(cliente => {
        switch (filtros.tipoEmpresa) {
          case "MEI":
            return cliente.mei
          case "EI":
            return cliente.naturezaJuridica.includes("EMPRESÁRIO INDIVIDUAL")
          case "LTDA":
            return cliente.naturezaJuridica.includes("SOCIEDADE LIMITADA")
          case "SS":
            return cliente.naturezaJuridica.includes("SOCIEDADE SIMPLES")
          case "SA":
            return cliente.naturezaJuridica.includes("SOCIEDADE ANÔNIMA")
          default:
            return true
        }
      })
    }

    if (filtros.limiteCredito) {
      filtered = filtered.filter(
        cliente => cliente.limiteCredito === (filtros.limiteCredito === "true")
      )
    }

    if (filtros.dividasTim) {
      filtered = filtered.filter(
        cliente => cliente.dividasTim === (filtros.dividasTim === "true")
      )
    }

    if (filtros.etapaVenda) {
      filtered = filtered.filter(
        cliente => cliente.etapaVenda === filtros.etapaVenda
      )
    }

    if (filtros.responsavel) {
      filtered = filtered.filter(
        cliente => cliente.responsavel === filtros.responsavel
      )
    }

    setFilteredClientes(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tim-blue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar clientes</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-tim-blue text-white rounded-md hover:bg-tim-blue/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => router.push("/clientes/novo")}
          className="px-4 py-2 bg-tim-blue text-white rounded-md hover:bg-tim-blue/90 transition-colors"
        >
          Novo Cliente
        </button>
      </div>

      <FiltroPesquisa onFiltrar={handleFiltrar} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => (
            cliente && cliente.id && cliente.nomeEmpresarial ? (
              <CardCliente key={cliente.id} cliente={convertToClienteCard(cliente)} />
            ) : null
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhum cliente encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClientesPageWrapper() {
  return (
    <ErrorBoundary>
      <ClientesPage />
    </ErrorBoundary>
  );
} 