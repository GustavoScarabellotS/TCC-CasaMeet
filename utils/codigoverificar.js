const { VerificarEmail } = require('../models');

async function armazenarCodigo(usuarioId, codigo) {
    try {
        const expirar = new Date();
        expirar.setMinutes(expirar.getMinutes() + 15);

        await VerificarEmail.create({
            usuario_id: usuarioId,
            codigo: codigo,
            expirar: expirar
        });

        return true;
    } catch (error) {
        console.error('Erro ao armazenar código:', error);
        throw error;
    }
}

module.exports = {
    armazenarCodigo
};