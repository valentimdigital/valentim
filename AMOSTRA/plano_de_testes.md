# Plano de Testes da Aplicação

## 1. Testes de Autenticação

### 1.1. Login
- Verificar se o login funciona corretamente com credenciais válidas
- Verificar se o login é negado com credenciais inválidas
- Verificar se o redirecionamento após login funciona corretamente

### 1.2. Permissões
- Verificar se usuários com acesso total podem acessar todas as funcionalidades
- Verificar se usuários com acesso parcial podem visualizar e editar, mas não excluir
- Verificar se usuários com acesso limitado podem apenas visualizar e adicionar

## 2. Testes de Funcionalidades Principais

### 2.1. Consulta de CNPJ e CEP
- Verificar se a consulta de CNPJ retorna dados corretos da API da Receita Federal
- Verificar se a consulta de CEP retorna dados corretos
- Verificar se os dados são salvos corretamente no banco de dados

### 2.2. Filtro de Pesquisa
- Verificar se a busca por texto (nome ou CNPJ) funciona corretamente
- Verificar se os filtros por tipo de empresa, situação cadastral, etc. funcionam corretamente
- Verificar se a combinação de múltiplos filtros funciona corretamente
- Verificar se o botão de limpar filtros funciona corretamente

### 2.3. Visualização de Clientes
- Verificar se os cards de clientes são exibidos corretamente
- Verificar se o sistema de cores está aplicado conforme os requisitos
- Verificar se a expansão/contração dos cards funciona corretamente
- Verificar se as informações detalhadas são exibidas corretamente

### 2.4. Bot de Conversação
- Verificar se o bot responde corretamente às consultas de CNPJ
- Verificar se o bot responde corretamente às consultas de CEP
- Verificar se o bot exibe mensagens de erro apropriadas para entradas inválidas

## 3. Testes de CRUD

### 3.1. Criação de Clientes
- Verificar se novos clientes podem ser adicionados corretamente
- Verificar se a validação de campos obrigatórios funciona corretamente
- Verificar se o cliente é salvo no banco de dados com os dados corretos

### 3.2. Edição de Clientes
- Verificar se clientes existentes podem ser editados corretamente
- Verificar se as alterações são salvas no banco de dados
- Verificar se as permissões de edição são respeitadas

### 3.3. Exclusão de Clientes
- Verificar se clientes podem ser excluídos corretamente
- Verificar se a confirmação de exclusão funciona corretamente
- Verificar se as permissões de exclusão são respeitadas

## 4. Testes de Responsividade

### 4.1. Desktop
- Verificar se a aplicação é exibida corretamente em telas grandes
- Verificar se todas as funcionalidades estão acessíveis e utilizáveis

### 4.2. Tablet
- Verificar se a aplicação se adapta corretamente a telas médias
- Verificar se o layout é ajustado apropriadamente

### 4.3. Mobile
- Verificar se a aplicação se adapta corretamente a telas pequenas
- Verificar se todas as funcionalidades estão acessíveis e utilizáveis em dispositivos móveis

## 5. Testes de Segurança

### 5.1. Autenticação
- Verificar se as senhas são armazenadas com hash no banco de dados
- Verificar se as rotas protegidas não podem ser acessadas sem autenticação

### 5.2. Autorização
- Verificar se usuários não podem acessar funcionalidades além de seu nível de permissão
- Verificar se as APIs respeitam as permissões de usuário

### 5.3. Validação de Entrada
- Verificar se há validação adequada para entradas de usuário
- Verificar se a aplicação está protegida contra injeção de SQL

## 6. Testes de Desempenho

### 6.1. Carregamento Inicial
- Verificar o tempo de carregamento inicial da aplicação
- Identificar possíveis gargalos de desempenho

### 6.2. Operações de Dados
- Verificar o tempo de resposta para consultas de CNPJ e CEP
- Verificar o tempo de resposta para operações de filtro com grande volume de dados
