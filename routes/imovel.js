const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken } = require('../middlewares/auth');

function formatarCategoria(categoria) {
    const categorias = {
        'casadepraia': 'Casa de Praia',
        'apartamento': 'Apartamento',
        'terreno': 'Terreno',
        'casa': 'Casa',
        'kitnet': 'Kitnet',
        'armazem': 'Armazém',
        'comercial': 'Comercial'
    };
    return categorias[categoria] || categoria;
}

router.get('/imovel/:id', authenticateToken, async (req, res) => {
    try {
        const imovel = await db.Imovel.findByPk(req.params.id, {
            include: [{
                model: db.Dono,
                as: 'Dono',
                attributes: ['id', 'nome', 'fk_id_usuario']
            }]
        });

        if (!imovel) {
            return res.status(404).send('Imóvel não encontrado');
        }

        let isDonoDoImovel = false;
        if (imovel.Dono) {
            isDonoDoImovel = imovel.Dono.fk_id_usuario === req.user.id;
        }

        res.render('imovel/detalhes', {
            imovel: imovel.toJSON(),
            isDonoDoImovel,
            usuario: req.user,
            formatarCategoria: formatarCategoria
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes do imóvel:', error);
        res.status(500).send('Erro ao carregar detalhes do imóvel');
    }
});

module.exports = router; 