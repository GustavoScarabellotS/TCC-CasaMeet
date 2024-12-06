'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log('Iniciando carregamento dos models...');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log('Carregando model:', file);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    console.log('Model carregado:', model.name);
    db[model.name] = model;
  });


console.log('Models carregados:', Object.keys(db));
Object.keys(db).forEach(modelName => {
  console.log('Verificando associações para:', modelName);
  if (db[modelName].associate) {
    console.log('Configurando associações para:', modelName);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
