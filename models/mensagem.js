'use strict';
module.exports = (sequelize, DataTypes) => {
    const Mensagem = sequelize.define('Mensagem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conteudo: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        remetente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id'
            }
        },
        destinatario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id'
            }
        },
        data_envio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        lida: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        editada: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletada: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'mensagens',
        timestamps: false
    });

    Mensagem.associate = function(models) {
        Mensagem.belongsTo(models.Usuario, {
            foreignKey: 'remetente_id',
            as: 'Remetente'
        });
        
        Mensagem.belongsTo(models.Usuario, {
            foreignKey: 'destinatario_id',
            as: 'Destinatario'
        });
    };

    return Mensagem;
}; 
 