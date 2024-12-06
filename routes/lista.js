const express = require('express');
const router = express.Router();
const db = require('../database/base');
const geoip = require('geoip-lite');
const path = require('path');
const { Imovel, Dono, Usuario } = require('../models');
const { authenticateToken } = require('../middlewares/auth');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

router.get('/lista-imovel', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    try {
        const categoria = req.query.categoria;
        const whereClause = categoria && categoria !== 'Todos' ? { categoria: categoria } : {};
        
        const imoveis = await Imovel.findAll({
            where: whereClause,
            include: [{
                model: Dono,
                as: 'Dono',
                attributes: ['nome']
            }]
        });

        const imoveisFormatados = imoveis.map(imovel => ({
            id_imovel: imovel.id_imovel,
            nome_imovel: imovel.nome_imovel,
            cep: imovel.cep,
            latitude: imovel.latitude,
            longitude: imovel.longitude,
            categoria: imovel.categoria,
            valor: imovel.valor,
            imagemUrl: imovel.imagem ? `/uploads/${imovel.imagem}` : '/uploads/KAFFEE.png',
            dono: imovel.Dono ? imovel.Dono.nome : 'Não informado',
            quartos: imovel.quartos,
            banheiros: imovel.banheiros,
            andares: imovel.andares
        }));

        res.json(imoveisFormatados);
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        res.status(500).json({ error: 'Erro ao carregar a lista de imóveis' });
    }
});

router.get('/imagem-imovel/:id', async (req, res) => {
    try {
        const imovel = await Imovel.findByPk(req.params.id, {
            attributes: ['imagem']
        });

        if (imovel && imovel.imagem) {
            const imagemPath = path.join(__dirname, '../public/uploads', imovel.imagem);
            res.sendFile(imagemPath);
        } else {
            res.status(404).send('Imagem não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar imagem:', error);
        res.status(500).send('Erro ao carregar a imagem');
    }
});

router.get('/listar-imoveis', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    try {
        const imoveis = await Imovel.findAll({
            include: [{
                model: Dono,
                as: 'Dono'
            }]
        });

        res.render('listar/lista_imoveis', { 
            imoveis: imoveis,
            usuario: req.user 
        });
    } catch (error) {
        console.error('Erro ao listar imóveis:', error);
        res.status(500).json({ error: 'Erro ao listar imóveis' });
    }
});



router.get('/meus-imoveis', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            console.log('Usuário não autenticado');
            return res.redirect('/login');
        }

        console.log('ID do usuário:', req.user.id); 

        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });

        if (!dono) {
            return res.render('imovel/meus_imoveis', {
                imoveis: [],
                mensagem: 'Você não está registrado como dono'
            });
        }

        console.log('ID do dono:', dono.id); 

        const imoveis = await Imovel.findAll({
            where: { fk_id_dono: dono.id },
            order: [['id_imovel', 'DESC']]
        });

        res.render('imovel/meus_imoveis', {
            imoveis,
            usuario: req.user
        });
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        res.render('imovel/meus_imoveis', {
            imoveis: [],
            mensagem: 'Erro ao carregar seus imóveis'
        });
    }
});

module.exports = router;
