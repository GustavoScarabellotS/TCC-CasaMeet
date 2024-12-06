console.log('Arquivo criarimovel.js carregado');

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Imovel, Dono, Usuario } = require('../models');
const { getCoordinatesFromCEP } = require('../utils/geocoder');
const { authenticateToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });



router.get('/criar-imovel', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/criar-imovel.html'));
});

router.post('/imovelcriado', authenticateToken, upload.single('Imagem'), async (req, res) => {
    try {
        const { 
            NomeImovel, 
            Descricao, 
            Preco, 
            CEP, 
            Categoria,
            Quartos,    
            Banheiros,  
            Andares     
        } = req.body;
        const imagemNome = req.file ? req.file.filename : null;

        const coordinates = await getCoordinatesFromCEP(CEP);
        
        if (!coordinates) {
            throw new Error('Não foi possível obter as coordenadas para o CEP fornecido');
        }

        const dono = await Dono.findOne({ where: { fk_id_usuario: req.user.id } });
        
        if (!dono) {
            throw new Error('Usuário não está registrado como dono');
        }

        const novoImovel = await Imovel.create({
            nome_imovel: NomeImovel,
            descricao: Descricao,
            valor: Preco,
            cep: CEP,
            categoria: Categoria,
            imagem: imagemNome,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            fk_id_dono: dono.id,
            quartos: Quartos,      
            banheiros: Banheiros,  
            andares: Andares       
        });

        console.log('Imóvel criado com sucesso:', novoImovel);
        res.redirect('/');  
    } catch (error) {
        console.error('Erro detalhado ao criar imóvel:', error);
        res.status(500).send('Erro ao criar imóvel: ' + error.message);
    }
});

router.get('/teste-rota', (req, res) => {
    res.send('funcionando');
});

router.get('/verificar-dono', authenticateToken, async (req, res) => {
    try {
        const dono = await Dono.findOne({
            where: { fk_id_usuario: req.user.id }
        });
        
        res.json({ isDono: !!dono });
    } catch (error) {
        console.error('Erro ao verificar status de dono:', error);
        res.status(500).json({ error: 'Erro ao verificar status de dono' });
    }
});

router.post('/cadastrar-dono', authenticateToken, async (req, res) => {
    try {
        const { nome, cpf, endereco, telefone, datanasc } = req.body;
        
        if (!nome || !cpf) {
            return res.status(400).json({ success: false, error: 'Nome e CPF são obrigatórios' });
        }

        const novoDono = await Dono.create({
            nome,
            cpf,
            endereco,
            telefone,
            datanasc,
            fk_id_usuario: req.user.id
        });
        res.json({ success: true, dono: novoDono });
    } catch (error) {
        console.error('Erro ao cadastrar dono:', error);
        res.status(500).json({ success: false, error: 'Erro ao cadastrar dono: ' + error.message });
    }
});

module.exports = router;
