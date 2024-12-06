const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();
const db = require('./models');
const { Usuario } = require('./models');

const cadastroRoutes = require('./routes/cadastro');
const criarImovelRoutes = require('./routes/criarimovel');
const duasEtapasRoutes = require('./routes/duas_etapas');
const listaRoutes = require('./routes/lista');
const loginRoutes = require('./routes/login');
const editarRoutes = require('./routes/editar');
const denunciaRoutes = require('./routes/denuncia');
const forgotPassRoutes = require('./routes/forgotPassRoutes');
const meusImoveisRoutes = require('./routes/meusImoveis');
const perfilRoutes = require('./routes/perfil');
const imovelRoutes = require('./routes/imovel');
const sobreRoutes = require('./routes/sobre');
const chatRouter = require('./routes/chat');
const donoRoutes = require('./routes/dono');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'pubslic')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({   
    secret: process.env.SESSION_SECRET || 'chave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

app.use('/', donoRoutes);
app.use('/', sobreRoutes);
app.use('/', perfilRoutes);
app.use('/', cadastroRoutes);
app.use('/', criarImovelRoutes);
app.use('/', duasEtapasRoutes);
app.use('/', listaRoutes);
app.use('/', loginRoutes);
app.use('/', editarRoutes);
app.use('/', denunciaRoutes);
app.use('/api', editarRoutes);
app.use('/middlewares', express.static('middlewares'));
app.use('/scripts', express.static(path.join(__dirname, 'middlewares')));
app.use('/', forgotPassRoutes);
app.use('/', meusImoveisRoutes);
app.use('/', imovelRoutes);
app.use('/', chatRouter);

app.get('/', async (req, res) => {
    const token = req.cookies.token;
    let usuarioData = null;
    let imoveisAleatorios = [];

    try {
        imoveisAleatorios = await db.Imovel.findAll({
            order: sequelize.literal('RAND()'),
            limit: 3,
            attributes: ['id_imovel', 'nome_imovel', 'valor', 'imagem']
        });

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta');
            const usuario = await Usuario.findByPk(decoded.id);

            if (usuario) {
                usuarioData = {
                    id: usuario.id,
                    nome: usuario.usuario_usuario,
                    email: usuario.email,
                    classficacao: usuario.classficacao
                };
            }
        }

        res.render('home', { 
            usuario: usuarioData,
            imoveis: imoveisAleatorios
        });
    } catch (err) {
        console.error('Erro:', err);
        res.clearCookie('token');
        res.render('home', { 
            usuario: null,
            imoveis: []
        });
    }
});

app.use((req, res, next) => {
    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'chave_secreta');
            req.session.usuario = decoded;
        } catch (err) {
            console.error('Erro ao verificar token:', err);
        }
    }
    res.locals.usuario = req.session.usuario;
    next();
});

const { sequelize } = require('./models');

const connections = new Map();

wss.on('connection', (ws) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Mensagem recebida:', data);
            
            if (data.type === 'init') {
                connections.set(data.userId.toString(), ws);
                console.log('Usuário conectado:', data.userId);
                ws.send(JSON.stringify({ type: 'connected' }));
            }
            else if (data.type === 'message') {
                const novaMensagem = await db.Mensagem.create({
                    conteudo: data.conteudo,
                    remetente_id: data.remetente_id,
                    destinatario_id: data.destinatario_id,
                    data_envio: new Date(),
                    lida: false
                });

                const destinatarioWs = connections.get(data.destinatario_id.toString());
                if (destinatarioWs && destinatarioWs.readyState === WebSocket.OPEN) {
                    destinatarioWs.send(JSON.stringify({
                        type: 'message',
                        mensagem: novaMensagem
                    }));
                }

                ws.send(JSON.stringify({
                    type: 'message_sent',
                    mensagem: novaMensagem
                }));
            }
        } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Erro ao processar mensagem'
            }));
        }
    });

    ws.on('close', () => {
        for (const [userId, userWs] of connections.entries()) {
            if (userWs === ws) {
                connections.delete(userId);
                console.log('Usuário desconectado:', userId);
                break;
            }
        }
    });

    ws.on('error', (error) => {
        console.error('Erro na conexão WebSocket:', error);
    });
});

setInterval(() => {
    for (const [userId, ws] of connections.entries()) {
        if (ws.readyState === WebSocket.CLOSED) {
            connections.delete(userId);
            console.log('Conexão inativa removida:', userId);
        }
    }
}, 30000);

const PORT = process.env.PORT || 3001;

sequelize.sync().then(() => {
    console.log('Modelos sincronizados com o banco de dados');
    
    server.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao sincronizar modelos:', err);
});
