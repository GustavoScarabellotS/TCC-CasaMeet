const express = require('express');
const router = express.Router();
const { Imovel, Dono } = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/meus-imoveis', authenticateToken, async (req, res) => {
    try {
        console.log('ID do usuário:', req.user.id);

        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });

        console.log('ID do dono:', dono.id);

        const imoveis = await Imovel.findAll({
            where: { fk_id_dono: dono.id },
            order: [['id_imovel', 'DESC']]
        });

        console.log('Imóveis encontrados:', JSON.stringify(imoveis, null, 2));

        res.render('imovel/meus_imoveis', {
            imoveis,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        res.render('imovel/meus_imoveis', {
            imoveis: [],
            erro: 'Erro ao carregar seus imóveis'
        });
    }
});

router.get('/editar-imovel/:id', authenticateToken, async (req, res) => {
    try {
        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });

        if (!dono) {
            return res.status(404).send('Dono não encontrado');
        }

        const imovel = await Imovel.findOne({
            where: { 
                id_imovel: req.params.id,
                fk_id_dono: dono.id 
            }
        });

        if (!imovel) {
            return res.status(404).send('Imóvel não encontrado');
        }

        res.render('imovel/editar', { imovel });
    } catch (error) {
        console.error('Erro ao carregar formulário de edição:', error);
        res.status(500).send('Erro ao carregar formulário de edição');
    }
});

router.post('/atualizar-imovel/:id', authenticateToken, upload.single('imagem'), async (req, res) => {
    try {
        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });

        if (!dono) {
            return res.status(404).send('Dono não encontrado');
        }

        const imovel = await Imovel.findOne({
            where: { 
                id_imovel: req.params.id,
                fk_id_dono: dono.id 
            }
        });

        if (!imovel) {
            return res.status(404).send('Imóvel não encontrado');
        }

        const dadosAtualizados = {
            nome_imovel: req.body.nome_imovel,
            cep: req.body.cep,
            valor: req.body.valor,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            quartos: req.body.quartos || null,
            banheiros: req.body.banheiros || null,
            andares: req.body.andares || null
        };

        if (req.file) {
            dadosAtualizados.imagem = req.file.filename;
        }

        await imovel.update(dadosAtualizados);

        res.redirect('/meus-imoveis');
    } catch (error) {
        console.error('Erro ao atualizar imóvel:', error);
        res.status(500).send('Erro ao atualizar imóvel');
    }
});

module.exports = router; 