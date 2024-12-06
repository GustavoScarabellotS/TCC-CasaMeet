module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    telefone: DataTypes.STRING(15),
    data_nascimento: DataTypes.DATE,
    cpf: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true
    },
    fk_id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'clientes',
    timestamps: false
  });

  Cliente.associate = function(models) {
    Cliente.belongsTo(models.Usuario, { foreignKey: 'fk_id_usuario' });
  };

  return Cliente;
};
