module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    usuario_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    classficacao: {
      type: DataTypes.ENUM('0', '1', '2'),
      allowNull: true
    },
    duas_etapas: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'usuario',
    timestamps: false
  });

  Usuario.associate = function(models) {
    Usuario.hasOne(models.Dono, {
      foreignKey: 'fk_id_usuario',
      as: 'Dono'
    });

    Usuario.hasMany(models.Mensagem, {
      foreignKey: 'remetente_id',
      as: 'MensagensEnviadas'
    });

    Usuario.hasMany(models.Mensagem, {
      foreignKey: 'destinatario_id',
      as: 'MensagensRecebidas'
    });
  };

  return Usuario;
};
