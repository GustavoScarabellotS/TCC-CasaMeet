const express = require('express');
const router = express.Router();
const { Usuario, Dono, Imovel, Mensagem, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;
const { authenticateToken } = require('../middlewares/auth');

router.get('/perfil', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        const dono = await Dono.findOne({ where: { fk_id_usuario: req.user.id } });

        if (dono && dono.datanasc) {
            try {
                const date = new Date(dono.datanasc);
                if (!isNaN(date.getTime())) {  
                    dono.datanasc = date;
                } else {
                    dono.datanasc = null;
                }
            } catch (error) {
                console.error('Error parsing date:', error);
                dono.datanasc = null;
            }
        }

        res.render('perfil/editar', { 
            usuario: usuario || {}, 
            dono: dono || {}, 
            mensagem: req.query.mensagem,
            referrer: req.headers.referer || '/'
        });
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        res.status(500).send('Erro ao carregar perfil');
    }
});


router.post('/atualizar-perfil', authenticateToken, async (req, res) => {
    try {
        const { nome, cpf, endereco, telefone, datanasc, email } = req.body;

     
        await Usuario.update(
            { email },
            { where: { id: req.user.id } }
        );

    
        const [dono] = await Dono.findOrCreate({
            where: { fk_id_usuario: req.user.id },
            defaults: {
                nome,
                cpf,
                endereco,
                telefone,
                datanasc,
                fk_id_usuario: req.user.id
            }
        });

        if (dono) {
            await dono.update({
                nome,
                cpf,
                endereco,
                telefone,
                datanasc
            });
        }

        res.redirect('/?success=Perfil atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.render('perfil/editar', {
            usuario: req.user,
            dono: req.body,
            mensagem: 'Erro ao atualizar perfil'
        });
    }
});

router.delete('/excluir-perfil', authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const userId = req.user.id;
        
        console.log(`Iniciando processo de exclusão do usuário ID: ${userId}`);

        await Mensagem.destroy({
            where: {
                [Op.or]: [
                    { remetente_id: userId },
                    { destinatario_id: userId }
                ]
            },
            transaction: t
        });

        const dono = await Dono.findOne({ 
            where: { fk_id_usuario: userId },
            transaction: t
        });

        if (dono) {
            console.log(`Usuário é dono, ID do dono: ${dono.id}`);
            
            await Imovel.destroy({
                where: { fk_id_dono: dono.id },
                transaction: t
            });

            await dono.destroy({ transaction: t });
        }

        await Usuario.destroy({
            where: { id: userId },
            transaction: t
        });

        await t.commit();
        console.log(`Usuário ID: ${userId} excluído com sucesso`);

        req.session.destroy();
        res.clearCookie('token');
        
        res.json({ success: true, message: 'Perfil excluído com sucesso' });
        
    } catch (error) {
        await t.rollback();
        
        console.error('Erro ao excluir perfil:', {
            userId: req.user.id,
            erro: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            error: 'Erro ao excluir perfil',
            message: error.message 
        });
    }
});

module.exports = router; 