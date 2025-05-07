-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cnpj" TEXT NOT NULL,
    "nomeEmpresarial" TEXT NOT NULL,
    "dataAbertura" DATETIME NOT NULL,
    "atividades" TEXT NOT NULL,
    "naturezaJuridica" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "capitalSocial" REAL NOT NULL,
    "simplesNacional" BOOLEAN NOT NULL,
    "mei" BOOLEAN NOT NULL,
    "situacaoCadastral" TEXT NOT NULL,
    "limiteCredito" BOOLEAN NOT NULL,
    "dividasTim" BOOLEAN NOT NULL,
    "etapaVenda" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cnpj_key" ON "Cliente"("cnpj");
