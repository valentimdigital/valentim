const express = require('express');
const router = express.Router();
const Ficha = require('../models/Ficha');

// Listar todas as fichas
router.get('/', async (req, res) => {
    try {
        const fichas = await Ficha.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(fichas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar ficha por CNPJ
router.get('/:cnpj', async (req, res) => {
    try {
        const ficha = await Ficha.findOne({
            where: { cnpj: req.params.cnpj }
        });
        if (!ficha) {
            return res.status(404).json({ message: 'Ficha não encontrada' });
        }
        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar nova ficha
router.post('/', async (req, res) => {
    try {
        const ficha = await Ficha.create(req.body);
        res.status(201).json(ficha);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar ficha
router.put('/:cnpj', async (req, res) => {
    try {
        const [updated] = await Ficha.update(req.body, {
            where: { cnpj: req.params.cnpj }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Ficha não encontrada' });
        }
        const ficha = await Ficha.findOne({
            where: { cnpj: req.params.cnpj }
        });
        res.json(ficha);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar ficha
router.delete('/:cnpj', async (req, res) => {
    try {
        const deleted = await Ficha.destroy({
            where: { cnpj: req.params.cnpj }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Ficha não encontrada' });
        }
        res.json({ message: 'Ficha deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 