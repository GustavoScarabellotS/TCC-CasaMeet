const express = require('express');
const router = express.Router();
const db = require('../database/base');
const { authenticateToken } = require('../middlewares/auth');
const { generateCode, sendEmail } = require('../utils/emailService');
const { armazenarCodigo, verificarCodigo } = require('../utils/codigoverificar');

router.post('/toggle-2fa', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log('tentativa de alternar 2FA para o usuário:', userId);

    try {
        const [user] = await db.query('SELECT duas_etapas FROM usuario WHERE id = ?', {
            replacements: [userId],
            type: db.QueryTypes.SELECT
        });
        
        console.log('usuário encontrado:', user);

        if (!user || user.length === 0) {
            console.log('usuário não encontrado');
            return res.status(404).json({ success: false, error: 'usuário não encontrado' });
        }

        const newStatus = !user.duas_etapas; 
        console.log('novo status de 2FA:', newStatus);

        await db.query('UPDATE usuario SET duas_etapas = ? WHERE id = ?', {
            replacements: [newStatus, userId],
            type: db.QueryTypes.UPDATE
        });

        console.log('atualização realizada com sucesso');
        
        return res.json({ success: true, duasEtapasAtivado: newStatus });
    } catch (error) {
        console.error('erro ao alternar 2FA:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/verify-code', async (req, res) => {
    const { userId, code } = req.body;
    
    try {
        const isValid = await verificarCodigo(userId, code);
        if (isValid) {
            res.json({ success: true, message: 'código verificado com sucesso' });
        } else {
            res.status(400).json({ success: false, error: 'código inválido ou expirado' });
        }
    } catch (error) {
        console.error('erro ao verificar código:', error);
        res.status(500).json({ success: false, error: 'erro ao verificar código' });
    }
});

router.post('/send-2fa-code', async (req, res) => {
    const { userId, email } = req.body;
    
    try {
        const code = generateCode();
        await sendEmail(email, code);
        await armazenarCodigo(userId, code);
        res.json({ success: true, message: 'código enviado com sucesso' });
    } catch (error) {
        console.error('erro ao enviar código:', error);
        res.status(500).json({ success: false, error: 'erro ao enviar código' });
    }
});

module.exports = router;