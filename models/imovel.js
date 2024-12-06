'use strict';
module.exports = (sequelize, DataTypes) => {
  const Imovel = sequelize.define('Imovel', {
    id_imovel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome_imovel: DataTypes.STRING,
    cep: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('cep');
        if (rawValue && rawValue.length === 8) {
          return rawValue.slice(0, 5) + '-' + rawValue.slice(5);
        }
        return rawValue;
      },
      set(value) {
        this.setDataValue('cep', value.replace(/\D/g, ''));
      }
    },
    descricao: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    categoria: DataTypes.STRING,
    valor: {
      type: DataTypes.DECIMAL(12, 2),
      get() {
        const rawValue = this.getDataValue('valor');
        return rawValue ? parseFloat(rawValue) : null;
      },
      set(value) {
        let cleanValue = value.toString().replace(/[^\d.,]/g, '');
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        this.setDataValue('valor', parseFloat(cleanValue));
      }
    },
    imagem: DataTypes.STRING,
    quartos: DataTypes.INTEGER,
    banheiros: DataTypes.INTEGER,
    andares: DataTypes.INTEGER,
    fk_id_dono: DataTypes.INTEGER
  }, {
    tableName: 'imovel',
    timestamps: false
  });

  Imovel.associate = function(models) {
    Imovel.belongsTo(models.Dono, {
      foreignKey: 'fk_id_dono',
      as: 'Dono'
    });
  };

  return Imovel;
};
