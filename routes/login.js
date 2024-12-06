const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const path = require('path');
const { generateCode, sendEmail } = require('../utils/emailService');
const { armazenarCodigo } = require('../utils/codigoverificar');
const { VerificarEmail } = require('../models');
const { Op } = require('sequelize');

router.post('/login', async (req, res) => {
    const { loginemail, loginsenha, twoFactorCode } = req.body;

    try {
        const usuario = await Usuario.findOne({ 
            where: { email: loginemail },
            attributes: ['id', 'email', 'usuario_usuario', 'senha', 'classficacao', 'duas_etapas']
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const senhaCorreta = await bcrypt.compare(loginsenha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        if (twoFactorCode) {
            const verification = await VerificarEmail.findOne({
                where: {
                    usuario_id: usuario.id,
                    codigo: twoFactorCode,
                    expirar: {
                        [Op.gt]: new Date()  
                    }
                },
                order: [['id', 'DESC']]  
            });

            if (!verification) {
                return res.status(401).json({ error: 'Código 2FA inválido ou expirado.' });
            }

 
            await verification.destroy();
        } else if (usuario.duas_etapas) {
       
            const code = generateCode();
            await sendEmail(usuario.email, code);
            await armazenarCodigo(usuario.id, code);

            return res.json({ requireTwoFactor: true, message: 'Código de verificação enviado para o seu email.' });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                nome: usuario.usuario_usuario, 
                email: usuario.email,
                classficacao: usuario.classficacao
            },
            process.env.JWT_SECRET || 'chave_secreta',
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 
        });
        return res.json({ success: true });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        });
    }
});


router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

module.exports = router;
