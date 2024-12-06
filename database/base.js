const { Sequelize } = require('sequelize');
require('dotenv').config();

const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")

dotenv.config()

const wss = new WebSocketServer({ port: process.env.PORT || 8080})

wss.on("connection", (ws) => {
    ws.on("error", console.error)

    ws.on("message", (data) => {
        wss.clients.forEach((client) => client.send(data.toString())) 
    })

    console.log("cliente conectado")
})

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'casameet',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: console.log 
});

sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso'))
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

module.exports = sequelize;
