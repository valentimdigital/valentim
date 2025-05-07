import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cnpj = searchParams.get("cnpj")

  if (!cnpj) {
    console.log("[CNPJ API] CNPJ não informado")
    return NextResponse.json({ status: "ERROR", message: "CNPJ não informado" }, { status: 400 })
  }

  try {
    console.log(`[CNPJ API] Consultando: https://receitaws.com.br/v1/cnpj/${cnpj}`)
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    console.log(`[CNPJ API] Status: ${response.status}`)
    const data = await response.json()
    console.log(`[CNPJ API] Resposta:`, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[CNPJ API] Erro ao consultar ReceitaWS", error)
    return NextResponse.json({ status: "ERROR", message: "Erro ao consultar ReceitaWS" }, { status: 500 })
  }
} 