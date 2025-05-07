import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Limpa o banco de dados
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()

  // Cria um usuário admin
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Administrador",
      password: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm", // 123456
      role: "ADMIN",
    },
  })

  // Cria alguns clientes de exemplo
  await prisma.cliente.createMany({
    data: [
    {
      cnpj: "12345678000190",
        nomeEmpresarial: "Empresa Exemplo 1 LTDA",
      dataAbertura: new Date("2020-01-01"),
      atividades: "Desenvolvimento de software",
        naturezaJuridica: "SOCIEDADE LIMITADA",
      endereco: "Rua Exemplo, 123",
        telefone: "(21) 99999-9999",
        email: "contato@exemplo1.com",
        capitalSocial: 100000,
      simplesNacional: true,
      mei: false,
      situacaoCadastral: "ATIVA",
      limiteCredito: true,
      dividasTim: false,
        etapaVenda: "PROSPECÇÃO",
        responsavel: "João Silva",
        contatoNome: "Maria Santos",
        contatoNumero: "(21) 98888-8888",
      },
      {
        cnpj: "98765432000110",
        nomeEmpresarial: "Empresa Exemplo 2 MEI",
        dataAbertura: new Date("2021-06-15"),
        atividades: "Comércio varejista",
        naturezaJuridica: "EMPRESÁRIO INDIVIDUAL",
        endereco: "Av. Exemplo, 456",
        telefone: "(21) 97777-7777",
        email: "contato@exemplo2.com",
        capitalSocial: 50000,
      simplesNacional: true,
      mei: true,
      situacaoCadastral: "ATIVA",
      limiteCredito: false,
      dividasTim: false,
        etapaVenda: "NEGOCIAÇÃO",
        responsavel: "Pedro Santos",
      },
    ],
  })

  console.log("Banco de dados populado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 