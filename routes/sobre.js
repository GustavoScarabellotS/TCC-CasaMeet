const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

router.get('/sobre', async (req, res) => {
    const token = req.cookies.token;
    let usuario = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta');
            const usuarioEncontrado = await Usuario.findByPk(decoded.id);
            
            if (usuarioEncontrado) {
                usuario = {
                    id: usuarioEncontrado.id,
                    nome: usuarioEncontrado.usuario_usuario,
                    email: usuarioEncontrado.email,
                    classficacao: usuarioEncontrado.classficacao
                };
            }
        } catch (err) {
            console.error('Erro ao verificar token:', err);
        }
    }

    res.render('sobre', { usuario });
});

module.exports = router;
