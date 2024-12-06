const express = require('express');
const router = express.Router();
const { Usuario, Dono, sequelize } = require('../models');
const { authenticateToken } = require('../middlewares/auth');

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

router.get('/verificar-dono', authenticateToken, async (req, res) => {
    try {
        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });
        res.json({ isDono: !!dono });
    } catch (error) {
        console.error('Erro ao verificar dono:', error);
        res.status(500).json({ error: 'Erro ao verificar status de dono' });
    }
});

router.post('/cadastrar-dono', authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        // Verifica se já existe um dono com este ID de usuário
        const donoExistente = await Dono.findOne({
            where: { fk_id_usuario: req.user.id },
            transaction: t
        });

        if (donoExistente) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Usuário já está cadastrado como dono'
            });
        }

        const novoDono = await Dono.create({
            nome: req.body.nome,
            cpf: req.body.cpf,
            endereco: req.body.endereco,
            telefone: req.body.telefone,
            datanasc: req.body.datanasc,
            fk_id_usuario: req.user.id
        }, { transaction: t });

        await Usuario.update(
            { isDono: true },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();
        res.json({ success: true });
    } catch (error) {
        await t.rollback();
        console.error('Erro ao cadastrar dono:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao cadastrar dono'
        });
    }
});

module.exports = router;