const moment = require('moment');
moment.locale('pt-br');

module.exports = (sequelize, DataTypes) => {
  const Denuncia = sequelize.define('Denuncia', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descricao: {
      type: DataTypes.STRING(2000),
      allowNull: false
    },
    categoria: {
      type: DataTypes.ENUM('fraude', 'linguagem ofensiva', 'discriminação', 'outros'),
      allowNull: false
    },
    usuario_email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fk_id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuario',
        key: 'id'
      }
    },
    fk_id_imovel: {
      type: DataTypes.INTEGER,
      references: {
        model: 'imovel',
        key: 'id_imovel'
      }
    },
    status: {
      type: DataTypes.ENUM('aberta', 'fechada'),
      defaultValue: 'aberta'
    },
    datadenuncia: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'denuncia',
    timestamps: false 
  });

  Denuncia.associate = function(models) {
    Denuncia.belongsTo(models.Usuario, {
      foreignKey: 'fk_id_usuario',
      as: 'Usuario'
    });
    
    Denuncia.belongsTo(models.Imovel, {
      foreignKey: 'fk_id_imovel',
      as: 'Imovel'
    });

    Denuncia.hasMany(models.Comentario, {
      foreignKey: 'fk_id_denuncia',
      as: 'Comentarios'
    });
  };

  return Denuncia;
};
