import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401 }
      )
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: params.id
      }
    })

    if (!cliente) {
      return new NextResponse(
        JSON.stringify({ error: "Cliente não encontrado" }),
        { status: 404 }
      )
    }

    return new NextResponse(JSON.stringify(cliente))
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401 }
      )
    }

    const body = await request.json()

    const cliente = await prisma.cliente.update({
      where: {
        id: params.id
      },
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
      }
    })

    return new NextResponse(JSON.stringify(cliente))
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401 }
      )
    }

    await prisma.cliente.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    )
  }
} 