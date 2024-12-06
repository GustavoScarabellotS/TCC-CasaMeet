const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');
const db = require('../database/base'); 


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
    
        const [user] = await db.query('SELECT id FROM usuario WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userId = user[0].id;
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = new Date(Date.now() + 3600000); 

        await db.query('INSERT INTO verificar_email (usuario_id, codigo, expirar) VALUES (?, ?, ?)', 
            [userId, resetToken, resetTokenExpiration]);

        const resetUrl = `http://localhost:${process.env.PORT || 3000}/reset-password/${resetToken}`;
        const emailContent = `
            <p>Você solicitou a redefinição de sua senha.</p>
            <p>Clique no link abaixo para redefinir sua senha:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Este link expirará em 1 hora.</p>
        `;

        await sendEmail(email, 'Redefinição de Senha', emailContent);
        res.json({ message: 'E-mail de redefinição de senha enviado' });
    } catch (error) {
        console.error('Erro ao processar solicitação de redefinição de senha:', error);
        res.status(500).json({ error: 'Erro ao processar solicitação de redefinição de senha' });
    }
});


router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const [tokenInfo] = await db.query('SELECT * FROM verificar_email WHERE codigo = ? AND expirar > NOW()', [token]);

        if (tokenInfo.length === 0) {
            return res.status(400).render('error', { message: 'Token inválido ou expirado' });
        }

        res.render('reset-password', { token });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).render('error', { message: 'Erro ao processar solicitação' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const [tokenInfo] = await db.query('SELECT * FROM verificar_email WHERE codigo = ? AND expirar > NOW()', [token]);

        if (tokenInfo.length === 0) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        const userId = tokenInfo[0].usuario_id;

    } catch (error) {
        console.error('Erro ao processar solicitação de redefinição de senha:', error);
        res.status(500).json({ error: 'Erro ao processar solicitação de redefinição de senha' });
    }
});

module.exports = router;
