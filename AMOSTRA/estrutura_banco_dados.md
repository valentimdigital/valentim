# Estrutura do Banco de Dados SQLite

Com base nos requisitos do projeto, defini a seguinte estrutura para o banco de dados SQLite que será utilizado no Painel de Vendas TIM:

## Tabela: Usuarios

```sql
CREATE TABLE Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    cargo TEXT NOT NULL,
    nivel_acesso TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP
);
```

Níveis de acesso:
- `total`: Valentim, Tayna, Wellington
- `parcial`: Larissa, Livia, Ana
- `limitado`: Lene

## Tabela: Clientes

```sql
CREATE TABLE Clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj TEXT NOT NULL UNIQUE,
    nome_empresarial TEXT NOT NULL,
    data_abertura DATE,
    atividades_economicas TEXT,
    natureza_juridica TEXT,
    tipo_empresa TEXT NOT NULL, -- MEI, EI, LTDA, SLU, SS, SA
    endereco TEXT,
    cep TEXT,
    telefone TEXT,
    email TEXT,
    capital_social REAL,
    simples_nacional BOOLEAN,
    mei BOOLEAN,
    situacao_cadastral TEXT,
    limite_credito BOOLEAN DEFAULT FALSE,
    valor_limite_credito REAL DEFAULT 0,
    dividas_tim BOOLEAN DEFAULT FALSE,
    valor_dividas_tim REAL DEFAULT 0,
    etapa_venda TEXT DEFAULT 'Em Andamento', -- Em Andamento, Fechado
    status TEXT DEFAULT 'Ativo', -- Ativo, Inativo
    responsavel_id INTEGER,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES Usuarios(id)
);
```

## Tabela: HistoricoConsultas

```sql
CREATE TABLE HistoricoConsultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    usuario_id INTEGER,
    tipo_consulta TEXT, -- CNPJ, CEP
    valor_consultado TEXT,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);
```

## Tabela: HistoricoAtualizacoes

```sql
CREATE TABLE HistoricoAtualizacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);
```

## Índices para Otimização

```sql
-- Índices para melhorar a performance das consultas
CREATE INDEX idx_clientes_cnpj ON Clientes(cnpj);
CREATE INDEX idx_clientes_nome ON Clientes(nome_empresarial);
CREATE INDEX idx_clientes_tipo ON Clientes(tipo_empresa);
CREATE INDEX idx_clientes_status ON Clientes(status);
CREATE INDEX idx_clientes_responsavel ON Clientes(responsavel_id);
CREATE INDEX idx_clientes_etapa ON Clientes(etapa_venda);
```

## Triggers para Automação

```sql
-- Trigger para atualizar a data_atualizacao automaticamente
CREATE TRIGGER atualizar_data_modificacao
AFTER UPDATE ON Clientes
FOR EACH ROW
BEGIN
    UPDATE Clientes SET data_atualizacao = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para registrar alterações no histórico
CREATE TRIGGER registrar_alteracao
AFTER UPDATE ON Clientes
FOR EACH ROW
BEGIN
    -- Verificar cada campo e registrar se houve alteração
    -- Exemplo para um campo:
    WHEN NEW.limite_credito <> OLD.limite_credito THEN
        INSERT INTO HistoricoAtualizacoes (cliente_id, usuario_id, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, (SELECT id FROM Usuarios WHERE nome = 'sistema'), 'limite_credito', OLD.limite_credito, NEW.limite_credito);
    -- Repetir para outros campos importantes
END;
```

## Dados Iniciais

```sql
-- Inserir usuários do sistema com seus respectivos níveis de acesso
INSERT INTO Usuarios (nome, email, senha, cargo, nivel_acesso) VALUES 
('Valentim', 'valentim@timnegocia.com.br', 'senha_hash', 'Dono', 'total'),
('Tayna', 'tayna@timnegocia.com.br', 'senha_hash', 'Supervisor', 'total'),
('Wellington', 'wellington@timnegocia.com.br', 'senha_hash', 'Gerente', 'total'),
('Larissa', 'larissa@timnegocia.com.br', 'senha_hash', 'Vendedor', 'parcial'),
('Livia', 'livia@timnegocia.com.br', 'senha_hash', 'Vendedor', 'parcial'),
('Ana', 'ana@timnegocia.com.br', 'senha_hash', 'Vendedor', 'parcial'),
('Lene', 'lene@timnegocia.com.br', 'senha_hash', 'Assistente', 'limitado');
```

Esta estrutura de banco de dados foi projetada para atender a todos os requisitos do sistema, incluindo:

1. Armazenamento de informações completas dos clientes
2. Suporte ao sistema de cores baseado no tipo de empresa e status
3. Controle de permissões de usuários
4. Rastreamento de histórico de consultas e atualizações
5. Otimização para consultas rápidas com índices apropriados

O esquema pode ser facilmente implementado usando Prisma ORM, que gerará as migrações necessárias a partir de um modelo de dados definido em TypeScript.
