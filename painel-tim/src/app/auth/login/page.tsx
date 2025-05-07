"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha inválidos")
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Ocorreu um erro ao fazer login")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] py-12 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center">
          <img src="/logo-tim.svg" alt="TIM Logo" className="h-12 mb-4" />
          <h2 className="text-3xl font-bold text-[#00348D] text-center mb-2">Painel de Vendas TIM</h2>
          <p className="text-sm text-gray-600 text-center mb-4">Acesse sua conta para gerenciar clientes empresariais</p>
        </div>
        <form className="mt-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 text-center">
              {error}
            </div>
          )}
          <div className="rounded-lg shadow-sm mb-6">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 px-4 py-3 text-sm rounded-t-lg focus:outline-none focus:ring-2 focus:ring-[#00348D] placeholder-gray-400"
              placeholder="Email"
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border-x border-b border-gray-300 px-4 py-3 text-sm rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#00348D] placeholder-gray-400"
              placeholder="Senha"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-[#00348D] text-white font-semibold py-3 rounded-lg transition-colors hover:bg-[#002266] text-base shadow-md"
          >
            Entrar
          </button>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Entre em contato com o administrador caso não tenha acesso</p>
          </div>
        </form>
      </div>
    </div>
  )
} 