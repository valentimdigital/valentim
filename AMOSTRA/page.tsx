'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        senha,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center">
          <Image 
            src="/tim-logo.png" 
            alt="TIM Logo" 
            width={120} 
            height={40} 
            className="login-logo"
          />
          <h2 className="login-title">
            Painel de Vendas TIM
          </h2>
          <p className="login-subtitle">
            Acesse sua conta para gerenciar clientes empresariais
          </p>
        </div>
        
        {error && (
          <div className="login-error">
            <div>{error}</div>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input-first"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input-last"
                placeholder="Senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Entre em contato com o administrador caso não tenha acesso</p>
          </div>
        </form>
      </div>
    </div>
  );
}
