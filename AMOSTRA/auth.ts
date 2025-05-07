import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        try {
          // Buscar usuário pelo email
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email }
          });

          // Se o usuário não existir, retornar null
          if (!usuario) {
            return null;
          }

          // Verificar se a senha está correta usando bcrypt
          const senhaCorreta = await bcrypt.compare(credentials.senha, usuario.senha);

          if (!senhaCorreta) {
            return null;
          }

          // Atualizar último acesso
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoAcesso: new Date() }
          });

          // Retornar usuário autenticado
          return {
            id: usuario.id.toString(),
            name: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,
            nivelAcesso: usuario.nivelAcesso
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.cargo = user.cargo;
        token.nivelAcesso = user.nivelAcesso;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.cargo = token.cargo;
        session.user.nivelAcesso = token.nivelAcesso;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};
