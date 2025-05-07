import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PrismaClient } from '@/generated/prisma';
import { Cliente } from '@/types/cliente';

const prisma = new PrismaClient();

// Interfaces para tipagem das respostas das APIs
interface ReceitaFederalResponse {
  cnpj: string;
  nome?: string;
  razao_social?: string;
  abertura?: string;
  atividade_principal?: Array<{code: string, text: string}>;
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  capital_social?: string;
  simples?: string;
  mei?: string;
  situacao?: string;
  status?: string;
  message?: string;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Função para consultar a API da Receita Federal
async function consultarCNPJ(cnpj: string): Promise<ReceitaFederalResponse> {
  try {
    // Remover caracteres não numéricos do CNPJ
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    // Verificar se o CNPJ tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ inválido');
    }
    
    // Consultar a API da Receita Federal
    const response = await axios.get<ReceitaFederalResponse>(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
    
    // Verificar se a resposta foi bem-sucedida
    if (response.data.status === 'ERROR') {
      throw new Error(response.data.message || 'Erro ao consultar CNPJ');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erro na consulta de CNPJ:', error.message);
    throw error;
  }
}

// Função para consultar CEP via API externa
async function consultarCEP(cep: string): Promise<ViaCepResponse> {
  try {
    // Remover caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/[^\d]/g, '');
    
    // Verificar se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      throw new Error('CEP inválido');
    }
    
    // Consultar a API de CEP
    const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    // Verificar se a resposta foi bem-sucedida
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erro na consulta de CEP:', error.message);
    throw error;
  }
}

// Função para salvar ou atualizar cliente no banco de dados
async function salvarCliente(dadosAPI: ReceitaFederalResponse, usuarioId: number) {
  try {
    // Verificar se o cliente já existe no banco de dados
    const clienteExistente = await prisma.cliente.findUnique({
      where: { cnpj: dadosAPI.cnpj }
    });
    
    // Determinar o tipo de empresa com base na natureza jurídica
    let tipoEmpresa = 'LTDA'; // Valor padrão
    
    if (dadosAPI.natureza_juridica) {
      const naturezaJuridica = dadosAPI.natureza_juridica.toLowerCase();
      
      if (naturezaJuridica.includes('mei') || dadosAPI.mei === 'Sim') {
        tipoEmpresa = 'MEI';
      } else if (naturezaJuridica.includes('empresário individual')) {
        tipoEmpresa = 'EI';
      } else if (naturezaJuridica.includes('limitada') && naturezaJuridica.includes('unipessoal')) {
        tipoEmpresa = 'SLU';
      } else if (naturezaJuridica.includes('limitada')) {
        tipoEmpresa = 'LTDA';
      } else if (naturezaJuridica.includes('sociedade simples')) {
        tipoEmpresa = 'SS';
      } else if (naturezaJuridica.includes('sociedade anônima') || naturezaJuridica.includes('s/a') || naturezaJuridica.includes('s.a.')) {
        tipoEmpresa = 'SA';
      }
    }
    
    // Preparar dados para inserção ou atualização
    const dadosCliente = {
      cnpj: dadosAPI.cnpj,
      nomeEmpresarial: dadosAPI.nome || dadosAPI.razao_social || 'Empresa sem nome',
      dataAbertura: dadosAPI.abertura ? new Date(dadosAPI.abertura.split('/').reverse().join('-')) : null,
      atividadesEconomicas: dadosAPI.atividade_principal ? JSON.stringify(dadosAPI.atividade_principal) : null,
      naturezaJuridica: dadosAPI.natureza_juridica || null,
      tipoEmpresa,
      endereco: dadosAPI.logradouro ? `${dadosAPI.logradouro}, ${dadosAPI.numero}, ${dadosAPI.complemento || ''}, ${dadosAPI.bairro}, ${dadosAPI.municipio}, ${dadosAPI.uf}` : null,
      cep: dadosAPI.cep ? dadosAPI.cep.replace(/[^\d]/g, '') : null,
      telefone: dadosAPI.telefone || null,
      email: dadosAPI.email || null,
      capitalSocial: dadosAPI.capital_social ? parseFloat(dadosAPI.capital_social.replace(/[^\d,]/g, '').replace(',', '.')) : null,
      simplesNacional: dadosAPI.simples === 'Sim',
      mei: dadosAPI.mei === 'Sim' || tipoEmpresa === 'MEI',
      situacaoCadastral: dadosAPI.situacao || null,
      limiteCredito: clienteExistente?.limiteCredito || false,
      valorLimiteCredito: clienteExistente?.valorLimiteCredito || 0,
      dividasTim: clienteExistente?.dividasTim || false,
      valorDividasTim: clienteExistente?.valorDividasTim || 0,
      etapaVenda: clienteExistente?.etapaVenda || 'Em Andamento',
      responsavelId: usuarioId
    };
    
    let cliente;
    
    if (clienteExistente) {
      // Atualizar cliente existente
      cliente = await prisma.cliente.update({
        where: { cnpj: dadosAPI.cnpj },
        data: dadosCliente
      });
      
      // Registrar consulta no histórico
      await prisma.historicoConsulta.create({
        data: {
          clienteId: cliente.id,
          usuarioId,
          tipoConsulta: 'CNPJ',
          valorConsultado: dadosAPI.cnpj
        }
      });
    } else {
      // Criar novo cliente
      cliente = await prisma.cliente.create({
        data: dadosCliente
      });
      
      // Registrar consulta no histórico
      await prisma.historicoConsulta.create({
        data: {
          clienteId: cliente.id,
          usuarioId,
          tipoConsulta: 'CNPJ',
          valorConsultado: dadosAPI.cnpj
        }
      });
    }
    
    return cliente;
  } catch (error: any) {
    console.error('Erro ao salvar cliente:', error.message);
    throw error;
  }
}

// Endpoint para consultar CNPJ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { valor, tipo, usuarioId } = body;
    
    if (!valor) {
      return NextResponse.json({ error: 'Valor não informado' }, { status: 400 });
    }
    
    if (!tipo || (tipo !== 'CNPJ' && tipo !== 'CEP')) {
      return NextResponse.json({ error: 'Tipo de consulta inválido' }, { status: 400 });
    }
    
    if (!usuarioId) {
      return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 });
    }
    
    let resultado;
    
    if (tipo === 'CNPJ') {
      // Consultar CNPJ
      const dadosAPI = await consultarCNPJ(valor);
      
      // Salvar ou atualizar cliente no banco de dados
      const cliente = await salvarCliente(dadosAPI, usuarioId);
      
      resultado = {
        dadosAPI,
        cliente
      };
    } else {
      // Consultar CEP
      const dadosCEP = await consultarCEP(valor);
      resultado = { dadosCEP };
    }
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro no endpoint:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Endpoint para obter dados de um cliente pelo CNPJ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cnpj = searchParams.get('cnpj');
    
    if (!cnpj) {
      return NextResponse.json({ error: 'CNPJ não informado' }, { status: 400 });
    }
    
    // Remover caracteres não numéricos do CNPJ
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    // Buscar cliente no banco de dados
    const cliente = await prisma.cliente.findUnique({
      where: { cnpj: cnpjLimpo }
    });
    
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(cliente);
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
