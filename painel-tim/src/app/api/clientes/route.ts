import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all")
    const search = searchParams.get("search") || undefined
    const naturezaJuridica = searchParams.get("naturezaJuridica") || undefined
    const situacaoCadastral = searchParams.get("situacaoCadastral") || undefined
    const limiteCredito = searchParams.get("limiteCredito") || undefined
    const dividasTim = searchParams.get("dividasTim") || undefined

    const where: any = {}

    if (search) {
      where.OR = [
        { nomeEmpresarial: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search } },
      ]
    }
    if (naturezaJuridica) {
      where.naturezaJuridica = naturezaJuridica
    }
    if (situacaoCadastral) {
      where.situacaoCadastral = situacaoCadastral
    }
    if (limiteCredito) {
      where.limiteCredito = limiteCredito === "true"
    }
    if (dividasTim) {
      where.dividasTim = dividasTim === "true"
    }

    const take = all ? undefined : 6

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    })

    return new NextResponse(JSON.stringify(clientes))
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const cliente = await prisma.cliente.create({
      data: {
        cnpj: body.cnpj,
        nomeEmpresarial: body.nomeEmpresarial,
        dataAbertura: new Date(body.dataAbertura),
        atividades: body.atividades,
        naturezaJuridica: body.naturezaJuridica,
        endereco: body.endereco,
        telefone: body.telefone,
        email: body.email,
        capitalSocial: parseFloat(body.capitalSocial),
        simplesNacional: body.simplesNacional,
        mei: body.mei,
        situacaoCadastral: body.situacaoCadastral,
        limiteCredito: body.limiteCredito,
        dividasTim: body.dividasTim,
        etapaVenda: body.etapaVenda,
        responsavel: body.responsavel,
        contatoNome: body.contatoNome,
        contatoNumero: body.contatoNumero,
      }
    })

    return new NextResponse(JSON.stringify(cliente), { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    )
  }
} 