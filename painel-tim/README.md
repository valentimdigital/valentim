# Painel TIM

Painel de vendas da TIM com integração WhatsApp.

## Requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/painel-tim.git
cd painel-tim
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

## Desenvolvimento

Para iniciar o ambiente de desenvolvimento:

```bash
npm run start:dev
```

Isso irá:
1. Iniciar o servidor WhatsApp
2. Iniciar o servidor Next.js
3. Verificar a saúde dos serviços

## Verificação de Saúde

Para verificar se todos os serviços estão funcionando:

```bash
npm run health
```

## Estrutura do Projeto

```
painel-tim/
├── src/
│   ├── app/          # Páginas e rotas
│   ├── components/   # Componentes React
│   ├── config/       # Configurações
│   ├── contexts/     # Contextos React
│   ├── lib/          # Utilitários
│   └── server/       # Servidores
├── prisma/           # Configuração do banco
└── public/           # Arquivos estáticos
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor Next.js
- `npm run build`: Compila o projeto
- `npm run start`: Inicia o servidor em produção
- `npm run lint`: Executa o linter
- `npm run health`: Verifica a saúde dos serviços
- `npm run start:dev`: Inicia o ambiente de desenvolvimento

## Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)
- `HOST`: Host do servidor (padrão: localhost)
- `NODE_ENV`: Ambiente (development/production)
- `DATABASE_URL`: URL do banco de dados
- `NEXTAUTH_SECRET`: Segredo para autenticação
- `NEXTAUTH_URL`: URL do servidor de autenticação

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT
