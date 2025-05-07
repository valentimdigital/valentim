"use client"

import { useEffect, useState } from "react"
import { Cliente } from "@prisma/client"
import { useRouter } from "next/navigation"

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      cnpj: formData.get("cnpj") as string,
      nomeEmpresarial: formData.get("nomeEmpresarial") as string,
      dataAbertura: formData.get("dataAbertura") as string,
      atividades: formData.get("atividades") as string,
      naturezaJuridica: formData.get("naturezaJuridica") as string,
      endereco: formData.get("endereco") as string,
      telefone: formData.get("telefone") as string,
      email: formData.get("email") as string,
      capitalSocial: formData.get("capitalSocial") as string,
      simplesNacional: formData.get("simplesNacional") === "true",
      mei: formData.get("mei") === "true",
      situacaoCadastral: formData.get("situacaoCadastral") as string,
      limiteCredito: formData.get("limiteCredito") === "true",
      dividasTim: formData.get("dividasTim") === "true",
      etapaVenda: formData.get("etapaVenda") as string,
      responsavel: formData.get("responsavel") as string,
    }

    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar cliente")
      }

      router.push(`/clientes/${params.id}`)
    } catch (error) {
      setError("Ocorreu um erro ao atualizar o cliente")
    } finally {
      setSaving(false)
    }
  }

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <input
              type="text"
              name="cnpj"
              id="cnpj"
              defaultValue={cliente.cnpj}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="nomeEmpresarial" className="block text-sm font-medium text-gray-700">
              Nome Empresarial
            </label>
            <input
              type="text"
              name="nomeEmpresarial"
              id="nomeEmpresarial"
              defaultValue={cliente.nomeEmpresarial}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dataAbertura" className="block text-sm font-medium text-gray-700">
              Data de Abertura
            </label>
            <input
              type="date"
              name="dataAbertura"
              id="dataAbertura"
              defaultValue={new Date(cliente.dataAbertura).toISOString().split('T')[0]}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="naturezaJuridica" className="block text-sm font-medium text-gray-700">
              Natureza Jurídica
            </label>
            <select
              name="naturezaJuridica"
              id="naturezaJuridica"
              defaultValue={cliente.naturezaJuridica}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="">Selecione...</option>
              <option value="MEI">MEI</option>
              <option value="EMPRESÁRIO INDIVIDUAL">Empresário Individual</option>
              <option value="SOCIEDADE LIMITADA">Sociedade Limitada</option>
              <option value="SOCIEDADE SIMPLES">Sociedade Simples</option>
              <option value="SOCIEDADE ANÔNIMA">Sociedade Anônima</option>
            </select>
          </div>

          <div className="col-span-2">
            <label htmlFor="atividades" className="block text-sm font-medium text-gray-700">
              Atividades
            </label>
            <textarea
              name="atividades"
              id="atividades"
              defaultValue={cliente.atividades}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            ></textarea>
          </div>

          <div className="col-span-2">
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              id="endereco"
              defaultValue={cliente.endereco}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              id="telefone"
              defaultValue={cliente.telefone || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={cliente.email || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="capitalSocial" className="block text-sm font-medium text-gray-700">
              Capital Social
            </label>
            <input
              type="number"
              name="capitalSocial"
              id="capitalSocial"
              defaultValue={cliente.capitalSocial}
              required
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="situacaoCadastral" className="block text-sm font-medium text-gray-700">
              Situação Cadastral
            </label>
            <select
              name="situacaoCadastral"
              id="situacaoCadastral"
              defaultValue={cliente.situacaoCadastral}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="ATIVA">Ativa</option>
              <option value="INAPTA">Inapta</option>
            </select>
          </div>

          <div>
            <label htmlFor="etapaVenda" className="block text-sm font-medium text-gray-700">
              Etapa da Venda
            </label>
            <select
              name="etapaVenda"
              id="etapaVenda"
              defaultValue={cliente.etapaVenda}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FECHADO">Fechado</option>
            </select>
          </div>

          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
              Responsável
            </label>
            <select
              name="responsavel"
              id="responsavel"
              defaultValue={cliente.responsavel}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="">Selecione...</option>
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

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="simplesNacional"
              id="simplesNacional"
              defaultChecked={cliente.simplesNacional}
              value="true"
              className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
            />
            <label htmlFor="simplesNacional" className="ml-2 block text-sm text-gray-900">
              Simples Nacional
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="mei"
              id="mei"
              defaultChecked={cliente.mei}
              value="true"
              className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
            />
            <label htmlFor="mei" className="ml-2 block text-sm text-gray-900">
              MEI
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="limiteCredito"
              id="limiteCredito"
              defaultChecked={cliente.limiteCredito}
              value="true"
              className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
            />
            <label htmlFor="limiteCredito" className="ml-2 block text-sm text-gray-900">
              Possui Limite de Crédito
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="dividasTim"
              id="dividasTim"
              defaultChecked={cliente.dividasTim}
              value="true"
              className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
            />
            <label htmlFor="dividasTim" className="ml-2 block text-sm text-gray-900">
              Possui Dívidas com a TIM
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-tim-blue text-white rounded-md hover:bg-tim-blue/90 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
} 