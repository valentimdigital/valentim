interface Cliente {
  id?: number;
  nomeEmpresarial: string;
  cnpj: string;
  tipoEmpresa: string;
  situacaoCadastral?: string;
  dataAbertura?: string;
  capitalSocial?: number;
  simplesNacional?: boolean;
  mei?: boolean;
  endereco?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  limiteCredito: boolean;
  valorLimiteCredito?: number;
  dividasTim: boolean;
  valorDividasTim?: number;
  etapaVenda: string;
  responsavelId?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
  responsavel?: {
    id: number;
    nome: string;
    email: string;
    cargo: string;
  };
}

export type { Cliente };
