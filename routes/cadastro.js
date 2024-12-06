const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const path = require('path');

router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/cadastro.html'));
});

router.post('/cadastro', async (req, res) => {
    const { email, usuario_usuario, senha } = req.body;

    try {
        const emailExistente = await Usuario.findOne({ where: { email } });
        if (emailExistente) {
            return res.status(400).send('Este email já está cadastrado');
        }
        const usuarioExistente = await Usuario.findOne({ where: { usuario_usuario } });
        if (usuarioExistente) {
            return res.status(400).send('Este nome de usuário já está em uso');
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        
        const novoUsuario = await Usuario.create({
            email,
            usuario_usuario,
            senha: hashedPassword,
            classficacao: '0',
            duas_etapas: false
        });

        res.redirect("/login");
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).send('Erro ao cadastrar usuário');
    }
});

module.exports = router;
