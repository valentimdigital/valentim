import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se já existem usuários no banco de dados
    const usuariosExistentes = await prisma.usuario.count();
    
    if (usuariosExistentes > 0) {
      console.log('Usuários já existem no banco de dados. Pulando seed.');
      return;
    }
    
    // Criar usuários iniciais
    const usuarios = [
      {
        nome: 'Valentim',
        email: 'valentim@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Dono',
        nivelAcesso: 'total'
      },
      {
        nome: 'Tayna',
        email: 'tayna@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Supervisor',
        nivelAcesso: 'total'
      },
      {
        nome: 'Wellington',
        email: 'wellington@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Gerente',
        nivelAcesso: 'total'
      },
      {
        nome: 'Larissa',
        email: 'larissa@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Vendedor',
        nivelAcesso: 'parcial'
      },
      {
        nome: 'Livia',
        email: 'livia@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Vendedor',
        nivelAcesso: 'parcial'
      },
      {
        nome: 'Ana',
        email: 'ana@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Vendedor',
        nivelAcesso: 'parcial'
      },
      {
        nome: 'Lene',
        email: 'lene@timnegocia.com.br',
        senha: 'senha123',
        cargo: 'Assistente',
        nivelAcesso: 'limitado'
      }
    ];
    
    for (const usuario of usuarios) {
      // Gerar hash da senha
      const senhaHash = await bcrypt.hash(usuario.senha, 10);
      
      await prisma.usuario.create({
        data: {
          ...usuario,
          senha: senhaHash
        }
      });
    }
    
    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
