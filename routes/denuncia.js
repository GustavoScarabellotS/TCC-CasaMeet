const express = require('express');
const router = express.Router();
const { Denuncia, Usuario, Imovel, Comentario } = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const moment = require('moment');
moment.locale('pt-br');
const nodemailer = require('nodemailer');
const { sendDenunciaResponseEmail } = require('../utils/emailService');

router.get('/report', authenticateToken, (req, res) => {
    res.render('denuncia/report', {
        usuario: req.user 
    });
});

router.get('/denuncia', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario || (usuario.classficacao !== '1' && usuario.classficacao !== '2')) {
            return res.status(403).send('Acesso não autorizado');
        }

        const denuncias = await Denuncia.findAll({
            where: { status: 'aberta' }, 
            order: [['datadenuncia', 'DESC']],
            include: [{ 
                model: Usuario, 
                as: 'Usuario',
                attributes: ['usuario_usuario'] 
            }]
        });

        const denunciasFormatadas = denuncias.map(d => {
            const denuncia = d.toJSON();
            return {
                ...denuncia,
                datadenuncia: denuncia.datadenuncia ? moment(denuncia.datadenuncia).format('DD/MM/YYYY') : 'Data não disponível'
            };
        });

        res.render('denuncia/denuncia', { 
            denuncias: denunciasFormatadas,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao buscar denúncias:', error);
        res.status(500).send('Erro ao carregar denúncias');
    }
});

router.get('/denuncia/:id', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        
        const denuncia = await Denuncia.findByPk(req.params.id, {
            include: [
                { 
                    model: Usuario, 
                    as: 'Usuario',
                    attributes: ['usuario_usuario'] 
                },
                { 
                    model: Imovel, 
                    as: 'Imovel',
                    attributes: ['nome_imovel'] 
                },
                {
                    model: Comentario,
                    as: 'Comentarios',
                    include: [{
                        model: Usuario,
                        as: 'Usuario',
                        attributes: ['usuario_usuario']
                    }],
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada');
        }

        if (denuncia.fk_id_usuario !== usuario.id && 
            usuario.classficacao !== '1' && 
            usuario.classficacao !== '2') {
            return res.status(403).send('Acesso não autorizado');
        }

        const denunciaFormatada = {
            ...denuncia.toJSON(),
            datadenuncia: denuncia.datadenuncia ? moment(denuncia.datadenuncia).format('DD/MM/YYYY') : 'Data não disponível'
        };

        res.render('denuncia/denuncia-detalhes', { 
            denuncia: denunciaFormatada, 
            usuario: usuario 
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes da denúncia:', error);
        res.status(500).send('Erro ao carregar detalhes da denúncia');
    }
});

router.post('/denuncia/:id/comentario', authenticateToken, async (req, res) => {
    try {
        const denuncia = await Denuncia.findByPk(req.params.id, {
            include: [{ 
                model: Usuario, 
                as: 'Usuario',
                attributes: ['email'] 
            }]
        });

        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada');
        }

        const comentario = await Comentario.create({
            conteudo: req.body.comentario,
            fk_id_usuario: req.user.id,
            fk_id_denuncia: denuncia.id
        });

        const usuarioComentario = await Usuario.findByPk(req.user.id);
        if (usuarioComentario.classficacao === '1' || usuarioComentario.classficacao === '2') {
            await sendDenunciaResponseEmail(denuncia.Usuario.email, denuncia.id);
        }

        res.redirect(`/denuncia/${denuncia.id}`);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).send('Erro ao adicionar comentario');
    }
});

router.post('/denuncia/:id/fechar', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario || (usuario.classficacao !== '2' && usuario.classficacao !== '1')) {
            return res.status(403).send('Acesso não autorizado');
        }

        const denuncia = await Denuncia.findByPk(req.params.id);
        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada');
        }

        await denuncia.update({ status: 'fechada' });
        console.log(`Denúncia ${denuncia.id} fechada com sucesso.`); 

        res.redirect('/denuncia');
    } catch (error) {
        console.error('Erro ao fechar denúncia:', error);
        res.status(500).send('Erro ao fechar denúncia');
    }
});

router.get('/report', authenticateToken, (req, res) => {
    res.render('denuncia/report');
});

router.post('/report', authenticateToken, async (req, res) => {
    try {
        const { descricao, categoria, id_imovel } = req.body;
        const novaDenuncia = await Denuncia.create({
            descricao,
            categoria,
            fk_id_imovel: id_imovel,
            fk_id_usuario: req.user.id,
            usuario_email: req.user.email,
            datadenuncia: new Date()
        });

        res.render('denuncia/report', { success: true });
    } catch (error) {
        console.error('Erro ao criar denúncia:', error);
        res.render('denuncia/report', { error: true });
    }
});

router.get('/denuncia/fechadas', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario || (usuario.classficacao !== '1' && usuario.classficacao !== '2')) {
            return res.status(403).send('Acesso não autorizado');
        }

        const denuncias = await Denuncia.findAll({
            where: { status: 'fechada' },
            order: [['datadenuncia', 'DESC']],
            include: [{ 
                model: Usuario, 
                as: 'Usuario',
                attributes: ['usuario_usuario'] 
            }]
        });

        console.log('Número de denúncias fechadas encontradas:', denuncias.length);
        console.log('Denúncias fechadas:', JSON.stringify(denuncias, null, 2));

        const denunciasFormatadas = denuncias.map(d => {
            const denuncia = d.toJSON();
            return {
                ...denuncia,
                datadenuncia: denuncia.datadenuncia ? moment(denuncia.datadenuncia).format('DD/MM/YYYY') : 'Data não disponível'
            };
        });

        res.render('denuncia/denuncia-fechadas', { denuncias: denunciasFormatadas });
    } catch (error) {
        console.error('Erro ao buscar denúncias fechadas:', error);
        res.status(500).send('Erro ao carregar denúncias fechadas');
    }
});

router.get('/minhas-denuncias', authenticateToken, async (req, res) => {
    try {
        const denuncias = await Denuncia.findAll({
            where: { fk_id_usuario: req.user.id },
            order: [['datadenuncia', 'DESC']],
            include: [
                { 
                    model: Imovel, 
                    as: 'Imovel',
                    attributes: ['nome_imovel'] 
                }
            ]
        });

        const denunciasFormatadas = denuncias.map(d => {
            const denuncia = d.toJSON();
            return {
                ...denuncia,
                datadenuncia: denuncia.datadenuncia ? moment(denuncia.datadenuncia).format('DD/MM/YYYY') : 'Data não disponível'
            };
        });

        res.render('denuncia/minhas-denuncias', { 
            denuncias: denunciasFormatadas,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao buscar denúncias:', error);
        res.status(500).send('Erro ao carregar denúncias');
    }
});

module.exports = router;
