const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ficha = sequelize.define('Ficha', {
    // Dados da Empresa
    cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    razaoSocial: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nomeFantasia: {
        type: DataTypes.STRING
    },
    dataAbertura: {
        type: DataTypes.DATE
    },
    inscricaoEstadual: {
        type: DataTypes.STRING
    },
    situacaoCadastral: {
        type: DataTypes.STRING
    },
    atividadePrincipal: {
        type: DataTypes.STRING
    },
    naturezaJuridica: {
        type: DataTypes.STRING
    },

    // Dados do Representante
    nomeRepresentante: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rg: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dataNascimento: {
        type: DataTypes.DATE
    },
    email: {
        type: DataTypes.STRING
    },
    telefone: {
        type: DataTypes.STRING
    },

    // Endereço
    cep: {
        type: DataTypes.STRING
    },
    logradouro: {
        type: DataTypes.STRING
    },
    numero: {
        type: DataTypes.STRING
    },
    complemento: {
        type: DataTypes.STRING
    },
    bairro: {
        type: DataTypes.STRING
    },
    cidade: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    },

    // Planos
    planoBlack: {
        type: DataTypes.STRING
    },
    quantidadeLinhas: {
        type: DataTypes.INTEGER
    },
    planoUltrafibra: {
        type: DataTypes.STRING
    },
    dataVencimento: {
        type: DataTypes.STRING
    },
    tipoLinha: {
        type: DataTypes.STRING
    },

    // Data de criação
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Ficha; 