// API de consulta de CNPJ
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/consulta-cnpj', async (req, res) => {
    const cnpj = req.query.cnpj;

    if (!cnpj) {
        console.log("[CNPJ API] CNPJ não informado");
        return res.status(400).json({ status: "ERROR", message: "CNPJ não informado" });
    }

    try {
        console.log(`[CNPJ API] Consultando: https://receitaws.com.br/v1/cnpj/${cnpj}`);
        const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });
        console.log(`[CNPJ API] Status: ${response.status}`);
        const data = await response.json();
        console.log(`[CNPJ API] Resposta:`, data);
        res.json(data);
    } catch (error) {
        console.error("[CNPJ API] Erro ao consultar ReceitaWS", error);
        res.status(500).json({ status: "ERROR", message: "Erro ao consultar ReceitaWS" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 