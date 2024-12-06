const express = require('express');
const router = express.Router();
const { Usuario, Mensagem, Dono } = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');
const db = require('../models');

router.get('/conversas', authenticateToken, async (req, res) => {
    try {
        const todasMensagens = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    { remetente_id: req.user.id },
                    { destinatario_id: req.user.id }
                ]
            },
            include: [
                {
                    model: Usuario,
                    as: 'Remetente',
                    attributes: ['id', 'usuario_usuario'],
                    include: [{
                        model: Dono,
                        as: 'Dono',
                        attributes: ['nome']
                    }]
                },
                {
                    model: Usuario,
                    as: 'Destinatario',
                    attributes: ['id', 'usuario_usuario'],
                    include: [{
                        model: Dono,
                        as: 'Dono',
                        attributes: ['nome']
                    }]
                }
            ],
            order: [['data_envio', 'DESC']]
        });
        const conversasMap = new Map();
        
        todasMensagens.forEach(mensagem => {
            const outroUsuarioId = mensagem.remetente_id === req.user.id ? 
                mensagem.destinatario_id : mensagem.remetente_id;
            
            if (!conversasMap.has(outroUsuarioId)) {
                conversasMap.set(outroUsuarioId, mensagem);
            }
        });

        const conversas = Array.from(conversasMap.values());

        res.render('chat/conversas', { 
            conversas,
            usuarioAtual: req.user,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        res.status(500).send('Erro ao carregar conversas');
    }
});

router.get('/chat/:userId', authenticateToken, async (req, res) => {
    try {
        const outroUsuario = await Usuario.findByPk(req.params.userId, {
            include: [{
                model: Dono,
                as: 'Dono',
                attributes: ['nome', 'id']
            }]
        });

        if (!outroUsuario) {
            return res.status(404).send('Usuário não encontrado');
        }

        const mensagens = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    {
                        remetente_id: req.user.id,
                        destinatario_id: req.params.userId
                    },
                    {
                        remetente_id: req.params.userId,
                        destinatario_id: req.user.id
                    }
                ]
            },
            order: [['data_envio', 'ASC']]
        });

        await Mensagem.update(
            { lida: true },
            {
                where: {
                    destinatario_id: req.user.id,
                    remetente_id: req.params.userId,
                    lida: false
                }
            }
        );

        res.render('chat/chat', {
            mensagens,
            outroUsuario,
            usuarioAtual: req.user,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao carregar chat:', error);
        res.status(500).send('Erro ao carregar chat');
    }
});

router.post('/enviar-mensagem', authenticateToken, async (req, res) => {
    try {
        const { destinatario_id, conteudo } = req.body;
        
        await Mensagem.create({
            conteudo,
            remetente_id: req.user.id,
            destinatario_id,
            data_envio: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

router.put('/mensagem/:id', authenticateToken, async (req, res) => {
    try {
        const { conteudo } = req.body;
        const mensagem = await Mensagem.findByPk(req.params.id);

        if (!mensagem || mensagem.remetente_id !== req.user.id) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        await mensagem.update({
            conteudo,
            editada: true
        });

        res.json({ success: true, mensagem });
    } catch (error) {
        console.error('Erro ao editar mensagem:', error);
        res.status(500).json({ error: 'Erro ao editar mensagem' });
    }
});

router.delete('/mensagem/:id', authenticateToken, async (req, res) => {
    try {
        const mensagem = await Mensagem.findByPk(req.params.id);

        if (!mensagem || mensagem.remetente_id !== req.user.id) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        await mensagem.update({ deletada: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        res.status(500).json({ error: 'Erro ao deletar mensagem' });
    }
});

module.exports = router; 