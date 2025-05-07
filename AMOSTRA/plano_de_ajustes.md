# Plano de Ajustes para o Projeto

## 1. Correções de Segurança

### 1.1. Implementar hash de senhas
- Modificar o arquivo `auth.ts` para usar bcrypt na verificação de senhas
- Atualizar os scripts de seed para usar senhas com hash
- Remover senhas em texto puro do código

### 1.2. Melhorar configurações de segurança
- Atualizar o arquivo `.env.production` com um NEXTAUTH_SECRET seguro e aleatório
- Corrigir a configuração NEXTAUTH_URL para produção
- Ajustar as configurações CORS no `next.config.js` para limitar origens permitidas

## 2. Correções de Estrutura e Consistência

### 2.1. Resolver inconsistências nos scripts de seed
- Manter apenas um script de seed (preferencialmente o TypeScript)
- Atualizar o `package.json` para usar apenas um script de seed

### 2.2. Corrigir versões de dependências
- Atualizar as versões do React e Prisma para versões estáveis e atuais
- Verificar compatibilidade entre as dependências

### 2.3. Melhorar tipagem e interfaces
- Corrigir a interface Cliente para tornar campos obrigatórios realmente obrigatórios
- Remover o uso de `any` no código e substituir por tipos específicos

## 3. Implementações Ausentes

### 3.1. Implementar o bot de conversação
- Criar componentes e lógica para o bot de conversação
- Integrar com a API da Receita Federal

### 3.2. Implementar o filtro de pesquisa avançado
- Criar componentes e lógica para o filtro de pesquisa
- Integrar com o backend para filtrar resultados

### 3.3. Implementar a visualização com sistema de cores
- Corrigir a função `determinarCorCard` para seguir corretamente os requisitos
- Implementar a visualização de cards coloridos no painel

## 4. Ordem de Implementação

1. Correções de segurança (prioridade alta)
2. Correções de estrutura e consistência (prioridade média)
3. Implementações ausentes (prioridade baixa, se houver tempo)

Cada ajuste será implementado, testado individualmente e documentado antes de prosseguir para o próximo.
