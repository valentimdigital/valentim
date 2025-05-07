"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState({
    cnpj: "",
    nomeEmpresarial: "",
    dataAbertura: "",
    atividades: "",
    naturezaJuridica: "",
    endereco: "",
    telefone: "",
    email: "",
    capitalSocial: "",
    simplesNacional: false,
    mei: false,
    situacaoCadastral: "ATIVA",
    limiteCredito: false,
    dividasTim: false,
    etapaVenda: "EM_ANDAMENTO",
    responsavel: "",
  })
  const cnpjInputRef = useRef<HTMLInputElement>(null)
  const [dadosReceita, setDadosReceita] = useState<any>(null)
  const [contatoNome, setContatoNome] = useState("");
  const [contatoNumero, setContatoNumero] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCnpjSearch = async () => {
    if (!form.cnpj) return
    setSearching(true)
    setError(null)
    try {
      const cnpjLimpo = form.cnpj.replace(/\D/g, '')
      const response = await fetch(`/api/consulta-cnpj?cnpj=${cnpjLimpo}`)
      const data = await response.json()
      setDadosReceita(data)
      if (data.status === 'ERROR') {
        setError(data.message || 'CNPJ não encontrado')
      } else {
        setForm(prev => ({
          ...prev,
          nomeEmpresarial: data.nome || "",
          dataAbertura: data.abertura ? data.abertura.split('/').reverse().join('-') : "",
          naturezaJuridica: data.natureza_juridica || "",
          atividades: data.atividade_principal ? data.atividade_principal.map((a: any) => a.text).join('; ') : "",
          endereco: `${data.logradouro || ''}, ${data.numero || ''} ${data.complemento || ''}, ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}, CEP: ${data.cep || ''}`.replace(/, +/g, ', ').replace(/^, |, $/g, ''),
          situacaoCadastral: data.situacao === 'ATIVA' ? 'ATIVA' : 'INAPTA',
          capitalSocial: data.capital_social ? String(data.capital_social).replace(/\./g, '').replace(',', '.') : ""
        }))
      }
    } catch (err) {
      setError("Erro ao consultar CNPJ")
      setDadosReceita(null)
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, contatoNome, contatoNumero }),
      })
      if (!response.ok) throw new Error("Erro ao criar cliente")
      router.push("/clientes")
    } catch (error) {
      setError("Ocorreu um erro ao criar o cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Cliente</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="cnpj" className="block text-base font-bold text-tim-blue">CNPJ</label>
            <input
              ref={cnpjInputRef}
              type="text"
              name="cnpj"
              id="cnpj"
              required
              value={form.cnpj}
              onChange={handleChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && form.cnpj.replace(/\D/g, '').length === 14) {
                  e.preventDefault();
                  handleCnpjSearch();
                }
              }}
              className="mt-1 block w-full rounded-md border-2 border-tim-blue/60 shadow-sm focus:border-tim-blue focus:ring-tim-blue text-lg font-mono bg-blue-50"
              placeholder="Digite o CNPJ"
              maxLength={18}
            />
          </div>
          <button
            type="button"
            onClick={handleCnpjSearch}
            disabled={searching || form.cnpj.replace(/\D/g, '').length !== 14}
            className="px-6 py-2 bg-[#00348D] text-white rounded-md font-bold text-base shadow hover:bg-[#002266] transition disabled:opacity-50"
          >
            {searching ? "Buscando..." : "Pesquisar"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nomeEmpresarial" className="block text-sm font-medium text-gray-700">
              Nome Empresarial
            </label>
            <input
              type="text"
              name="nomeEmpresarial"
              id="nomeEmpresarial"
              required
              value={form.nomeEmpresarial}
              onChange={handleChange}
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
              required
              value={form.dataAbertura}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="naturezaJuridica" className="block text-sm font-medium text-gray-700">
              Natureza Jurídica
            </label>
            <input
              type="text"
              name="naturezaJuridica"
              id="naturezaJuridica"
              required
              value={form.naturezaJuridica}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
              placeholder="Ex: SOCIEDADE LIMITADA"
            />
          </div>

          <div>
            <label htmlFor="atividades" className="block text-sm font-medium text-gray-700">
              Atividades
            </label>
            <textarea
              name="atividades"
              id="atividades"
              rows={3}
              value={form.atividades}
              onChange={handleChange}
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
              required
              value={form.endereco}
              onChange={handleChange}
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
              value={form.telefone}
              onChange={handleChange}
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
              value={form.email}
              onChange={handleChange}
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
              required
              step="0.01"
              min="0"
              value={form.capitalSocial}
              onChange={handleChange}
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
              required
              value={form.situacaoCadastral}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="ATIVA">Ativa</option>
              <option value="INAPTA">Inapta</option>
            </select>
          </div>
        </div>

        {/* Campos extras para contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do cliente que entrou em contato</label>
            <input
              type="text"
              value={contatoNome}
              onChange={e => setContatoNome(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
              placeholder="Nome do contato"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número/WhatsApp do contato</label>
            <input
              type="text"
              value={contatoNumero}
              onChange={e => setContatoNumero(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
              placeholder="(99) 99999-9999"
            />
          </div>
        </div>

        {/* Etapa da Venda, Responsável e opções finais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="etapaVenda" className="block text-sm font-medium text-gray-700">Etapa da Venda</label>
            <select
              name="etapaVenda"
              id="etapaVenda"
              required
              value={form.etapaVenda}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tim-blue focus:ring-tim-blue sm:text-sm"
            >
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FECHADO">Fechado</option>
            </select>
          </div>
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">Responsável</label>
            <select
              name="responsavel"
              id="responsavel"
              required
              value={form.responsavel}
              onChange={handleChange}
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
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="simplesNacional"
                id="simplesNacional"
                checked={form.simplesNacional}
                onChange={handleChange}
                className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
              />
              <span className="block text-sm text-gray-900">Simples Nacional</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="mei"
                id="mei"
                checked={form.mei}
                onChange={handleChange}
                className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
              />
              <span className="block text-sm text-gray-900">MEI</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="limiteCredito"
                id="limiteCredito"
                checked={form.limiteCredito}
                onChange={handleChange}
                className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
              />
              <span className="block text-sm text-gray-900">Possui Limite de Crédito</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="dividasTim"
                id="dividasTim"
                checked={form.dividasTim}
                onChange={handleChange}
                className="h-4 w-4 text-tim-blue focus:ring-tim-blue border-gray-300 rounded"
              />
              <span className="block text-sm text-gray-900">Possui Dívidas com a TIM</span>
            </label>
          </div>
        </div>

        {/* CAMPOS EXTRAS DA RECEITAWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <input type="text" name="status" value={dadosReceita?.status || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
            <input type="text" name="ultima_atualizacao" value={dadosReceita?.ultima_atualizacao || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <input type="text" name="tipo" value={dadosReceita?.tipo || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Porte</label>
            <input type="text" name="porte" value={dadosReceita?.porte || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
            <input type="text" name="fantasia" value={dadosReceita?.fantasia || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ente Federativo Responsável (EFR)</label>
            <input type="text" name="efr" value={dadosReceita?.efr || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data da Situação</label>
            <input type="text" name="data_situacao" value={dadosReceita?.data_situacao || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo da Situação</label>
            <input type="text" name="motivo_situacao" value={dadosReceita?.motivo_situacao || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Situação Especial</label>
            <input type="text" name="situacao_especial" value={dadosReceita?.situacao_especial || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data da Situação Especial</label>
            <input type="text" name="data_situacao_especial" value={dadosReceita?.data_situacao_especial || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Atividade Principal</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.atividade_principal && Array.isArray(dadosReceita.atividade_principal)
                ? dadosReceita.atividade_principal.map((a: any, i: number) => (
                    <div key={i}>{a.code} - {a.text}</div>
                  ))
                : '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Atividades Secundárias</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.atividades_secundarias && Array.isArray(dadosReceita.atividades_secundarias) && dadosReceita.atividades_secundarias.length > 0
                ? dadosReceita.atividades_secundarias.map((a: any, i: number) => (
                    <div key={i}>{a.code} - {a.text}</div>
                  ))
                : '-'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quadro Societário (QSA)</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.qsa && Array.isArray(dadosReceita.qsa) && dadosReceita.qsa.length > 0
                ? dadosReceita.qsa.map((s: any, i: number) => (
                    <div key={i}>{s.nome} - {s.qual}{s.pais_origem ? ` - ${s.pais_origem}` : ''}{s.nome_rep_legal ? ` - Rep: ${s.nome_rep_legal}` : ''}{s.qual_rep_legal ? ` - ${s.qual_rep_legal}` : ''}</div>
                  ))
                : '-'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Simples Nacional</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.simples
                ? <>
                    <div>Optante: {dadosReceita.simples.optante ? 'Sim' : 'Não'}</div>
                    {dadosReceita.simples.data_opcao && <div>Data Opção: {dadosReceita.simples.data_opcao}</div>}
                    {dadosReceita.simples.data_exclusao && <div>Data Exclusão: {dadosReceita.simples.data_exclusao}</div>}
                  </>
                : '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">MEI</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.simei
                ? <>
                    <div>Optante: {dadosReceita.simei.optante ? 'Sim' : 'Não'}</div>
                    {dadosReceita.simei.data_opcao && <div>Data Opção: {dadosReceita.simei.data_opcao}</div>}
                    {dadosReceita.simei.data_exclusao && <div>Data Exclusão: {dadosReceita.simei.data_exclusao}</div>}
                  </>
                : '-'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing (Limite de Consulta)</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 min-h-[40px]">
              {dadosReceita?.billing
                ? <>
                    <div>Consulta Gratuita: {dadosReceita.billing.free ? 'Sim' : 'Não'}</div>
                    <div>Dados do Cache: {dadosReceita.billing.database ? 'Sim' : 'Não'}</div>
                  </>
                : '-'}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-end">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#00348D] text-white rounded-md font-bold hover:bg-[#002266] transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Criar Cliente"}
          </button>
        </div>
      </form>
    </div>
  )
} 