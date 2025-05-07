# Requisitos do Sistema - Painel de Vendas TIM

## Visão Geral
O sistema consiste em um painel de vendas interno para gerenciar clientes empresariais da TIM, com um bot de conversação para consultar informações de clientes, integração com a API da Receita Federal e um banco de dados SQLite para armazenamento local.

## Requisitos Funcionais

### 1. Consulta e Gerenciamento de Clientes
- Permitir entrada de CNPJ ou CEP para consultar informações de empresas via API da Receita Federal
- Armazenar ou atualizar informações no banco de dados SQLite
- Exibir informações completas da empresa:
  - Nome Empresarial
  - CNPJ
  - Data de Abertura
  - Atividades Econômicas
  - Natureza Jurídica
  - Endereço Completo
  - Telefone
  - E-mail
  - Capital Social
  - Simples Nacional e MEI
  - Situação Cadastral (Ativa ou Inapta)

### 2. Edição Manual de Dados
- Permitir edição manual pela equipe de vendas dos seguintes campos:
  - Limite de Crédito
  - Dívidas com a TIM
  - Etapa da Venda (Ex: Em Andamento, Fechado)
  - Status (Ex: Ativo, Inativo)
  - Responsável pelo Atendimento
  - Data de Atualização

### 3. Visualização com Sistema de Cores
- Representar cada cliente por um card colorido no painel de vendas
- Implementar o seguinte sistema de cores por tipo de empresa:
  - **Microempreendedor Individual (MEI)**:
    - Azul Claro: MEI com limite de crédito
    - Azul Escuro: MEI sem limite de crédito
  - **Empresário Individual (EI)**:
    - Verde Claro: EI com limite de crédito
    - Verde Escuro: EI sem limite de crédito
  - **Sociedade Limitada (LTDA)**:
    - Verde Claro: LTDA com limite de crédito
    - Verde Escuro: LTDA sem limite de crédito
    - Marrom: LTDA com dívida
    - Amarelo: LTDA com menos de 6 meses de existência
  - **Sociedade Limitada Unipessoal (SLU)**:
    - Verde Claro: SLU com limite de crédito
    - Verde Escuro: SLU sem limite de crédito
    - Marrom: SLU com dívida
    - Amarelo: SLU com menos de 6 meses de existência
  - **Sociedade Simples (SS)**:
    - Cinza Claro: SS com limite de crédito
    - Cinza Escuro: SS sem limite de crédito
  - **Sociedade Anônima (SA)**:
    - Roxo Claro: SA com limite de crédito
    - Roxo Escuro: SA sem limite de crédito
  - **Situação Especial**:
    - Vermelho Claro: Inapta
    - Vermelho Escuro: Com dívida com a TIM
- Implementar uma aba fixa no topo do índice mostrando a cor do status do cliente

### 4. Permissões de Acesso
- Implementar diferentes níveis de permissão:
  - **Acesso Total** (Valentim, Tayna, Wellington): Todas as funções
  - **Acesso Parcial** (Larissa, Livia, Ana): Visualizar e editar dados dos clientes
  - **Acesso Limitado** (Lene): Apenas adicionar clientes, sem permissão para editar

### 5. Bot de Conversação
- Desenvolver um bot simples e responsivo para consultas
- O bot deve:
  - Responder a consultas de CNPJ ou CEP
  - Consultar a API da Receita Federal
  - Atualizar o banco de dados com informações recebidas
  - Exibir informações organizadas para o usuário

### 6. Filtro de Pesquisa
- Implementar campo de pesquisa com filtros para:
  - Nome da Empresa
  - CNPJ
  - Status da Empresa (Ativa/Inapta)
  - Tipo de Empresa (MEI, EI, LTDA, SLU, SS, SA)
  - Limite de Crédito (Sim/Não)
  - Dívidas com a TIM (Sim/Não)
  - Etapa da Venda (Em Andamento/Fechado)
  - Responsável (Larissa, Livia, etc.)
- Atualização automática do painel conforme ajuste dos filtros

### 7. Banco de Dados (SQLite)
- Estrutura da tabela de Clientes:
  - ID (chave primária)
  - CNPJ
  - Nome Empresarial
  - Data de Abertura
  - Atividades Econômicas
  - Natureza Jurídica
  - Endereço
  - Telefone
  - E-mail
  - Capital Social
  - Simples Nacional
  - MEI
  - Situação Cadastral
  - Limite de Crédito
  - Dívidas com a TIM
  - Etapa da Venda
  - Responsável
  - Data de Atualização

## Requisitos Não-Funcionais

### 1. Interface
- Design responsivo compatível com desktop e dispositivos móveis
- Interface intuitiva e de fácil navegação
- Identidade visual alinhada com a marca TIM (cores, logos)

### 2. Desempenho
- Tempo de resposta rápido para consultas à API
- Carregamento eficiente do painel de clientes
- Atualização em tempo real dos filtros de pesquisa

### 3. Segurança
- Autenticação de usuários com diferentes níveis de permissão
- Proteção de dados sensíveis dos clientes
- Validação de entradas para prevenir injeção de SQL

### 4. Usabilidade
- Interface intuitiva para facilitar o uso pela equipe de vendas
- Sistema de cores claro e consistente
- Feedback visual para ações do usuário

### 5. Manutenibilidade
- Código bem estruturado e documentado
- Separação clara entre frontend e backend
- Facilidade para adicionar novas funcionalidades no futuro
