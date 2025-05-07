# Design da Interface de Atendimento via WhatsApp

## Visão Geral

Este documento apresenta o design da interface de atendimento via WhatsApp para o Painel de Vendas TIM, seguindo o padrão visual já implementado no projeto. A interface será integrada com a biblioteca Baileys conforme preferência do cliente.

## Estrutura da Interface

A interface de atendimento será composta por três colunas principais, seguindo o layout da referência fornecida, mas adaptada ao estilo visual da TIM:

### 1. Coluna Esquerda: Lista de Conversas
- Barra de pesquisa no topo
- Abas para filtrar conversas (Ativos, Pendentes, Potenciais)
- Lista de contatos com informações básicas
- Indicadores visuais de status e prioridade

### 2. Coluna Central: Área de Chat
- Cabeçalho com informações do contato atual
- Histórico de mensagens
- Campo de entrada de texto
- Botões de ação (enviar arquivos, emojis, etc.)

### 3. Coluna Direita: Informações do Cliente
- Dados do cliente (nome, telefone, CNPJ)
- Estatísticas de atendimento
- Abas para diferentes tipos de informações
- Ações rápidas relacionadas ao cliente

## Elementos de Design

### Cores
Utilizaremos as cores oficiais da TIM já implementadas no projeto:
- Azul marinho principal (#00348D) - Cabeçalhos, botões principais
- Vermelho (#E40613) - Alertas, notificações, ações importantes
- Azul claro (#E6F0FF) - Fundos, mensagens recebidas
- Cinza claro (#F5F5F5) - Fundo geral da aplicação
- Branco (#FFFFFF) - Cards, áreas de conteúdo

### Tipografia
- Fonte principal: Inter (mesma do projeto atual)
- Hierarquia de tamanhos consistente com o resto da aplicação

### Componentes Visuais
- Cards com cantos arredondados
- Sombras sutis para elevação
- Ícones consistentes com o resto da aplicação
- Badges coloridos para indicar status

## Design Detalhado por Seção

### Cabeçalho da Aplicação
- Barra superior em azul marinho (#00348D)
- Logo da TIM à esquerda
- Título "Painel de Vendas - Atendimento" ao centro
- Informações do usuário logado à direita

### Lista de Conversas (Coluna Esquerda)

#### Barra de Pesquisa
- Campo de busca com ícone de lupa
- Placeholder "Buscar por nome ou número..."
- Fundo branco com borda sutil

#### Abas de Filtro
- Abas horizontais: "Ativos (XX)", "Pendentes (XX)", "Potenciais (XX)"
- Aba ativa com borda inferior azul TIM
- Contador de conversas em cada categoria

#### Lista de Contatos
- Card para cada contato com:
  - Ícone/Avatar do WhatsApp à esquerda
  - Nome do cliente/empresa em negrito
  - Número de telefone/CNPJ abaixo do nome
  - Prévia da última mensagem
  - Horário da última mensagem
  - Indicadores de status (novo, urgente, etc.)
- Borda lateral colorida indicando categoria:
  - Azul: Cliente ativo
  - Vermelho: Cliente com pendências
  - Verde: Cliente potencial
- Estado hover/selecionado com fundo azul claro

### Área de Chat (Coluna Central)

#### Cabeçalho do Chat
- Fundo azul marinho (#00348D)
- Nome do cliente/empresa em branco
- Número de telefone/CNPJ
- Indicador de status (online, offline)
- Botões de ação (ligar, mais opções)

#### Histórico de Mensagens
- Mensagens do cliente alinhadas à esquerda
- Mensagens do atendente alinhadas à direita
- Balões de mensagem com cantos arredondados
- Mensagens do cliente: fundo azul claro (#E6F0FF)
- Mensagens do atendente: fundo azul TIM (#00348D) com texto branco
- Mensagens do bot: fundo cinza claro com ícone de robô
- Timestamp abaixo de cada mensagem
- Indicadores de status (enviado, entregue, lido)

#### Campo de Entrada
- Campo de texto com borda arredondada
- Placeholder "Digite uma mensagem..."
- Botões para anexar arquivos, emojis
- Botão de enviar em azul TIM com ícone

### Informações do Cliente (Coluna Direita)

#### Abas de Informação
- Abas horizontais: "Atendimento", "CRM", "Informações"
- Design consistente com as abas da coluna esquerda

#### Seção de Estatísticas
- Cards com contadores:
  - Atendimentos: X
  - Mensagens: X
- Ícones representativos
- Valores em destaque

#### Dados do Cliente
- Seções organizadas em cards:
  - Informações básicas (nome, telefone, email)
  - Dados empresariais (CNPJ, tipo de empresa)
  - Histórico de interações
- Títulos em azul TIM
- Dados organizados em pares label/valor

#### Ações Rápidas
- Botões para ações comuns:
  - Adicionar tarefa
  - Registrar atendimento
  - Transferir conversa
- Estilo consistente com os botões do resto da aplicação

## Estados e Interações

### Estados de Conversa
- Não lida: Indicador visual (ponto azul)
- Em atendimento: Badge "Em atendimento"
- Transferida: Badge "Transferida"
- Finalizada: Badge "Finalizada"

### Notificações
- Novas mensagens: Notificação sonora + visual
- Mensagens não lidas: Contador no ícone da aplicação
- Alertas de inatividade: Notificação após X minutos sem resposta

### Ações Principais
- Iniciar atendimento: Botão "Atender" em conversas pendentes
- Transferir: Opção para selecionar outro atendente
- Finalizar: Encerrar conversa com resumo
- Adicionar nota: Registrar informações sobre o atendimento

## Responsividade

A interface será responsiva, adaptando-se a diferentes tamanhos de tela:

### Desktop (>1200px)
- Layout completo de três colunas

### Tablet (768px-1200px)
- Duas colunas visíveis (lista + chat)
- Coluna de informações acessível via botão

### Mobile (<768px)
- Uma coluna visível por vez
- Navegação entre colunas via botões/gestos
- Foco na experiência de chat em telas pequenas

## Acessibilidade

- Contraste adequado entre texto e fundo
- Tamanhos de fonte ajustáveis
- Suporte a navegação por teclado
- Atributos ARIA para elementos interativos
- Mensagens de erro claras e descritivas

## Próximos Passos

1. Criar mockup visual detalhado da interface
2. Validar o design com o cliente
3. Planejar a implementação técnica
4. Desenvolver a integração com a biblioteca Baileys
