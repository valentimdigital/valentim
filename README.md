# Sistema Painel TIM

Sistema de gerenciamento para operações TIM.

## Funcionalidades

- Ficha TIM (Cadastro de empresas)
- Painel de Vendas
- Consulta CNPJ
- Fichas Salvas
- Integração com WhatsApp
- Histórico de atividades

## Instalação Local

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor
```bash
npm start
```

4. Acesse http://localhost:3000

## Deploy

### Vercel (Recomendado)
1. Crie uma conta em vercel.com
2. Conecte com seu GitHub
3. Importe o repositório
4. A Vercel detectará automaticamente as configurações

### Heroku
1. Crie uma conta no Heroku
2. Instale o Heroku CLI
3. Execute os comandos:
```bash
heroku login
heroku create
git push heroku main
```

### Railway
1. Crie conta em railway.app
2. Conecte com GitHub
3. Selecione o repositório
4. Configure as variáveis de ambiente

## Tecnologias Utilizadas

- Node.js
- Express
- Tailwind CSS
- Bootstrap Icons
- WhatsApp API (Baileys) 