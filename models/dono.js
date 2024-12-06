'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dono = sequelize.define('Dono', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: DataTypes.STRING,
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false
    },
    endereco: DataTypes.STRING(255),
    telefone: DataTypes.STRING(15),
    datanasc: DataTypes.DATE,
    fk_id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuario',
        key: 'id'
      },
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'dono',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['fk_id_usuario']
      }
    ]
  });

  Dono.associate = function(models) {
    Dono.belongsTo(models.Usuario, {
      foreignKey: 'fk_id_usuario',
      as: 'Usuario'
    });
    Dono.hasMany(models.Imovel, {
      foreignKey: 'fk_id_dono',
      as: 'Imoveis'
    });
  };

  return Dono;
};
