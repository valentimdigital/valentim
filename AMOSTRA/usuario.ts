interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  nivelAcesso: string;
  dataCriacao?: string;
  ultimoAcesso?: string;
}

export type { Usuario };
