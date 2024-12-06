const express = require('express');
const router = express.Router();
const { Usuario, Dono, Cliente, Imovel } = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/editar', authenticateToken, async (req, res) => {
    res.render('editar/editar');
});

router.delete('/excluir-imovel/:id', authenticateToken, async (req, res) => {
    try {
        const imovel = await Imovel.findByPk(req.params.id);
        
        if (!imovel) {
            console.error(`Tentativa de excluir imóvel inexistente. ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        if (imovel.imagem) {
            const imagemPath = path.join(__dirname, '../public/uploads/', imovel.imagem);
            try {
                await fs.unlink(imagemPath);
            } catch (err) {
                console.error('Erro ao excluir imagem:', err);
            }
        }

        console.log(`Iniciando exclusão do imóvel ID: ${imovel.id_imovel}`);
        console.log('Dados do imóvel a ser excluído:', {
            id: imovel.id_imovel,
            titulo: imovel.titulo,
            endereco: imovel.endereco,
            donoId: imovel.fk_id_dono,
            dataCriacao: imovel.createdAt
        });

        await imovel.destroy();
        
        console.log(`Imóvel ID: ${imovel.id_imovel} excluído com sucesso`);
        
        res.json({ success: true, message: 'Imóvel excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir imóvel:', {
            id: req.params.id,
            erro: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ error: 'Erro ao excluir imóvel' });
    }
});


router.post('/atualizar-imovel/:id', authenticateToken, upload.single('imagem'), async (req, res) => {
    try {
        const imovel = await Imovel.findByPk(req.params.id);
        
        if (!imovel) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        const dadosAtualizacao = {
            nome_imovel: req.body.nome_imovel,
            cep: req.body.cep,
            valor: req.body.valor,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            quartos: req.body.quartos,
            banheiros: req.body.banheiros,
            andares: req.body.andares
        };

        if (req.file) {
            if (imovel.imagem) {
                const imagemPath = path.join(__dirname, '../public/uploads/', imovel.imagem);
                try {
                    await fs.unlink(imagemPath);
                } catch (err) {
                    console.error('Erro ao excluir imagem antiga:', err);
                }
            }
            dadosAtualizacao.imagem = req.file.filename;
        }

        await imovel.update(dadosAtualizacao);

        res.redirect('/meus-imoveis');
    } catch (error) {
        console.error('Erro ao atualizar imóvel:', error);
        res.status(500).send('Erro ao atualizar imóvel');
    }
});

router.post('/buscar-usuario', authenticateToken, async (req, res) => {
    const { usuario_usuario } = req.body;
    try {
        const usuario = await Usuario.findOne({ where: { usuario_usuario } });
        
        if (usuario) {
            let dadosAdicionais = null;
            
            const dono = await Dono.findOne({ where: { fk_id_usuario: usuario.id } });
            if (dono) {
                dadosAdicionais = { tipo: 'dono', ...dono.toJSON() };
            } else {
                const cliente = await Cliente.findOne({ where: { fk_id_usuario: usuario.id } });
                if (cliente) {
                    dadosAdicionais = { tipo: 'cliente', ...cliente.toJSON() };
                }
            }
            
            res.json({ usuario, dadosAdicionais });
        } else {
            res.status(404).json({ error: 'usuário não encontrado' });
        }
    } catch (error) {
        console.error('erro ao buscar usuário:', error);
        res.status(500).json({ error: 'erro ao buscar usuário' });
    }
});


router.post('/buscar-imovel', authenticateToken, async (req, res) => {
    const { id_imovel } = req.body;
    try {
        const imovel = await Imovel.findByPk(id_imovel);
        if (imovel) {
            res.json(imovel);
        } else {
            res.status(404).json({ error: 'imóvel não encontrado' });
        }
    } catch (error) {
        console.error('erro ao buscar imóvel:', error);
        res.status(500).json({ error: 'erro ao buscar imóvel' });
    }
});



module.exports = router;
