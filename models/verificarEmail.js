module.exports = (sequelize, DataTypes) => {
    const VerificarEmail = sequelize.define('VerificarEmail', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        expirar: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'verificar_email',
        timestamps: false
    });

    return VerificarEmail;
};