const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');

app.use(express.json());

// Servir arquivos estáticos da raiz
app.use(express.static(__dirname));

// Servir arquivos do painel-tim
app.use('/painel-tim', express.static(path.join(__dirname, 'painel-tim')));

// Servir arquivos do diretório public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servir arquivos do diretório api
app.use('/api', express.static(path.join(__dirname, 'api')));

// Servir arquivos do diretório fichas_salvas
app.use('/fichas_salvas', express.static(path.join(__dirname, 'fichas_salvas')));

// Servir arquivos do diretório novo-projeto-whatsapp
app.use('/novo-projeto-whatsapp', express.static(path.join(__dirname, 'novo-projeto-whatsapp')));

// Servir arquivos do diretório historical
app.use('/historical', express.static(path.join(__dirname, 'historical')));

// Servir arquivos do diretório fichapainel
app.use('/fichapainel', express.static(path.join(__dirname, 'fichapainel')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Rota para o painel de vendas
app.get('/paineldevendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'fichapainel/index.html'));
});

// Rota para consulta de CNPJ (POST)
app.post('/api/consulta-cnpj', async (req, res) => {
    const { cnpj } = req.body;
    if (!cnpj) return res.status(400).json({ error: 'CNPJ não informado' });
    try {
        const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar CNPJ' });
    }
});

// Conexão com o MongoDB Atlas
mongoose.connect('mongodb+srv://valentina:OkRLW84XGOY68FWc@valentina.gdcrr.mongodb.net/valentina?retryWrites=true&w=majority&appName=valentina')
    .then(() => {
        console.log('Conectado ao MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB Atlas:', err);
    });

// Model da ficha
const fichaSchema = new mongoose.Schema({
    cnpj: String,
    razaoSocial: String,
    nomeFantasia: String,
    dataAbertura: String,
    inscricaoEstadual: String,
    situacaoCadastral: String,
    atividadePrincipal: String,
    naturezaJuridica: String,
    capitalSocial: String,
    porte: String,
    situacaoEspecial: String,
    motivoSituacao: String,
    site: String,
    status: String,
    tipo: String,
    qsa: String,
    nomeRepresentante: String,
    rg: String,
    cpf: String,
    dataNascimento: String,
    email: String,
    telefone: String,
    cep: String,
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    planoBlack: String,
    quantidadeLinhas: String,
    planoUltrafibra: String,
    dataVencimento: String,
    tipoLinha: String,
    dataCriacao: { type: Date, default: Date.now }
});
const Ficha = mongoose.model('Ficha', fichaSchema);

// Rota para salvar ficha (agora usando MongoDB)
app.post('/api/fichas', async (req, res) => {
    try {
        const ficha = new Ficha(req.body);
        await ficha.save();
        res.json({ success: true, id: ficha._id });
    } catch (err) {
        console.error('Erro ao salvar ficha no MongoDB:', err);
        res.status(500).json({ error: 'Erro ao salvar ficha no MongoDB' });
    }
});

// Rota para listar fichas (com filtros simples via query string)
app.get('/api/fichas', async (req, res) => {
    try {
        // Montar filtro a partir dos parâmetros de query
        const filtro = {};
        if (req.query.cnpj) filtro.cnpj = req.query.cnpj;
        if (req.query.razaoSocial) filtro.razaoSocial = { $regex: req.query.razaoSocial, $options: 'i' };
        if (req.query.atendente) filtro.atendente = req.query.atendente;
        // Adicione outros filtros conforme necessário
        const fichas = await Ficha.find(filtro).sort({ dataCriacao: -1 });
        res.json(fichas);
    } catch (err) {
        console.error('Erro ao buscar fichas no MongoDB:', err);
        res.status(500).json({ error: 'Erro ao buscar fichas no MongoDB' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 