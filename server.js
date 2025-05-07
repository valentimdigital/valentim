const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

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

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Rota para o painel de vendas
app.get('/paineldevendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
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

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 