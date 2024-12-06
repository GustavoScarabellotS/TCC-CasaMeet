module.exports = (sequelize, DataTypes) => {
  const Comentario = sequelize.define('Comentario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conteudo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fk_id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fk_id_denuncia: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'comentario',
    modelName: 'Comentario',
    timestamps: true
  });

  Comentario.associate = function(models) {
    Comentario.belongsTo(models.Usuario, { 
      foreignKey: 'fk_id_usuario',
      as: 'Usuario'
    });
    
    Comentario.belongsTo(models.Denuncia, { 
      foreignKey: 'fk_id_denuncia',
      as: 'Denuncia'
    });
  };

  return Comentario;
};
